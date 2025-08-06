// ======================================================================
// == 🪨 Bedrock Wrapper                                                ==
// ==                                                                  ==
// == Bedrock Wrapper is an npm package that simplifies the integration ==
// == of existing OpenAI-compatible API objects AWS Bedrock's          ==
// == serverless inference LLMs.                                       ==
// ======================================================================

// -------------
// -- imports --
// -------------
// Bedrock model configurations
import { bedrock_models } from "./bedrock-models.js";
// AWS SDK
import {
    BedrockRuntimeClient,
    InvokeModelCommand, InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
// helper functions
import {
    getValueByPath,
    writeAsciiArt
} from "./utils.js";
import sharp from 'sharp';


// write the ascii art logo on initial load
writeAsciiArt();



// -------------------
// -- main function --
// -------------------
async function processImage(imageInput) {
    let base64Image;
    
    if (typeof imageInput === 'string') {
        if (imageInput.startsWith('data:image')) {
            // Handle data URL
            base64Image = imageInput.split(',')[1];
        } else if (imageInput.startsWith('http')) {
            // Handle URL
            const response = await fetch(imageInput);
            const buffer = await response.arrayBuffer();
            base64Image = Buffer.from(buffer).toString('base64');
        } else {
            // Assume it's already base64
            base64Image = imageInput;
        }
    } else if (Buffer.isBuffer(imageInput)) {
        base64Image = imageInput.toString('base64');
    }

    // Process with sharp to ensure format and size compliance
    const buffer = Buffer.from(base64Image, 'base64');
    const processedImage = await sharp(buffer)
        .resize(2048, 2048, { fit: 'inside' })
        .toFormat('jpeg')
        .toBuffer();
    
    return processedImage.toString('base64');
}

function processReasoningTags(text, awsModel) {
    if (!text) return text;
    
    // Check if this is a GPT-OSS model (has reasoning tags)
    const hasReasoningTags = text.includes('<reasoning>') && text.includes('</reasoning>');
    
    if (!hasReasoningTags) {
        return text;
    }
    
    // If model should preserve reasoning, return as-is
    if (awsModel.preserve_reasoning) {
        return text;
    }
    
    // Strip reasoning tags for non-thinking GPT-OSS models
    return text.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '').trim();
}

