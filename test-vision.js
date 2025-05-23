import { bedrockWrapper } from "./bedrock-wrapper.js";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const awsCreds = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

async function testVisionCapabilities() {
    // Read and convert image to base64
    const imageBuffer = await fs.readFile('./test-image.jpg');
    const base64Image = imageBuffer.toString('base64');

    const messages = [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "What's in this image? Please describe it in detail."
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

    // Test with both Claude and Llama models that support vision
    const visionModels = ["Claude-3-5-Sonnet-v2", "Claude-3-7-Sonnet", "Claude-4-Sonnet", "Claude-4-Sonnet-Thinking", "Claude-4-Opus", "Claude-4-Opus-Thinking"];

    for (const model of visionModels) {
        console.log(`\nTesting vision capabilities with ${model}...`);
        
        const openaiChatCompletionsCreateObject = {
            messages,
            model,
            max_tokens: 1000,
            stream: true,
            temperature: 0.7
        };

        try {
            console.log(`\nSending request to ${model} with format:`, 
                JSON.stringify(openaiChatCompletionsCreateObject, null, 2));
            
            let response = "";
            for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging: true })) {
                response += chunk;
                process.stdout.write(chunk);
            }
            console.log("\n-------------------");
        } catch (error) {
            console.error(`Error with ${model}:`, error);
            // Log the full error details
            if (error.response) {
                console.error('Response error:', error.response);
            }
        }
    }
}

testVisionCapabilities().catch(console.error); 