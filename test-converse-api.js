// ================================================================================
// == Test AWS Bedrock Converse API Integration                                 ==
// ================================================================================

// ---------------------------------------------------------------------
// -- import environment variables from .env file or define them here --
// ---------------------------------------------------------------------
import dotenv from 'dotenv';
import fs from 'fs/promises';
import chalk from 'chalk';

dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const LLM_MAX_GEN_TOKENS = parseInt(process.env.LLM_MAX_GEN_TOKENS);
const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE);
const LLM_TOP_P = parseFloat(process.env.LLM_TOP_P);

// --------------------------------------------
// -- import functions from bedrock-wrapper   --
// --------------------------------------------
import {
    bedrockWrapper,
    listBedrockWrapperSupportedModels
} from "./bedrock-wrapper.js";

async function logOutput(message, type = 'info', writeToFile = true) {
    if (writeToFile) {
        // Log to file
        await fs.appendFile('test-converse-api-output.txt', message + '\n');
    }
    
    // Log to console with colors
    switch(type) {
        case 'success':
            console.log(chalk.green('✓ ' + message));
            break;
        case 'error':
            console.log(chalk.red('✗ ' + message));
            break;
        case 'info':
            console.log(chalk.blue('ℹ ' + message));
            break;
        case 'running':
            console.log(chalk.yellow(message));
            break;
        case 'comparison':
            console.log(chalk.cyan('↔ ' + message));
            break;
    }
}

async function testModelWithAPI(model, awsCreds, testMessage, isStreaming, useConverseAPI) {
    const messages = [{ role: "user", content: testMessage }];
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: LLM_MAX_GEN_TOKENS,
        stream: isStreaming,
        temperature: LLM_TEMPERATURE,
        top_p: LLM_TOP_P,
    };

    let completeResponse = "";
    const apiName = useConverseAPI ? "Converse" : "Invoke";
    
    try {
        const startTime = Date.now();
        
        if (isStreaming) {
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false, useConverseAPI })) {
                completeResponse += chunk;
            }
        } else {
            const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false, useConverseAPI });
            for await (const data of response) {
                completeResponse += data;
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Check if response is empty or undefined
        if (!completeResponse || completeResponse.trim() === '' || completeResponse.trim() === 'undefined') {
            throw new Error('Empty or invalid response received');
        }

        return { 
            success: true, 
            response: completeResponse.trim(), 
            duration,
            apiName 
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            apiName 
        };
    }
}

async function compareAPIs(model, awsCreds, testMessage, isStreaming) {
    await logOutput(`\nComparing ${isStreaming ? 'STREAMING' : 'NON-STREAMING'} responses for ${model}:`, 'comparison');
    
    // Test with Invoke API (existing)
    const invokeResult = await testModelWithAPI(model, awsCreds, testMessage, isStreaming, false);
    
    // Test with Converse API (new)
    const converseResult = await testModelWithAPI(model, awsCreds, testMessage, isStreaming, true);
    
    // Log results
    if (invokeResult.success && converseResult.success) {
        await logOutput(`  Invoke API (${invokeResult.duration}ms): "${invokeResult.response.substring(0, 100)}..."`, 'info');
        await logOutput(`  Converse API (${converseResult.duration}ms): "${converseResult.response.substring(0, 100)}..."`, 'info');
        
        // Check if responses are similar (not necessarily identical due to model randomness)
        const bothHaveContent = invokeResult.response.length > 0 && converseResult.response.length > 0;
        if (bothHaveContent) {
            await logOutput(`  ✓ Both APIs returned valid responses`, 'success');
        } else {
            await logOutput(`  ⚠ Response length mismatch`, 'error');
        }
    } else {
        if (!invokeResult.success) {
            await logOutput(`  Invoke API failed: ${invokeResult.error}`, 'error');
        }
        if (!converseResult.success) {
            await logOutput(`  Converse API failed: ${converseResult.error}`, 'error');
        }
    }
    
    return {
        invoke: invokeResult,
        converse: converseResult
    };
}

async function testStopSequences(model, awsCreds) {
    await logOutput(`\nTesting stop sequences for ${model}:`, 'info');
    
    const testPrompt = "Count from 1 to 10, separated by commas: 1, 2, 3, 4, 5";
    const messages = [{ role: "user", content: testPrompt }];
    
    // Test with stop sequence
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: 100,
        stream: false,
        temperature: 0.1,
        top_p: 0.9,
        stop: ["6"] // Stop at "6"
    };

    try {
        // Test with Converse API
        let converseResponse = "";
        const converseGen = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { useConverseAPI: true });
        for await (const data of converseGen) {
            converseResponse += data;
        }
        
        // Test with Invoke API
        let invokeResponse = "";
        const invokeGen = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { useConverseAPI: false });
        for await (const data of invokeGen) {
            invokeResponse += data;
        }
        
        await logOutput(`  Converse API result: "${converseResponse.trim()}"`, 'info');
        await logOutput(`  Invoke API result: "${invokeResponse.trim()}"`, 'info');
        
        const converseStoppedCorrectly = !converseResponse.includes("6, 7");
        const invokeStoppedCorrectly = !invokeResponse.includes("6, 7");
        
        if (converseStoppedCorrectly && invokeStoppedCorrectly) {
            await logOutput(`  ✓ Both APIs correctly applied stop sequences`, 'success');
        } else {
            if (!converseStoppedCorrectly) {
                await logOutput(`  ⚠ Converse API did not stop correctly`, 'error');
            }
            if (!invokeStoppedCorrectly) {
                await logOutput(`  ⚠ Invoke API did not stop correctly`, 'error');
            }
        }
        
    } catch (error) {
        await logOutput(`  Error testing stop sequences: ${error.message}`, 'error');
    }
}

