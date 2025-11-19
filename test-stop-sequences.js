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

async function testStopSequence(model, awsCreds, testCase, isStreaming, useConverseAPI, apiName) {
    const messages = [{ role: "user", content: testCase.prompt }];
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: 200,
        stream: isStreaming,
        temperature: 0.1,
        stop_sequences: testCase.stopSequences
    };

    let completeResponse = "";
    
    try {
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
    // Check for command-line arguments
    const args = process.argv.slice(2);
    const testBothAPIs = args.includes('--both') || args.includes('--compare');
    const useConverseOnly = args.includes('--converse');
    
    // Determine test mode
    let testMode = "Invoke API";
    if (useConverseOnly) testMode = "Converse API";
    if (testBothAPIs) testMode = "Both APIs (Comparison)";
    
    // Clear output file and add header
    const timestamp = new Date().toISOString();
    await fs.writeFile('test-stop-sequences-output.txt', 
        `Stop Sequences Test Results - ${testMode}\n` +
        `Test Date: ${timestamp}\n` +
        `${'='.repeat(80)}\n\n` +
        `This test validates that stop sequences work correctly across all models.\n` +
        `Each model is tested with multiple stop sequence scenarios.\n\n`
    );

    const supportedModels = await listBedrockWrapperSupportedModels();
    const availableModels = supportedModels.map(model => {
        return JSON.parse(model).modelName;
    });

    console.clear();
    await logOutput(`Starting stop sequences tests with ${availableModels.length} models using ${testMode}...`, 'info');
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

        if (testBothAPIs) {
            modelResults[model] = {
                invoke: { streaming: { passed: 0, failed: 0 }, nonStreaming: { passed: 0, failed: 0 } },
                converse: { streaming: { passed: 0, failed: 0 }, nonStreaming: { passed: 0, failed: 0 } }
            };
        } else {
            modelResults[model] = {
                streaming: { passed: 0, failed: 0 },
                nonStreaming: { passed: 0, failed: 0 }
            };
        }

        for (const testCase of stopSequenceTestCases) {
            await logOutput(`\n▶ Test Case: ${testCase.name}`, 'info');
            await logOutput(`  Prompt: "${testCase.prompt.substring(0, 50)}..."`, 'info');
            await logOutput(`  Stop sequences: [${testCase.stopSequences.join(', ')}]`, 'info');

            if (testBothAPIs) {
                // Test both APIs and compare
                await logOutput(`\n  📡 Testing with Invoke API:`, 'info');
                
                // Invoke API streaming test
                const invokeStreamResult = await testStopSequence(model, awsCreds, testCase, true, false, "Invoke API");
                if (invokeStreamResult.success) {
                    if (invokeStreamResult.stoppedCorrectly) {
                        await logOutput(`    ✓ Invoke Streaming: PASSED - ${invokeStreamResult.analysis}`, 'success');
                        modelResults[model].invoke.streaming.passed++;
                    } else {
                        await logOutput(`    ✗ Invoke Streaming: FAILED - ${invokeStreamResult.analysis}`, 'warning');
                        modelResults[model].invoke.streaming.failed++;
                    }
                    await logOutput(`    Response: "${invokeStreamResult.response.substring(0, 100)}..."`, 'info');
                } else {
                    await logOutput(`    ✗ Invoke Streaming: ERROR - ${invokeStreamResult.error}`, 'error');
                    modelResults[model].invoke.streaming.failed++;
                }

                // Invoke API non-streaming test
                const invokeNonStreamResult = await testStopSequence(model, awsCreds, testCase, false, false, "Invoke API");
                if (invokeNonStreamResult.success) {
                    if (invokeNonStreamResult.stoppedCorrectly) {
                        await logOutput(`    ✓ Invoke Non-streaming: PASSED - ${invokeNonStreamResult.analysis}`, 'success');
                        modelResults[model].invoke.nonStreaming.passed++;
                    } else {
                        await logOutput(`    ✗ Invoke Non-streaming: FAILED - ${invokeNonStreamResult.analysis}`, 'warning');
                        modelResults[model].invoke.nonStreaming.failed++;
                    }
                    await logOutput(`    Response: "${invokeNonStreamResult.response.substring(0, 100)}..."`, 'info');
                } else {
                    await logOutput(`    ✗ Invoke Non-streaming: ERROR - ${invokeNonStreamResult.error}`, 'error');
                    modelResults[model].invoke.nonStreaming.failed++;
                }

                await logOutput(`\n  📡 Testing with Converse API:`, 'info');
                
                // Converse API streaming test
                const converseStreamResult = await testStopSequence(model, awsCreds, testCase, true, true, "Converse API");
                if (converseStreamResult.success) {
                    if (converseStreamResult.stoppedCorrectly) {
                        await logOutput(`    ✓ Converse Streaming: PASSED - ${converseStreamResult.analysis}`, 'success');
                        modelResults[model].converse.streaming.passed++;
                    } else {
                        await logOutput(`    ✗ Converse Streaming: FAILED - ${converseStreamResult.analysis}`, 'warning');
                        modelResults[model].converse.streaming.failed++;
                    }
                    await logOutput(`    Response: "${converseStreamResult.response.substring(0, 100)}..."`, 'info');
                } else {
                    await logOutput(`    ✗ Converse Streaming: ERROR - ${converseStreamResult.error}`, 'error');
                    modelResults[model].converse.streaming.failed++;
                }

                // Converse API non-streaming test
                const converseNonStreamResult = await testStopSequence(model, awsCreds, testCase, false, true, "Converse API");
                if (converseNonStreamResult.success) {
                    if (converseNonStreamResult.stoppedCorrectly) {
                        await logOutput(`    ✓ Converse Non-streaming: PASSED - ${converseNonStreamResult.analysis}`, 'success');
                        modelResults[model].converse.nonStreaming.passed++;
                    } else {
                        await logOutput(`    ✗ Converse Non-streaming: FAILED - ${converseNonStreamResult.analysis}`, 'warning');
                        modelResults[model].converse.nonStreaming.failed++;
                    }
                    await logOutput(`    Response: "${converseNonStreamResult.response.substring(0, 100)}..."`, 'info');
                } else {
                    await logOutput(`    ✗ Converse Non-streaming: ERROR - ${converseNonStreamResult.error}`, 'error');
                    modelResults[model].converse.nonStreaming.failed++;
                }
                
            } else {
                // Test single API
                const useConverseAPI = useConverseOnly;
                const apiName = useConverseAPI ? "Converse API" : "Invoke API";
                
                // Test streaming
                await logOutput(`  Testing streaming with ${apiName}...`, 'info');
                const streamResult = await testStopSequence(model, awsCreds, testCase, true, useConverseAPI, apiName);
                
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
                await logOutput(`  Testing non-streaming with ${apiName}...`, 'info');
                const nonStreamResult = await testStopSequence(model, awsCreds, testCase, false, useConverseAPI, apiName);
                
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
    }

    // Summary
    await logOutput(`\n\n${'='.repeat(80)}`, 'info');
    await logOutput('SUMMARY', 'running');
    await logOutput(`${'='.repeat(80)}\n`, 'info');

    for (const [model, results] of Object.entries(modelResults)) {
        await logOutput(`${model}:`, 'info');
        
        if (testBothAPIs) {
            // Both APIs summary
            const invokeStreamingRate = (results.invoke.streaming.passed / (results.invoke.streaming.passed + results.invoke.streaming.failed) * 100).toFixed(1);
            const invokeNonStreamingRate = (results.invoke.nonStreaming.passed / (results.invoke.nonStreaming.passed + results.invoke.nonStreaming.failed) * 100).toFixed(1);
            const converseStreamingRate = (results.converse.streaming.passed / (results.converse.streaming.passed + results.converse.streaming.failed) * 100).toFixed(1);
            const converseNonStreamingRate = (results.converse.nonStreaming.passed / (results.converse.nonStreaming.passed + results.converse.nonStreaming.failed) * 100).toFixed(1);
            
            await logOutput(`  Invoke API:`, 'info');
            await logOutput(`    Streaming:     ${results.invoke.streaming.passed}/${results.invoke.streaming.passed + results.invoke.streaming.failed} passed (${invokeStreamingRate}%)`, 
                invokeStreamingRate > 80 ? 'success' : 'warning');
            await logOutput(`    Non-streaming: ${results.invoke.nonStreaming.passed}/${results.invoke.nonStreaming.passed + results.invoke.nonStreaming.failed} passed (${invokeNonStreamingRate}%)`, 
                invokeNonStreamingRate > 80 ? 'success' : 'warning');
            
            await logOutput(`  Converse API:`, 'info');
            await logOutput(`    Streaming:     ${results.converse.streaming.passed}/${results.converse.streaming.passed + results.converse.streaming.failed} passed (${converseStreamingRate}%)`, 
                converseStreamingRate > 80 ? 'success' : 'warning');
            await logOutput(`    Non-streaming: ${results.converse.nonStreaming.passed}/${results.converse.nonStreaming.passed + results.converse.nonStreaming.failed} passed (${converseNonStreamingRate}%)`, 
                converseNonStreamingRate > 80 ? 'success' : 'warning');
                
        } else {
            // Single API summary
            const streamingRate = (results.streaming.passed / (results.streaming.passed + results.streaming.failed) * 100).toFixed(1);
            const nonStreamingRate = (results.nonStreaming.passed / (results.nonStreaming.passed + results.nonStreaming.failed) * 100).toFixed(1);
            
            await logOutput(`  Streaming:     ${results.streaming.passed}/${results.streaming.passed + results.streaming.failed} passed (${streamingRate}%)`, 
                streamingRate > 80 ? 'success' : 'warning');
            await logOutput(`  Non-streaming: ${results.nonStreaming.passed}/${results.nonStreaming.passed + results.nonStreaming.failed} passed (${nonStreamingRate}%)`, 
                nonStreamingRate > 80 ? 'success' : 'warning');
        }
    }

    await logOutput('\nTesting complete! Check test-stop-sequences-output.txt for full results.', 'info', false);
}

// Add usage info
console.log('Stop Sequences Test Usage:');
console.log('  npm run test-stop                # Test with Invoke API (default)');
console.log('  npm run test-stop -- --converse      # Test with Converse API only');
console.log('  npm run test-stop -- --both          # Test both APIs and compare');
console.log('\n');

main().catch(async (error) => {
    await logOutput(`Fatal Error: ${error.message}`, 'error');
    console.error(error);
});