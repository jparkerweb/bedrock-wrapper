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

async function testVisionModel(model, messages, useConverseAPI, apiName) {
    const openaiChatCompletionsCreateObject = {
        messages,
        model,
        max_tokens: 1000,
        stream: true,
        temperature: 0.7
    };

    try {
        console.log(`\nSending request to ${model} using ${apiName}...`);
        
        let response = "";
        for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: false, useConverseAPI })) {
            response += chunk;
            process.stdout.write(chunk);
        }
        
        return { success: true, response: response.trim() };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testVisionCapabilities() {
    // Check for command-line arguments
    const args = process.argv.slice(2);
    const testBothAPIs = args.includes('--both') || args.includes('--compare');
    const useConverseOnly = args.includes('--converse');
    
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

    // Determine test mode
    let testMode = "Invoke API";
    if (useConverseOnly) testMode = "Converse API";
    if (testBothAPIs) testMode = "Both APIs (Comparison)";

    // Clear output file and add header
    await fs.writeFile('test-vision-models-output.txt', 
        `Vision Test Results - ${testMode}\n` +
        `Test Question: "${testPrompt}"\n` +
        `Test Date: ${new Date().toISOString()}\n` +
        `${'='.repeat(60)}\n\n`
    );

    console.clear();
    await logOutput(`Starting vision tests with ${visionModels.length} models using ${testMode}...`, 'info');
    await logOutput(`Testing image description capabilities\n`, 'info');

    for (const model of visionModels) {
        await logOutput(`\n${'-'.repeat(60)}\nTesting ${model} ⇢`, 'running');
        
        if (testBothAPIs) {
            // Test both APIs and compare
            await logOutput(`\n📡 Testing with Invoke API:`, 'info');
            const invokeResult = await testVisionModel(model, messages, false, "Invoke API");
            
            if (invokeResult.success) {
                await logOutput(`✓ Invoke API: Success`, 'success');
                await logOutput(`Response: ${invokeResult.response.substring(0, 150)}...\n`, 'info');
            } else {
                await logOutput(`✗ Invoke API: ${invokeResult.error}`, 'error');
            }
            
            await logOutput(`📡 Testing with Converse API:`, 'info');
            const converseResult = await testVisionModel(model, messages, true, "Converse API");
            
            if (converseResult.success) {
                await logOutput(`✓ Converse API: Success`, 'success');
                await logOutput(`Response: ${converseResult.response.substring(0, 150)}...\n`, 'info');
            } else {
                await logOutput(`✗ Converse API: ${converseResult.error}`, 'error');
            }
            
            // Compare results
            if (invokeResult.success && converseResult.success) {
                await logOutput(`🔍 Both APIs successful for ${model}`, 'success');
            } else if (invokeResult.success || converseResult.success) {
                await logOutput(`⚠ Partial success for ${model}`, 'warning');
            } else {
                await logOutput(`❌ Both APIs failed for ${model}`, 'error');
            }
            
        } else {
            // Test single API
            const useConverseAPI = useConverseOnly;
            const apiName = useConverseAPI ? "Converse API" : "Invoke API";
            
            const result = await testVisionModel(model, messages, useConverseAPI, apiName);
            
            if (result.success) {
                await logOutput(`\n✓ ${apiName}: Success`, 'success');
                await logOutput(`Response: ${result.response}\n`, 'info', true);
            } else {
                await logOutput(`\n✗ ${apiName}: ${result.error}`, 'error');
                
                // Log the full error details to file
                await fs.appendFile('test-vision-models-output.txt', 
                    `Error details: ${result.error}\n\n`
                );
            }
        }
        
        console.log("\n" + "-".repeat(40));
    }
    
    await logOutput('\nVision testing complete! Check test-vision-models-output.txt for full results.', 'info', false);
}

// Add usage info
console.log('Vision Test Usage:');
console.log('  npm run test-vision              # Test with Invoke API (default)');
console.log('  npm run test-vision -- --converse    # Test with Converse API only');
console.log('  npm run test-vision -- --both        # Test both APIs and compare');
console.log('\n');

testVisionCapabilities().catch(console.error);