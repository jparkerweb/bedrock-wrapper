// ======================================================================
// == 🪨 Bedrock Tunnel                                                ==
// ==                                                                  ==
// == Bedrock Tunnel is an npm package that simplifies the integration ==
// == of existing OpenAI-compatible API objects AWS Bedrock's          ==
// == serverless inference LLMs.                                       ==
// ======================================================================

// -------------
// -- imports --
// -------------
import { aws_models } from "./aws-bedrock-models.js";
import {
    BedrockRuntimeClient,
    InvokeModelCommand, InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";


// -------------------
// -- main function --
// -------------------
export async function* awsBedrockTunnel(awsCreds, openaiChatCompletionsCreateObject) {
    writeAsciiArt();
    const { region, accessKeyId, secretAccessKey } = awsCreds;
    const { messages, model, max_tokens, stream, temperature, top_p } = openaiChatCompletionsCreateObject;


    // retrieve the model configuration
    const awsModel = aws_models.find((x) => (x.modelName.toLowerCase() === model.toLowerCase() || x.modelId.toLowerCase() === model.toLowerCase()));
    if (!awsModel) { throw new Error(`Model configuration not found for model: ${model}`); }

    // cleanup unneeded message content
    let message_cleaned = [];
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].content !== "") {
            message_cleaned.push(messages[i]);
        } else if (awsModel.display_role_names) {
            message_cleaned.push(messages[i]);
        }
    }

    // format prompt message from message array
    let prompt = awsModel.bos_text;
    let eom_text_inserted = false;
    for (let i = 0; i < message_cleaned.length; i++) {
        prompt += "\n";
        if (message_cleaned[i].role === "system") {
            prompt += awsModel.role_system_message_prefix;
            prompt += awsModel.role_system_prefix;
            if (awsModel.display_role_names) { prompt += message_cleaned[i].role; }
            prompt += awsModel.role_system_suffix;
            if (awsModel.display_role_names) {prompt += "\n"; }
            prompt += message_cleaned[i].content;
            prompt += awsModel.role_system_message_suffix;
        } else if (message_cleaned[i].role === "user") {
            prompt += awsModel.role_user_message_prefix;
            prompt += awsModel.role_user_prefix;
            if (awsModel.display_role_names) { prompt += message_cleaned[i].role; }
            prompt += awsModel.role_user_suffix;
            if (awsModel.display_role_names) {prompt += "\n"; }
            prompt += message_cleaned[i].content;
            prompt += awsModel.role_user_message_suffix;
        } else if (message_cleaned[i].role === "assistant") {
            prompt += awsModel.role_assistant_message_prefix;
            prompt += awsModel.role_assistant_prefix;
            if (awsModel.display_role_names) { prompt += message_cleaned[i].role; }
            prompt += awsModel.role_assistant_suffix;
            if (awsModel.display_role_names) {prompt += "\n"; }
            prompt += message_cleaned[i].content;
            prompt += awsModel.role_assistant_message_suffix;
        }
        if (message_cleaned[i+1] && message_cleaned[i+1].content === "") {
            prompt += `\n${awsModel.eom_text}`;
            eom_text_inserted = true;
        } else if ((i+1) === (message_cleaned.length - 1) && !eom_text_inserted) {
            prompt += `\n${awsModel.eom_text}`;
        }
    }
    
    // console.log(`\nPrompt: ${prompt}\n`);

    // Format the request payload using the model's native structure.
    const request = {
        prompt,
        // Optional inference parameters:
        [awsModel.max_tokens_param_name]: max_tokens,
        temperature: temperature,
        top_p: top_p,
    };
    
    // Create a Bedrock Runtime client in the AWS Region of your choice
    const client = new BedrockRuntimeClient({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });

    if (stream) {
        const responseStream = await client.send(
            new InvokeModelWithResponseStreamCommand({
                contentType: "application/json",
                body: JSON.stringify(request),
                modelId: awsModel.modelId,
            }),
        );
        for await (const event of responseStream.body) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
            let result = getValueByPath(chunk, awsModel.response_chunk_element);
            if (result) {
                yield result;
            }
        }
    } else {
        const apiResponse = await client.send(
            new InvokeModelCommand({
              contentType: "application/json",
              body: JSON.stringify(request),
              modelId: awsModel.modelId,
            }),
          );
        yield apiResponse;
    }    
}


// ---------------------------
// -- list supported models --
// ---------------------------
export async function listBedrockTunnelSupportedModels() {
    let supported_models = [];
    for (let i = 0; i < aws_models.length; i++) {
        supported_models.push(`{"modelName": ${aws_models[i].modelName}, "modelId": ${aws_models[i].modelId}}`);
    }
    return supported_models;
}


// ----------------------
// -- helper functions --
// ----------------------
// helper function to get a value from an object using a path string
function getValueByPath(obj, path) {
    // Split the path into an array of keys
    let keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');  // Convert indexes into properties
    // Reduce the keys array to the final value
    return keys.reduce((acc, key) => acc && acc[key], obj);
}
// helper function to write ascii art
function writeAsciiArt() {
    console.log(`
     ___         _                 _     ___                     _ 
    | . > ___  _| | _ _  ___  ___ | |__ |_ _|_ _ ._ _ ._ _  ___ | |
    | . \\/ ._>/ . || '_>/ . \\/ | '| / /  | || | || ' || ' |/ ._>| |
    |___/\\___.\\___||_|  \\___/\\_|_.|_\\_\\  |_|\`___||_|_||_|_|\\___.|_|
    `);
}
