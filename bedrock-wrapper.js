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
    ConverseCommand, ConverseStreamCommand,
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

// Convert messages to Converse API format
async function convertToConverseFormat(messages) {
    const converseMessages = [];
    let systemPrompts = [];
    
    for (const msg of messages) {
        if (msg.role === "system") {
            // System messages are handled separately in Converse API
            if (typeof msg.content === 'string') {
                systemPrompts.push({ text: msg.content });
            } else if (Array.isArray(msg.content)) {
                // Extract text from content array
                const textContent = msg.content
                    .filter(item => item.type === 'text')
                    .map(item => item.text || item)
                    .join('\n');
                if (textContent) {
                    systemPrompts.push({ text: textContent });
                }
            }
        } else {
            // Convert user and assistant messages
            let content = [];
            
            if (typeof msg.content === 'string') {
                content = [{ text: msg.content }];
            } else if (Array.isArray(msg.content)) {
                for (const item of msg.content) {
                    if (item.type === 'text') {
                        content.push({ text: item.text || item });
                    } else if (item.type === 'image') {
                        // Handle image content
                        if (item.source && item.source.data) {
                            content.push({
                                image: {
                                    format: 'jpeg',
                                    source: {
                                        bytes: Buffer.from(item.source.data, 'base64')
                                    }
                                }
                            });
                        }
                    } else if (item.type === 'image_url') {
                        // Process image URL to base64
                        const processedImage = await processImage(
                            typeof item.image_url === 'string' ? 
                            item.image_url : 
                            item.image_url.url
                        );
                        content.push({
                            image: {
                                format: 'jpeg',
                                source: {
                                    bytes: Buffer.from(processedImage, 'base64')
                                }
                            }
                        });
                    }
                }
            }
            
            // Only add messages with actual content (Converse API doesn't allow empty content)
            // Filter out content items with empty text
            const validContent = content.filter(item => {
                if (item.text !== undefined) {
                    return item.text !== null && item.text !== '';
                }
                return true; // Keep non-text items (like images)
            });

            if (validContent.length > 0) {
                converseMessages.push({
                    role: msg.role,
                    content: validContent
                });
            }
        }
    }
    
    return { messages: converseMessages, system: systemPrompts };
}

// Process messages for Invoke API (complex model-specific formatting)
async function processMessagesForInvoke(messages, awsModel) {
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
    
    return { message_cleaned, system_message };
}

// Build prompt for Invoke API (model-specific formatting)
function buildInvokePrompt(message_cleaned, awsModel) {
    if (awsModel.messages_api) {
        // convert message array to prompt object if model supports messages api
        return message_cleaned;
    } else {
        let prompt = awsModel.bos_text;
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
        return prompt;
    }
}

