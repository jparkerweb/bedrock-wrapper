import { bedrockWrapper } from "./bedrock-wrapper.js";
import { bedrock_models } from "./bedrock-models.js";
import dotenv from 'dotenv';
import fs from 'fs/promises';
import chalk from 'chalk';

dotenv.config();

const awsCreds = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

async function logOutput(message, type = 'info', writeToFile = true) {
    if (writeToFile) {
        // Log to file
        await fs.appendFile('test-vision-models-output.txt', message + '\n');
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
        default:
            console.log(message);
    }
}

async function testVisionCapabilities() {
    // Read and convert image to base64
    const imageBuffer = await fs.readFile('./test-image.jpg');
    const base64Image = imageBuffer.toString('base64');
    
    const testPrompt = "What's in this image? Please describe it in detail.";

    const messages = [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: testPrompt
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                        // url: "https://github.com/jparkerweb/ref/blob/main/equill-labs/bedrock-proxy-endpoint/bedrock-proxy-endpoint.png?raw=true"
                    }
                }
            ]
        }
    ];

    // Filter vision-capable models from bedrock_models
    const visionModels = bedrock_models
        .filter(model => model.vision === true)
        .map(model => model.modelName);

    // Clear output file and add header
    await fs.writeFile('test-vision-models-output.txt', 
        `Vision Test Results\n` +
        `Test Question: "${testPrompt}"\n` +
        `Test Date: ${new Date().toISOString()}\n` +
        `${'='.repeat(50)}\n\n`
    );

    console.clear();
    await logOutput(`Starting vision tests with ${visionModels.length} models...`, 'info');
    await logOutput(`Testing image description capabilities\n`, 'info');

    for (const model of visionModels) {
        await logOutput(`\n${'-'.repeat(50)}\nTesting ${model} ⇢`, 'running');
        
        const openaiChatCompletionsCreateObject = {
            messages,
            model,
            max_tokens: 1000,
            stream: true,
            temperature: 0.7
        };

        try {
            console.log(`\nSending request to ${model}...`);
            
            let response = "";
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false })) {
                response += chunk;
                process.stdout.write(chunk);
            }
            
            // Write successful response to file
            await logOutput(`\nModel: ${model}`, 'success');
            await logOutput(`Response: ${response.trim()}\n`, 'info', true);
            
        } catch (error) {
            const errorMessage = `Error with ${model}: ${error.message}`;
            await logOutput(errorMessage, 'error');
            
            // Log the full error details to file
            if (error.response) {
                await fs.appendFile('test-vision-models-output.txt', 
                    `Error details: ${JSON.stringify(error.response, null, 2)}\n\n`
                );
            }
        }
        
        console.log("\n-------------------");
    }
    
    await logOutput('\nVision testing complete! Check test-vision-models-output.txt for full results.', 'info', false);
}

testVisionCapabilities().catch(console.error);