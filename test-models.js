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
const LLM_TOP_P = parseFloat(process.env.LLM_TOP_P);

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

async function testModel(model, awsCreds, testMessage, isStreaming) {
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
    
    try {
        if (isStreaming) {
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: true })) {
                completeResponse += chunk;
            }
        } else {
            const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: true });
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
    const testMessage = "Respond with exactly one word: What is 1+1?";
    
    // Clear output file and add header
    await fs.writeFile('test-models-output.txt', 
        `Test Question: "${testMessage}"\n` +
        `=`.repeat(50) + '\n\n'
    );

    const supportedModels = await listBedrockWrapperSupportedModels();
    const availableModels = supportedModels.map(model => {
        const fixedJson = model
            .replace(/modelName": ([^,]+),/, 'modelName": "$1",')
            .replace(/modelId": ([^}]+)}/, 'modelId": "$1"}');
        return JSON.parse(fixedJson).modelName;
    });

    console.clear();
    await logOutput(`Starting tests with ${availableModels.length} models...`, 'info');
    await logOutput(`Each model will be tested with streaming and non-streaming calls\n`, 'info');

    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    for (const model of availableModels) {
        await logOutput(`\n${'-'.repeat(50)}\nTesting ${model} ⇢`, 'running');

        // Test streaming
        const streamResult = await testModel(model, awsCreds, testMessage, true);
        if (streamResult.success) {
            await logOutput(`Streaming test passed for ${model}: "${streamResult.response}"`, 'success');
        } else {
            await logOutput(`Streaming test failed for ${model}: ${streamResult.error}`, 'error');
        }

        // Test non-streaming
        const nonStreamResult = await testModel(model, awsCreds, testMessage, false);
        if (nonStreamResult.success) {
            await logOutput(`Non-streaming test passed for ${model}: "${nonStreamResult.response}"`, 'success');
        } else {
            await logOutput(`Non-streaming test failed for ${model}: ${nonStreamResult.error}`, 'error');
        }
        
        console.log(''); // Add blank line between models
    }

    await logOutput('Testing complete! Check test-models-output.txt for full test results.', 'info', false);
}

main().catch(async (error) => {
    await logOutput(`Fatal Error: ${error.message}`, 'error');
    console.error(error);
});
