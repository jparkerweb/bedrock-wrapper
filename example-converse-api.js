// ================================================================================
// == Example: Using the AWS Bedrock Converse API with bedrock-wrapper          ==
// ================================================================================

import dotenv from 'dotenv';
import { bedrockWrapper } from "./bedrock-wrapper.js";

dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

async function main() {
    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    // Example conversation with system prompt
    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant. Be concise and clear in your responses."
        },
        {
            role: "user",
            content: "What are the benefits of using the Converse API over the Invoke API?"
        }
    ];

    const openaiChatCompletionsCreateObject = {
        messages,
        model: "Claude-3-Haiku", // Works with any supported model
        max_tokens: 500,
        stream: true, // Can be true or false
        temperature: 0.7,
        top_p: 0.9,
        stop: ["END", "STOP"] // Optional stop sequences
    };

    console.log("=".repeat(60));
    console.log("Example: AWS Bedrock Converse API");
    console.log("=".repeat(60));
    console.log("\nUsing model:", openaiChatCompletionsCreateObject.model);
    console.log("Streaming:", openaiChatCompletionsCreateObject.stream);
    console.log("\nResponse:");
    console.log("-".repeat(40));

    let completeResponse = "";

    try {
        // Use the Converse API by setting useConverseAPI: true
        for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { 
            useConverseAPI: true,  // ← Enable Converse API
            logging: false         // Set to true to see API requests/responses
        })) {
            completeResponse += chunk;
            process.stdout.write(chunk); // Display streamed output
        }

        console.log("\n" + "-".repeat(40));
        console.log("\n✅ Successfully used the Converse API!");
        
        // Uncomment to see the complete response
        // console.log("\nComplete Response:", completeResponse);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
    }

    // Example 2: Comparing Invoke API vs Converse API
    console.log("\n" + "=".repeat(60));
    console.log("Comparing Invoke API vs Converse API");
    console.log("=".repeat(60));

    const simpleMessage = [
        { role: "user", content: "What is 2+2? Answer in one word." }
    ];

    const compareRequest = {
        messages: simpleMessage,
        model: "Claude-3-Haiku",
        max_tokens: 50,
        stream: false,
        temperature: 0.1,
        top_p: 0.9
    };

    // Test with Invoke API
    console.log("\n1. Using Invoke API (default):");
    let invokeResponse = "";
    const invokeStart = Date.now();
    const invokeGen = await bedrockWrapper(awsCreds, compareRequest, { useConverseAPI: false });
    for await (const data of invokeGen) {
        invokeResponse += data;
    }
    const invokeTime = Date.now() - invokeStart;
    console.log(`   Response: ${invokeResponse}`);
    console.log(`   Time: ${invokeTime}ms`);

    // Test with Converse API
    console.log("\n2. Using Converse API:");
    let converseResponse = "";
    const converseStart = Date.now();
    const converseGen = await bedrockWrapper(awsCreds, compareRequest, { useConverseAPI: true });
    for await (const data of converseGen) {
        converseResponse += data;
    }
    const converseTime = Date.now() - converseStart;
    console.log(`   Response: ${converseResponse}`);
    console.log(`   Time: ${converseTime}ms`);

    console.log("\n" + "=".repeat(60));
    console.log("✨ Example complete!");
    console.log("=".repeat(60));
}

main().catch(console.error);