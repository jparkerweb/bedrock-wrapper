// ================================================================================
// == AWS Bedrock Example: Invoke a Model with a Streamed or Unstreamed Response ==
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

// --------------------------------------------
// -- import functions from bedrock-wrapper   --
// --     - bedrockWrapper                 --
// --     - listBedrockWrapperSupportedModels --
// --------------------------------------------
import {
    bedrockWrapper,
    listBedrockWrapperSupportedModels
} from "./bedrock-wrapper.js";

async function logOutput(message, type = 'info', writeToFile = true ) {
    if (writeToFile) {
        // Log to file
        await fs.appendFile('test-models-output.txt', message + '\n');
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
    }
}

async function testModel(model, awsCreds, testMessage, isStreaming, useConverseAPI, apiName) {
    const messages = [{ role: "user", content: testMessage }];
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: LLM_MAX_GEN_TOKENS,
        stream: isStreaming,
        temperature: LLM_TEMPERATURE,
        include_thinking_data: true,
    };

    let completeResponse = "";
    
    try {
        if (isStreaming) {
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: true, useConverseAPI })) {
                completeResponse += chunk;
            }
        } else {
            const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: true, useConverseAPI });
            for await (const data of response) {
                completeResponse += data;
            }
        }

        // Check if response is empty or undefined
        if (!completeResponse || completeResponse.trim() === '' || completeResponse.trim() === 'undefined') {
            throw new Error('Empty or invalid response received');
        }

        return { success: true, response: completeResponse.trim() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function main() {
    // Check for command-line arguments
    const args = process.argv.slice(2);
    const testBothAPIs = args.includes('--both') || args.includes('--compare');
    const useConverseOnly = args.includes('--converse');
    
    const testMessage = "Respond with exactly one word: What is 1+1?";
    
    // Determine test mode
    let testMode = "Invoke API";
    if (useConverseOnly) testMode = "Converse API";
    if (testBothAPIs) testMode = "Both APIs (Comparison)";
    
    // Clear output file and add header
    await fs.writeFile('test-models-output.txt', 
        `Test Mode: ${testMode}\n` +
        `Test Question: "${testMessage}"\n` +
        `Test Date: ${new Date().toISOString()}\n` +
        `${'='.repeat(60)}\n\n`
    );

    const supportedModels = await listBedrockWrapperSupportedModels();
    const availableModels = supportedModels.map(model => {
        const fixedJson = model
            .replace(/modelName": ([^,]+),/, 'modelName": "$1",')
            .replace(/modelId": ([^}]+)}/, 'modelId": "$1"}');
        return JSON.parse(fixedJson).modelName;
    });

    console.clear();
    await logOutput(`Starting tests with ${availableModels.length} models using ${testMode}...`, 'info');
    await logOutput(`Each model will be tested with streaming and non-streaming calls\n`, 'info');

    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    for (const model of availableModels) {
        await logOutput(`\n${'-'.repeat(60)}\nTesting ${model} ⇢`, 'running');

        if (testBothAPIs) {
            // Test both APIs and compare
            await logOutput(`\n📡 Testing with Invoke API:`, 'info');
            
            // Invoke API streaming test
            const invokeStreamResult = await testModel(model, awsCreds, testMessage, true, false, "Invoke API");
            if (invokeStreamResult.success) {
                await logOutput(`✓ Invoke API Streaming: "${invokeStreamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ Invoke API Streaming: ${invokeStreamResult.error}`, 'error');
            }

            // Invoke API non-streaming test
            const invokeNonStreamResult = await testModel(model, awsCreds, testMessage, false, false, "Invoke API");
            if (invokeNonStreamResult.success) {
                await logOutput(`✓ Invoke API Non-streaming: "${invokeNonStreamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ Invoke API Non-streaming: ${invokeNonStreamResult.error}`, 'error');
            }
            
            await logOutput(`\n📡 Testing with Converse API:`, 'info');
            
            // Converse API streaming test
            const converseStreamResult = await testModel(model, awsCreds, testMessage, true, true, "Converse API");
            if (converseStreamResult.success) {
                await logOutput(`✓ Converse API Streaming: "${converseStreamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ Converse API Streaming: ${converseStreamResult.error}`, 'error');
            }

            // Converse API non-streaming test
            const converseNonStreamResult = await testModel(model, awsCreds, testMessage, false, true, "Converse API");
            if (converseNonStreamResult.success) {
                await logOutput(`✓ Converse API Non-streaming: "${converseNonStreamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ Converse API Non-streaming: ${converseNonStreamResult.error}`, 'error');
            }
            
            // Compare results
            const invokeSuccess = invokeStreamResult.success && invokeNonStreamResult.success;
            const converseSuccess = converseStreamResult.success && converseNonStreamResult.success;
            
            if (invokeSuccess && converseSuccess) {
                await logOutput(`🔍 Both APIs successful for ${model}`, 'success');
            } else if (invokeSuccess || converseSuccess) {
                await logOutput(`⚠ Partial success for ${model}`, 'warning');
            } else {
                await logOutput(`❌ Both APIs failed for ${model}`, 'error');
            }
            
        } else {
            // Test single API
            const useConverseAPI = useConverseOnly;
            const apiName = useConverseAPI ? "Converse API" : "Invoke API";
            
            // Test streaming
            const streamResult = await testModel(model, awsCreds, testMessage, true, useConverseAPI, apiName);
            if (streamResult.success) {
                await logOutput(`✓ ${apiName} Streaming: "${streamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ ${apiName} Streaming: ${streamResult.error}`, 'error');
            }

            // Test non-streaming
            const nonStreamResult = await testModel(model, awsCreds, testMessage, false, useConverseAPI, apiName);
            if (nonStreamResult.success) {
                await logOutput(`✓ ${apiName} Non-streaming: "${nonStreamResult.response}"`, 'success');
            } else {
                await logOutput(`✗ ${apiName} Non-streaming: ${nonStreamResult.error}`, 'error');
            }
        }
        
        console.log('\n' + '-'.repeat(40));
    }

    await logOutput('\nTesting complete! Check test-models-output.txt for full test results.', 'info', false);
}

// Add usage info
console.log('Model Test Usage:');
console.log('  npm run test                  # Test with Invoke API (default)');
console.log('  npm run test -- --converse       # Test with Converse API only');
console.log('  npm run test -- --both           # Test both APIs and compare');
console.log('\n');

main().catch(async (error) => {
    await logOutput(`Fatal Error: ${error.message}`, 'error');
    console.error(error);
});
