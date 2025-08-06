// ================================================================================
// == AWS Bedrock Stop Sequences Test - Validates stop sequences implementation ==
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

// --------------------------------------------
// -- import functions from bedrock-wrapper   --
// --------------------------------------------
import {
    bedrockWrapper,
    listBedrockWrapperSupportedModels
} from "./bedrock-wrapper.js";

async function logOutput(message, type = 'info', writeToFile = true ) {
    if (writeToFile) {
        // Log to file
        await fs.appendFile('test-stop-sequences-output.txt', message + '\n');
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
        case 'warning':
            console.log(chalk.magenta('⚠ ' + message));
            break;
    }
}

async function testStopSequence(model, awsCreds, testCase, isStreaming) {
    const messages = [{ role: "user", content: testCase.prompt }];
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: 200,
        stream: isStreaming,
        temperature: 0.1,
        top_p: 0.9,
        stop_sequences: testCase.stopSequences
    };

    let completeResponse = "";
    
    try {
        if (isStreaming) {
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false })) {
                completeResponse += chunk;
            }
        } else {
            const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false });
            for await (const data of response) {
                completeResponse += data;
            }
        }

        // Analyze if stop sequence worked
        const result = {
            success: true,
            response: completeResponse.trim(),
            stoppedCorrectly: false,
            analysis: ""
        };

        // Use the expectedBehavior function to determine if stopping worked correctly
        if (testCase.expectedBehavior) {
            result.stoppedCorrectly = testCase.expectedBehavior(completeResponse);
            result.analysis = result.stoppedCorrectly ? 
                "Response stopped at the correct point" : 
                "Response did not stop at the expected point";
        } else {
            // Generic check - if response is shorter than expected, it probably stopped
            result.stoppedCorrectly = completeResponse.length < 100; // Assume short response means it stopped
            result.analysis = result.stoppedCorrectly ? 
                "Response appears to have stopped early (good sign)" : 
                "Response seems to have continued beyond expected stop point";
        }

        return result;
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            response: "",
            stoppedCorrectly: false,
            analysis: "Error occurred"
        };
    }
}

// Test cases designed to validate stop sequences
const stopSequenceTestCases = [
    {
        name: "Number sequence test",
        prompt: "Count from 1 to 10, separated by commas: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
        stopSequences: ["7"],
        expectedBehavior: (response) => {
            // Should stop at or before 7, and definitely not continue to 8, 9, 10
            return response.includes("6") && !response.includes("8") && !response.includes("9") && !response.includes("10");
        }
    },
    {
        name: "Word-based stop test",
        prompt: "List the days of the week in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
        stopSequences: ["Friday"],
        expectedBehavior: (response) => {
            // Should stop at or before Friday, and not continue to Saturday/Sunday
            return response.includes("Thursday") && !response.includes("Saturday") && !response.includes("Sunday");
        }
    },
    {
        name: "Multi-stop sequence test",
        prompt: "Write the alphabet: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z",
        stopSequences: ["G", "H", "I"],
        expectedBehavior: (response) => {
            // Should stop at any of G, H, or I and not continue beyond
            return response.includes("F") && !response.includes("J") && !response.includes("K") && !response.includes("L");
        }
    },
    {
        name: "Sentence completion test",
        prompt: "Complete this story: Once upon a time, there was a brave knight who loved to explore. One day, he found a mysterious cave. Inside the cave, he discovered a magical sword. With the sword in hand, he continued deeper into the darkness.",
        stopSequences: ["sword"],
        expectedBehavior: (response) => {
            // Should stop at or shortly after "sword" and not continue the full story
            return response.includes("cave") && response.length < 200; // Shortened response
        }
    },
    {
        name: "Special character stop test", 
        prompt: "Generate a list with bullet points:\n• First item\n• Second item\n• Third item\n• Fourth item\n• Fifth item",
        stopSequences: ["• Third"],
        expectedBehavior: (response) => {
            // Should stop at or before "• Third" and not continue to Fourth/Fifth
            return response.includes("Second") && !response.includes("Fourth") && !response.includes("Fifth");
        }
    }
];

