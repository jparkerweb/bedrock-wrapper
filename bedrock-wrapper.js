// ======================================================================
// == 🪨 Bedrock Wrapper                                                ==
// ==                                                                  ==
// == Bedrock Wrapper is an npm package that simplifies the integration ==
// == of existing OpenAI-compatible API objects AWS Bedrock's          ==
// == serverless inference LLMs.                                       ==
// ======================================================================
writeAsciiArt();

// -------------
// -- imports --
// -------------
import { bedrock_models } from "./bedrock-models.js";
import {
    BedrockRuntimeClient,
    InvokeModelCommand, InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

// -------------------
// -- main function --
// -------------------
export async function* bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging = false } = {} ) {
    const { region, accessKeyId, secretAccessKey } = awsCreds;
    const { messages, model, max_tokens, stream, temperature, top_p } = openaiChatCompletionsCreateObject;


    // retrieve the model configuration
    const awsModel = bedrock_models.find((x) => (x.modelName.toLowerCase() === model.toLowerCase() || x.modelId.toLowerCase() === model.toLowerCase()));
    if (!awsModel) { throw new Error(`Model configuration not found for model: ${model}`); }

    // cleanup message content before formatting prompt message
    let message_cleaned = [];
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].content !== "") {
            message_cleaned.push(messages[i]);
        } else if (awsModel.display_role_names) {
            message_cleaned.push(messages[i]);
        }

        if (i === (messages.length - 1) && messages[i].content !== "" && awsModel.display_role_names) {
            message_cleaned.push({role: "assistant", content: ""});
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
    
    // logging
    if (logging) {
        console.log(`\nPrompt: ${prompt}\n`);
    }

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
export async function listBedrockWrapperSupportedModels() {
    let supported_models = [];
    for (let i = 0; i < bedrock_models.length; i++) {
        supported_models.push(`{"modelName": ${bedrock_models[i].modelName}, "modelId": ${bedrock_models[i].modelId}}`);
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
    ___         _                 _     _ _ _                               
    | . > ___  _| | _ _  ___  ___ | |__ | | | | _ _  ___  ___  ___  ___  _ _ 
    | . \/ ._>/ . || '_>/ . \/ | '| / / | | | || '_><_> || . \| . \/ ._>| '_>
    |___/\___.\___||_|  \___/\_|_.|_\_\ |__/_/ |_|  <___||  _/|  _/\___.|_|  
                                                         |_|  |_|            
    `);
}