// Build request object for Invoke API (model-specific)
function buildInvokeRequest(prompt, awsModel, max_gen_tokens, temperature, stop_sequences, stop, system_message) {
    if (awsModel.messages_api) {
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
            
            // Build inference config with parameter restrictions
            let inferenceConfig = {
                [awsModel.max_tokens_param_name]: max_gen_tokens,
                temperature: temperature,
                ...(awsModel.stop_sequences_param_name && stopSequencesValue && {
                    [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
                })
            };

            const novaRequest = {
                ...awsModel.special_request_schema,
                messages: novaMessages,
                inferenceConfig: inferenceConfig
            };
            
            // Add system message if present
            if (awsModel.system_as_separate_field && system_message) {
                novaRequest.system = [{ text: system_message }];
            }
            
            return novaRequest;
        } else {
            // Standard messages API format (Claude, etc.)
            const stopSequencesValue = stop_sequences || stop;
            
            // Build request with parameter restrictions
            let request = {
                messages: prompt,
                ...(awsModel.system_as_separate_field && system_message && { system: system_message }),
                [awsModel.max_tokens_param_name]: max_gen_tokens,
                temperature: temperature,
                ...(awsModel.stop_sequences_param_name && stopSequencesValue && {
                    [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
                }),
                ...awsModel.special_request_schema
            };

            return request;
        }
    } else {
        // Build request for non-messages API models (Llama, etc.)
        let request = {
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
            ...(() => {
                const stopSequencesValue = stop_sequences || stop;
                return awsModel.stop_sequences_param_name && stopSequencesValue ? {
                    [awsModel.stop_sequences_param_name]: Array.isArray(stopSequencesValue) ? stopSequencesValue : [stopSequencesValue]
                } : {};
            })(),
            ...awsModel.special_request_schema
        };

        return request;
    }
}

// Execute Invoke API call (streaming and non-streaming)
async function* executeInvokeAPI(client, request, awsModelId, shouldStream, awsModel, include_thinking_data) {
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

export async function* bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject, { logging = false, useConverseAPI = false } = {} ) {
    const { region, accessKeyId, secretAccessKey } = awsCreds;
    let { messages, model, max_tokens, stream, temperature, include_thinking_data, stop, stop_sequences } = openaiChatCompletionsCreateObject;

    let {awsModelId, awsModel} = findAwsModelWithId(model);

    // Force Converse API for models that only support it
    if (awsModel.converse_api_only) {
        useConverseAPI = true;
    }

    // Create a Bedrock Runtime client 
    const client = new BedrockRuntimeClient({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });

    // Calculate max tokens (shared between both APIs)
    let max_gen_tokens = max_tokens <= awsModel.max_supported_response_tokens ? max_tokens : awsModel.max_supported_response_tokens;
    
    // Check if model supports streaming
    const modelSupportsStreaming = awsModel.streaming_supported !== false;
    const shouldStream = stream && modelSupportsStreaming;

    // ============================
    // CONVERSE API PATH (SIMPLIFIED)
    // ============================
    if (useConverseAPI) {
        // Convert messages to Converse API format (no model-specific complexity)
        const { messages: converseMessages, system: systemPrompts } = await convertToConverseFormat(messages);
        
        // Build inference configuration (handle thinking mode for Claude models)
        let inferenceConfig = {
            maxTokens: max_gen_tokens,
            temperature: temperature
        };

        // Handle thinking mode for Claude models
        let budget_tokens;
        if (awsModel.special_request_schema?.thinking?.type === "enabled") {
            // Apply thinking mode constraints for Converse API
            inferenceConfig.temperature = 1; // temperature must be 1 for thinking
            
            // Calculate thinking budget configuration
            budget_tokens = awsModel.special_request_schema?.thinking?.budget_tokens;
            if (budget_tokens > (max_gen_tokens * 0.8)) {
                budget_tokens = Math.floor(max_gen_tokens * 0.8);
            }
            if (budget_tokens < 1024) {
                budget_tokens = 1024;
            }
            
            // Ensure max tokens is sufficient for thinking
            if (inferenceConfig.maxTokens <= budget_tokens) {
                inferenceConfig.maxTokens = Math.floor(budget_tokens * 1.2);
            }
        }
        
        // Add stop sequences if provided (unified format)
        const stopSequencesValue = stop_sequences || stop;
        if (stopSequencesValue) {
            inferenceConfig.stopSequences = Array.isArray(stopSequencesValue) ? 
                stopSequencesValue : [stopSequencesValue];
        }
        
        // Build the Converse API request (simple, unified format)
        const converseRequest = {
            modelId: awsModelId,
            messages: converseMessages,
            inferenceConfig: inferenceConfig
        };
        
        // Add system prompts if any
        if (systemPrompts.length > 0) {
            converseRequest.system = systemPrompts;
        }
        
        // Add thinking configuration for Claude models
        if (awsModel.special_request_schema?.thinking?.type === "enabled") {
            converseRequest.additionalModelRequestFields = {
                thinking: {
                    type: "enabled",
                    budget_tokens: budget_tokens
                }
            };
            
            if (awsModel.special_request_schema?.anthropic_beta) {
                converseRequest.additionalModelRequestFields.anthropic_beta = awsModel.special_request_schema.anthropic_beta;
            }
        }
        
        if (logging) {
            console.log("\nConverse API request:", JSON.stringify(converseRequest, null, 2));
        }
        
        if (shouldStream) {
            // Use ConverseStream for streaming responses
            const responseStream = await client.send(new ConverseStreamCommand(converseRequest));
            
            let is_thinking = false;
            let should_think = include_thinking_data && awsModel.special_request_schema?.thinking?.type === "enabled";
            
            for await (const event of responseStream.stream) {
                if (event.contentBlockDelta) {
                    const text = event.contentBlockDelta.delta?.text;
                    const thinking = event.contentBlockDelta.delta?.thinking;
                    const reasoningContent = event.contentBlockDelta.delta?.reasoningContent;
                    
                    // Handle Claude thinking data (streaming) - check both reasoningContent and thinking
                    const thinkingText = reasoningContent?.reasoningText?.text || thinking;
                    if (should_think && thinkingText) {
                        if (!is_thinking) {
                            is_thinking = true;
                            yield `<think>${thinkingText}`;
                        } else {
                            yield thinkingText;
                        }
                    }
                    // Handle regular text content
                    else if (text) {
                        // End thinking mode if we were in it
                        if (is_thinking) {
                            is_thinking = false;
                            yield `</think>\n\n${text}`;
                        } else {
                            // Process reasoning tags for GPT-OSS models only
                            const processedText = processReasoningTags(text, awsModel);
                            if (processedText) {
                                yield processedText;
                            }
                        }
                    }
                }
            }
            
            // Close thinking tag if still open
            if (is_thinking) {
                yield "</think>";
            }
        } else {
            // Use Converse for non-streaming responses
            const response = await client.send(new ConverseCommand(converseRequest));
            
            if (logging) {
                console.log("\nConverse API response:", JSON.stringify(response, null, 2));
            }
            
            // Extract text and thinking from response (handle Claude thinking)
            if (response.output && response.output.message && response.output.message.content) {
                let thinking_result = "";
                let text_result = "";
                
                for (const contentBlock of response.output.message.content) {
                    // Extract thinking data for Claude models (from reasoningContent)
                    if (include_thinking_data && contentBlock.reasoningContent && 
                        awsModel.special_request_schema?.thinking?.type === "enabled") {
                        const reasoningText = contentBlock.reasoningContent.reasoningText?.text;
                        if (reasoningText) {
                            thinking_result += reasoningText;
                        }
                    }
                    
                    // Also check for legacy thinking field format
                    if (include_thinking_data && contentBlock.thinking && 
                        awsModel.special_request_schema?.thinking?.type === "enabled") {
                        thinking_result += contentBlock.thinking;
                    }
                    
                    // Extract regular text content
                    if (contentBlock.text) {
                        text_result += contentBlock.text;
                    }
                }
                
                // Process reasoning tags for GPT-OSS models
                text_result = processReasoningTags(text_result, awsModel);
                
                // Combine thinking and text for Claude models
                let result = thinking_result ? `<think>${thinking_result}</think>\n\n${text_result}` : text_result;
                
                if (result) {
                    yield result;
                }
            }
        }
        return; // Exit early when using Converse API
    }

    // ============================
    // INVOKE API PATH (COMPLEX, MODEL-SPECIFIC)
    // ============================
    
    // Process messages for Invoke API (complex, model-specific)
    const { message_cleaned, system_message } = await processMessagesForInvoke(messages, awsModel);
    
    // Build prompt for Invoke API (complex, model-specific)
    const prompt = buildInvokePrompt(message_cleaned, awsModel);
    
    if (logging) {
        console.log("\nFinal formatted prompt:", prompt);
    }

    // Handle thinking mode adjustments (Invoke API specific)
    if (awsModel.special_request_schema?.thinking?.type === "enabled") {
        // temperature may only be set to 1 when thinking is enabled
        temperature = 1;
        // budget_tokens can not be greater than 80% of max_gen_tokens
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
    
    // Build request for Invoke API (complex, model-specific)
    const request = buildInvokeRequest(prompt, awsModel, max_gen_tokens, temperature, stop_sequences, stop, system_message);
    
    if (logging) {
        console.log("\nFinal request:", JSON.stringify(request, null, 2));
    }
    
    // Execute Invoke API call (complex, model-specific response parsing)
    yield* executeInvokeAPI(client, request, awsModelId, shouldStream, awsModel, include_thinking_data);
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