async function main() {
    // Clear output file and add header
    const timestamp = new Date().toISOString();
    await fs.writeFile('test-stop-sequences-output.txt', 
        `Stop Sequences Test Results - ${timestamp}\n` +
        `${'='.repeat(80)}\n\n` +
        `This test validates that stop sequences work correctly across all models.\n` +
        `Each model is tested with multiple stop sequence scenarios.\n\n`
    );

    const supportedModels = await listBedrockWrapperSupportedModels();
    const availableModels = supportedModels.map(model => {
        return JSON.parse(model).modelName;
    });

    console.clear();
    await logOutput(`Starting stop sequences tests with ${availableModels.length} models...`, 'info');
    await logOutput(`Testing ${stopSequenceTestCases.length} different stop sequence scenarios\n`, 'info');

    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    // Track overall results
    const modelResults = {};

    // Test a subset of models for efficiency (you can test all if needed)
    const modelsToTest = [
        "Claude-4-1-Opus",
        "Claude-3-5-Sonnet-v2",
        "Claude-3-Haiku", 
        "Nova-Pro",
        "Nova-Lite",
        "GPT-OSS-120B",
        "GPT-OSS-120B-Thinking",
        "GPT-OSS-20B",
        "GPT-OSS-20B-Thinking",
        "Llama-3-3-70b",
        "Mistral-7b"
    ].filter(m => availableModels.includes(m));

    await logOutput(`\nTesting ${modelsToTest.length} representative models...\n`, 'info');

    for (const model of modelsToTest) {
        await logOutput(`\n${'='.repeat(60)}`, 'info');
        await logOutput(`Testing ${model}`, 'running');
        await logOutput(`${'='.repeat(60)}`, 'info');

        modelResults[model] = {
            streaming: { passed: 0, failed: 0 },
            nonStreaming: { passed: 0, failed: 0 }
        };

        for (const testCase of stopSequenceTestCases) {
            await logOutput(`\n▶ Test Case: ${testCase.name}`, 'info');
            await logOutput(`  Prompt: "${testCase.prompt.substring(0, 50)}..."`, 'info');
            await logOutput(`  Stop sequences: [${testCase.stopSequences.join(', ')}]`, 'info');

            // Test streaming
            await logOutput(`  Testing streaming...`, 'info');
            const streamResult = await testStopSequence(model, awsCreds, testCase, true);
            
            if (streamResult.success) {
                if (streamResult.stoppedCorrectly) {
                    await logOutput(`  ✓ Streaming: PASSED - ${streamResult.analysis}`, 'success');
                    modelResults[model].streaming.passed++;
                } else {
                    await logOutput(`  ✗ Streaming: FAILED - ${streamResult.analysis}`, 'warning');
                    modelResults[model].streaming.failed++;
                }
                await logOutput(`  Response: "${streamResult.response.substring(0, 100)}..."`, 'info');
            } else {
                await logOutput(`  ✗ Streaming: ERROR - ${streamResult.error}`, 'error');
                modelResults[model].streaming.failed++;
            }

            // Test non-streaming
            await logOutput(`  Testing non-streaming...`, 'info');
            const nonStreamResult = await testStopSequence(model, awsCreds, testCase, false);
            
            if (nonStreamResult.success) {
                if (nonStreamResult.stoppedCorrectly) {
                    await logOutput(`  ✓ Non-streaming: PASSED - ${nonStreamResult.analysis}`, 'success');
                    modelResults[model].nonStreaming.passed++;
                } else {
                    await logOutput(`  ✗ Non-streaming: FAILED - ${nonStreamResult.analysis}`, 'warning');
                    modelResults[model].nonStreaming.failed++;
                }
                await logOutput(`  Response: "${nonStreamResult.response.substring(0, 100)}..."`, 'info');
            } else {
                await logOutput(`  ✗ Non-streaming: ERROR - ${nonStreamResult.error}`, 'error');
                modelResults[model].nonStreaming.failed++;
            }
        }
    }

    // Summary
    await logOutput(`\n\n${'='.repeat(80)}`, 'info');
    await logOutput('SUMMARY', 'running');
    await logOutput(`${'='.repeat(80)}\n`, 'info');

    for (const [model, results] of Object.entries(modelResults)) {
        const streamingRate = (results.streaming.passed / (results.streaming.passed + results.streaming.failed) * 100).toFixed(1);
        const nonStreamingRate = (results.nonStreaming.passed / (results.nonStreaming.passed + results.nonStreaming.failed) * 100).toFixed(1);
        
        await logOutput(`${model}:`, 'info');
        await logOutput(`  Streaming:     ${results.streaming.passed}/${results.streaming.passed + results.streaming.failed} passed (${streamingRate}%)`, 
            streamingRate > 80 ? 'success' : 'warning');
        await logOutput(`  Non-streaming: ${results.nonStreaming.passed}/${results.nonStreaming.passed + results.nonStreaming.failed} passed (${nonStreamingRate}%)`, 
            nonStreamingRate > 80 ? 'success' : 'warning');
    }

    await logOutput('\nTesting complete! Check test-stop-sequences-output.txt for full results.', 'info', false);
}

main().catch(async (error) => {
    await logOutput(`Fatal Error: ${error.message}`, 'error');
    console.error(error);
});