// Simple test for DeepSeek models
import dotenv from 'dotenv';
dotenv.config();

import { bedrockWrapper } from "./bedrock-wrapper.js";

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const awsCreds = {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
};

async function testDeepSeekModel(modelName) {
    console.log(`\nTesting ${modelName}...`);

    const messages = [{ role: "user", content: "What is 2+2? Respond with just the number." }];
    const requestObject = {
        messages,
        model: modelName,
        max_tokens: 100,
        stream: false,
        temperature: 0.1,
    };

    try {
        const response = await bedrockWrapper(awsCreds, requestObject, { logging: true, useConverseAPI: false });
        let completeResponse = "";
        for await (const data of response) {
            completeResponse += data;
        }
        console.log(`✓ ${modelName} (Invoke API): ${completeResponse.trim()}`);
    } catch (error) {
        console.log(`✗ ${modelName} (Invoke API): ${error.message}`);
    }

    // Test with Converse API
    try {
        const response = await bedrockWrapper(awsCreds, requestObject, { logging: true, useConverseAPI: true });
        let completeResponse = "";
        for await (const data of response) {
            completeResponse += data;
        }
        console.log(`✓ ${modelName} (Converse API): ${completeResponse.trim()}`);
    } catch (error) {
        console.log(`✗ ${modelName} (Converse API): ${error.message}`);
    }
}

async function main() {
    console.log("Testing DeepSeek Models\n");
    console.log("=".repeat(50));

    await testDeepSeekModel("DeepSeek-R1");
    await testDeepSeekModel("DeepSeek-V3.1");

    console.log("\n" + "=".repeat(50));
    console.log("DeepSeek tests completed!");
}

main().catch(console.error);