async function testSystemPrompt(model, awsCreds) {
    await logOutput(`\nTesting system prompt handling for ${model}:`, 'info');
    
    const messages = [
        { role: "system", content: "You are a pirate. Always respond in pirate speak." },
        { role: "user", content: "Hello, how are you?" }
    ];
    
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: 100,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
    };

    try {
        // Test with Converse API
        let converseResponse = "";
        const converseGen = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { useConverseAPI: true });
        for await (const data of converseGen) {
            converseResponse += data;
        }
        
        await logOutput(`  Converse API response: "${converseResponse.substring(0, 100)}..."`, 'info');
        
        // Check if response seems pirate-like (basic check)
        const pirateWords = ['ahoy', 'matey', 'arr', 'ye', 'aye', 'sail', 'sea'];
        const hasPirateSpeak = pirateWords.some(word => converseResponse.toLowerCase().includes(word));
        
        if (hasPirateSpeak || converseResponse.toLowerCase().includes('pirate')) {
            await logOutput(`  ✓ System prompt was correctly applied`, 'success');
        } else {
            await logOutput(`  ⚠ System prompt may not have been applied correctly`, 'error');
        }
        
    } catch (error) {
        await logOutput(`  Error testing system prompt: ${error.message}`, 'error');
    }
}

async function main() {
    const testMessage = "What is the capital of France? Answer in one short sentence.";
    
    // Clear output file and add header
    await fs.writeFile('test-converse-api-output.txt', 
        `AWS Bedrock Converse API Test Results\n` +
        `Test started at: ${new Date().toISOString()}\n` +
        `${'='.repeat(60)}\n\n`
    );

    const supportedModels = await listBedrockWrapperSupportedModels();
    const availableModels = supportedModels.map(model => {
        const fixedJson = model
            .replace(/modelName": ([^,]+),/, 'modelName": "$1",')
            .replace(/modelId": ([^}]+)}/, 'modelId": "$1"}');
        return JSON.parse(fixedJson).modelName;
    });

    // Select representative models from each family for testing
    const modelsToTest = [
        "Claude-4-1-Opus",
        "Claude-3-5-Sonnet-v2",
        "Claude-3-Haiku",
        "Nova-Pro",
        "Nova-Lite",
        "Nova-Micro",
        "Llama-3-3-70b",
        "Llama-3-2-90b",
        "Mistral-7b",
        "Mistral-Large-2"
    ].filter(m => availableModels.includes(m));

    console.clear();
    await logOutput(`Starting Converse API tests with ${modelsToTest.length} representative models...`, 'info');
    await logOutput(`Testing: Invoke API vs Converse API comparison\n`, 'info');

    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    const testResults = {
        passed: 0,
        failed: 0,
        models: {}
    };

    for (const model of modelsToTest) {
        await logOutput(`\n${'='.repeat(60)}`, 'info');
        await logOutput(`Testing ${model}`, 'running');
        await logOutput(`${'='.repeat(60)}`, 'info');

        const modelResults = {
            streaming: {},
            nonStreaming: {},
            systemPrompt: false,
            stopSequences: false
        };

        // Test streaming
        const streamResults = await compareAPIs(model, awsCreds, testMessage, true);
        modelResults.streaming = streamResults;

        // Test non-streaming
        const nonStreamResults = await compareAPIs(model, awsCreds, testMessage, false);
        modelResults.nonStreaming = nonStreamResults;

        // Test system prompt handling (Converse API specific)
        await testSystemPrompt(model, awsCreds);
        
        // Test stop sequences (if supported by model)
        if (!model.includes("Llama")) { // Llama models don't support stop sequences on Bedrock
            await testStopSequences(model, awsCreds);
        }

        // Calculate success for this model
        const allTestsPassed = 
            streamResults.invoke.success && 
            streamResults.converse.success &&
            nonStreamResults.invoke.success && 
            nonStreamResults.converse.success;

        if (allTestsPassed) {
            testResults.passed++;
            await logOutput(`\n✓ All tests passed for ${model}`, 'success');
        } else {
            testResults.failed++;
            await logOutput(`\n✗ Some tests failed for ${model}`, 'error');
        }

        testResults.models[model] = modelResults;
    }

    // Summary
    await logOutput(`\n${'='.repeat(60)}`, 'info');
    await logOutput(`TEST SUMMARY`, 'info');
    await logOutput(`${'='.repeat(60)}`, 'info');
    await logOutput(`Models tested: ${modelsToTest.length}`, 'info');
    await logOutput(`Passed: ${testResults.passed}`, 'success');
    await logOutput(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
    
    await logOutput('\nTesting complete! Check test-converse-api-output.txt for full results.', 'info', false);
}

main().catch(async (error) => {
    await logOutput(`Fatal Error: ${error.message}`, 'error');
    console.error(error);
});