// Quick test for DeepSeek models using interactive example logic
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

async function quickTest(modelName, useConverseAPI) {
    const apiType = useConverseAPI ? "Converse API" : "Invoke API";
    console.log(`\nTesting ${modelName} with ${apiType}...`);

    const messages = [
        { role: "user", content: "What is 2+2? Answer with just the number." }
    ];

    const requestObject = {
        messages,
        model: modelName,
        max_tokens: 50,
        stream: false,
        temperature: 0.1,
        include_thinking_data: true,
    };

    try {
        const response = await bedrockWrapper(awsCreds, requestObject, { logging: false, useConverseAPI });
        let completeResponse = "";
        for await (const data of response) {
            completeResponse += data;
        }
        console.log(`✓ SUCCESS: ${completeResponse.trim().substring(0, 100)}...`);
        return true;
    } catch (error) {
        console.log(`✗ FAILED: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("\n" + "=".repeat(60));
    console.log("QUICK DEEPSEEK MODEL TEST");
    console.log("=".repeat(60));

    const models = ["DeepSeek-R1", "DeepSeek-V3.1"];

    for (const model of models) {
        console.log(`\n--- Testing ${model} ---`);
        await quickTest(model, false); // Invoke API
        await quickTest(model, true);  // Converse API
    }

    console.log("\n" + "=".repeat(60));
    console.log("Tests completed!");
    console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
