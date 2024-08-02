// ================================================================================
// == AWS Bedrock Example: Invoke a Model with a Streamed or Unstreamed Response ==
// ================================================================================

// ---------------------------------------------------------------------
// -- import environment variables from .env file or define them here --
// ---------------------------------------------------------------------
import dotenv from 'dotenv';
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

// ----------------------------------------------
// -- example call to list of supported models --
// ----------------------------------------------
console.log(`\nsupported models:\n${JSON.stringify(await listBedrockWrapperSupportedModels())}\n`);

// -----------------------------------------------
// -- example prompt in `messages` array format --
// -----------------------------------------------
const messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately. Think step by step before answering the question.",
    },
    {
        role: "user",
        content: "Describe what the openai api standard used by lots of serverless LLM api providers is and why it has been widely adopted.",
    },
    {
        role: "assistant",
        content: "",
    },
];


// ---------------------------------------------------
// -- create an object to hold your AWS credentials --
// ---------------------------------------------------
const awsCreds = {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
};
// ----------------------------------------------------------------------
// -- create an object that copies your openai chat completions object --
// ----------------------------------------------------------------------
const openaiChatCompletionsCreateObject = {
    "messages": messages,
    "model": "Llama-3-1-405b",
    "max_tokens": LLM_MAX_GEN_TOKENS,
    "stream": true,
    "temperature": LLM_TEMPERATURE,
    "top_p": LLM_TOP_P,
};


// ------------------------------------------------------------
// -- invoke the streamed or unstreamed bedrock api response --
// ------------------------------------------------------------
// create a variable to hold the complete response
let completeResponse = "";
// streamed call
if (openaiChatCompletionsCreateObject.stream) {
    for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging:true })) {
        completeResponse += chunk;
        // ---------------------------------------------------
        // -- each chunk is streamed as it is received here --
        // ---------------------------------------------------
        process.stdout.write(chunk); // ⇠ do stuff with the streamed chunk
    }
} else { // unstreamed call
    const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging:true });
    for await (const data of response) {
        const jsonString = new TextDecoder().decode(data.body);
        const jsonResponse = JSON.parse(jsonString);
        completeResponse += jsonResponse.generation;
    }
    // ----------------------------------------------------
    // -- unstreamed complete response is available here --
    // ----------------------------------------------------
    console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ do stuff with the complete response
}
// console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ optional do stuff with the complete response returned from the API reguardless of stream or not