export async function* bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging = false } = {} ) {
    const { region, accessKeyId, secretAccessKey } = awsCreds;
    let { messages, model, max_tokens, stream, temperature, top_p, include_thinking_data, stop, stop_sequences } = openaiChatCompletionsCreateObject;


  let {awsModelId, awsModel} = findAwsModelWithId(model);

    // cleanup message content before formatting prompt message
    let message_cleaned = [];
    let system_message = "";

    for (let i = 0; i < messages.length; i++) {
        if (messages[i].content) {
            let processedContent = messages[i].content;
            
            // Handle array format for messages with images
            if (Array.isArray(processedContent)) {
                let newContent = [];
                for (const item of processedContent) {
                    if (item.type === 'text') {
                        newContent.push(item);
                    } else if (item.type === 'image_url') {
                        const processedImage = await processImage(
                            typeof item.image_url === 'string' ? 
                            item.image_url : 
                            item.image_url.url
                        );
                        
                        // Handle different model formats
                        if (awsModel.messages_api) {
                            newContent.push({
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: 'image/jpeg',
                                    data: processedImage
                                }
                            });
                        } else {
                            // Llama format for images
                            newContent.push({
                                type: 'image',
                                image_data: {
                                    url: `data:image/jpeg;base64,${processedImage}`
                                }
                            });
                        }
                    }
                }
                processedContent = newContent;
            }

            if (awsModel.system_as_separate_field && messages[i].role === "system") {
                system_message = processedContent;
            } else {
                message_cleaned.push({
                    ...messages[i],
                    content: processedContent
                });
            }
        } else if (awsModel.display_role_names) {
            message_cleaned.push(messages[i]);
        }

        if (i === (messages.length - 1) && messages[i].content !== "" && awsModel.display_role_names) {
            message_cleaned.push({role: "assistant", content: ""});
        }
    }

    let prompt;

    // format prompt message from message array
    if (awsModel.messages_api) {
        // convert message array to prompt object if model supports messages api
        prompt = message_cleaned;
    } else {
        prompt = awsModel.bos_text;
        let eom_text_inserted = false;
        
        for (let i = 0; i < message_cleaned.length; i++) {
            prompt += "\n";
            
            // Handle user messages with potential images
            if (message_cleaned[i].role === "user") {
                prompt += awsModel.role_user_message_prefix;
                prompt += awsModel.role_user_prefix;
                if (awsModel.display_role_names) { prompt += message_cleaned[i].role; }
                prompt += awsModel.role_user_suffix;
                if (awsModel.display_role_names) { prompt += "\n"; }
                
                // Handle content array with text and images
                if (Array.isArray(message_cleaned[i].content)) {
                    let textContent = "";
                    let imageContent = "";
                    
                    // Separate text and image content
                    message_cleaned[i].content.forEach(item => {
                        if (item.type === 'text') {
                            textContent += item.text;
                        } else if (item.type === 'image') {
                            imageContent = item.image_data.url;
                        }
                    });
                    
                    // Format based on vision model requirements
                    if (awsModel.vision && imageContent) {
                        prompt += `\n${textContent}\n\n${imageContent}`;
                    } else {
                        prompt += textContent;
                    }
                } else {
                    prompt += message_cleaned[i].content;
                }
                
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
    }

    // Add logging to see the final prompt
    if (logging) {
        console.log("\nFinal formatted prompt:", prompt);
    }

    let max_gen_tokens = max_tokens <= awsModel.max_supported_response_tokens ? max_tokens : awsModel.max_supported_response_tokens;

    if (awsModel.special_request_schema?.thinking?.type === "enabled") {
        // temperature may only be set to 1 when thinking is enabled
        temperature = 1;
        // top_p must be unset when thinking is enabled
        top_p = undefined;
        // bugget_tokens can not be greater than 80% of max_gen_tokens
        let budget_tokens = awsModel.special_request_schema?.thinking?.budget_tokens;
        if (budget_tokens > (max_gen_tokens * 0.8)) {
            budget_tokens = Math.floor(max_gen_tokens * 0.8);
        }
        if (budget_tokens < 1024) {
            budget_tokens = 1024;
        }
        // if awsModel.special_request_schema?.thinking?.budget_tokens, set it to budget_tokens
        if (awsModel.special_request_schema?.thinking?.budget_tokens) {
            awsModel.special_request_schema.thinking.budget_tokens = budget_tokens;
            // max_gen_tokens has to be greater than budget_tokens
            if (max_gen_tokens <= budget_tokens) {
                // make max_gen_tokens 20% greater than budget_tokens
                max_gen_tokens = Math.floor(budget_tokens * 1.2);
            }
        }
    }

    // if (logging) {
    //     console.log("\nMax tokens:", max_gen_tokens);
    // }

    // Format the request payload using the model's native structure.
    const request = awsModel.messages_api ? (() => {
        // Check if this is a Nova model (has schemaVersion in special_request_schema)
        if (awsModel.special_request_schema?.schemaVersion === "messages-v1") {
            // Nova model format - convert messages to Nova's expected format
            const novaMessages = prompt.map(msg => {
                let content;
                
                // Convert content to array format for Nova
                if (typeof msg.content === 'string') {
                    content = [{ text: msg.content }];
                } else if (Array.isArray(msg.content)) {
                    // Already in array format, ensure proper structure
                    content = msg.content.map(item => {
                        if (item.type === 'text') {
                            return { text: item.text || item };
                        } else if (item.type === 'image') {
                            return {
                                image: {
                                    format: 'jpeg',
                                    source: {
                                        bytes: item.source.data
                                    }
                                }
                            };
                        }
                        return item;
                    });
                } else {
                    content = [{ text: String(msg.content) }];
                }
                
                return {
                    role: msg.role,
                    content: content
                };
            });
            
            const stopSequencesValue = stop_sequences || stop;
            const novaRequest = {
                ...awsModel.special_request_schema,
                messages: novaMessages,
                inferenceConfig: {
                    [awsModel.max_tokens_param_name]: max_gen_tokens,
                    temperature: temperature,
                    topP: top_p,
                    ...(awsModel.stop_sequences_param_name && stopSequencesValue && {
                        [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
                    })
                }
            };
            
            // Add system message if present
            if (awsModel.system_as_separate_field && system_message) {
                novaRequest.system = [{ text: system_message }];
            }
            
            return novaRequest;
        } else {
            // Standard messages API format (Claude, etc.)
            const stopSequencesValue = stop_sequences || stop;
            return {
                messages: prompt,
                ...(awsModel.system_as_separate_field && system_message && { system: system_message }),
                [awsModel.max_tokens_param_name]: max_gen_tokens,
                temperature: temperature,
                top_p: top_p,
                ...(awsModel.stop_sequences_param_name && stopSequencesValue && {
                    [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
                }),
                ...awsModel.special_request_schema
            };
        }
    })() : {
        prompt: typeof prompt === 'string' ? prompt : {
            messages: prompt.map(msg => ({
                role: msg.role,
                content: Array.isArray(msg.content) ? 
                    msg.content.map(item => 
                        item.type === 'text' ? item.text : item
                    ).join('\n') : 
                    msg.content
            }))
        },
        // Optional inference parameters:
        [awsModel.max_tokens_param_name]: max_gen_tokens,
        temperature: temperature,
        top_p: top_p,
        ...(() => {
            const stopSequencesValue = stop_sequences || stop;
            return awsModel.stop_sequences_param_name && stopSequencesValue ? {
                [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
            } : {};
        })(),
        ...awsModel.special_request_schema
    };
    
    // Create a Bedrock Runtime client in the AWS Region of your choice
    const client = new BedrockRuntimeClient({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });

    if (logging) {
        console.log("\nFinal request:", JSON.stringify(request, null, 2));
    }

    // Check if model supports streaming, override stream parameter if not
    const modelSupportsStreaming = awsModel.streaming_supported !== false;
    const shouldStream = stream && modelSupportsStreaming;

    if (shouldStream) {
        const responseStream = await client.send(
            new InvokeModelWithResponseStreamCommand({
                contentType: "application/json",
                body: JSON.stringify(request),
                modelId: awsModelId,
            }),
        );
        let is_thinking = false;
        let should_think = awsModel.special_request_schema?.thinking?.type === "enabled";
        
        for await (const event of responseStream.body) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
            let result;
            result = getValueByPath(chunk, awsModel.response_chunk_element);
            if (result) {
                if (should_think && is_thinking) {
                    is_thinking = false;
                    result = `</think>\n\n${result}`;
                }
                // Process reasoning tags for GPT-OSS models
                result = processReasoningTags(result, awsModel);
                yield result;
            } else {
                if (include_thinking_data && awsModel.thinking_response_chunk_element) {
                    let result = getValueByPath(chunk, awsModel.thinking_response_chunk_element);
                    if (result && should_think && !is_thinking) {
                        is_thinking = true;
                        result = `<think>${result}`;
                    }
                    if (result) {
                        yield result;
                    }
                } 
            }        
        }
    } else {
        const apiResponse = await client.send(
            new InvokeModelCommand({
              contentType: "application/json",
              body: JSON.stringify(request),
              modelId: awsModelId,
            }),
          );

        const decodedBodyResponse = JSON.parse(new TextDecoder().decode(apiResponse.body));
        let thinking_result;
        let text_result;

        if (awsModel.thinking_response_nonchunk_element) {
            thinking_result = getValueByPath(decodedBodyResponse, awsModel.thinking_response_nonchunk_element);
        }

        if (awsModel.response_nonchunk_element) {
            text_result = getValueByPath(decodedBodyResponse, awsModel.response_nonchunk_element);
        }
        if (!text_result) {
            if (awsModel.response_chunk_element) {
                text_result = getValueByPath(decodedBodyResponse, awsModel.response_chunk_element);
            }
            if (!text_result && awsModel.response_nonchunk_element) {
                // replace [0] with [1]
                awsModel.response_nonchunk_element = awsModel.response_nonchunk_element.replace('[0]', '[1]');
                text_result = getValueByPath(decodedBodyResponse, awsModel.response_nonchunk_element);
            }
        }

        // Handle case where stop sequences cause empty content array
        if (!text_result && decodedBodyResponse.stop_reason === "stop_sequence") {
            // If stopped by sequence but no content, return empty string instead of undefined
            text_result = "";
        }

        // Ensure text_result is a string to prevent 'undefined' from being part of the response
        if (text_result === null || text_result === undefined) {
            text_result = "";
        }

        // Process reasoning tags for GPT-OSS models
        text_result = processReasoningTags(text_result, awsModel);

        let result = thinking_result ? `<think>${thinking_result}</think>\n\n${text_result}` : text_result;
        
        // Ensure final result is a string, in case thinking_result was also empty
        if (result === null || result === undefined) {
            result = "";
        }
        yield result;
    }    
}


// ----------------------------------------------------
// -- lookup model configuration by model id or name --
// -----------------------------------------------------------------------------
// -- partial model id or model name is accepted (cross-region model support) --
// -- returns model configuration object and model id                         --
// -----------------------------------------------------------------------------
function findAwsModelWithId(model) {
    const matchingModel = bedrock_models.find(candidate =>
        model === candidate.modelName ||
        model.endsWith(candidate.modelId)
    );

    if (!matchingModel) {
        throw new Error(`Model configuration not found for model: ${model}`);
    }

    return {
        awsModelId: model.endsWith(matchingModel.modelId) ? model : matchingModel.modelId,
        awsModel: matchingModel
    };
}



// ---------------------------
// -- list supported models --
// ---------------------------
export async function listBedrockWrapperSupportedModels() {
    let supported_models = [];
    for (let i = 0; i < bedrock_models.length; i++) {
        supported_models.push(JSON.stringify({
            modelName: bedrock_models[i].modelName,
            modelId: bedrock_models[i].modelId
        }));
    }
    return supported_models;
}
