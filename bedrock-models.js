// Description: This file contains the model configurations

// NOTE: Not all models are available in all regions.
//       Check the bedrock documentation for availability.
//       The Llama 3.2 modelId's reference cross-region profile ids.
//       https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/cross-region-inference

export const bedrock_models = [
    {
        // ====================
        // == Claude 4 Opus ==
        // ====================
        "modelName":                     "Claude-4-Opus",
        // "modelId":                       "anthropic.claude-opus-4-20250514-v1:0",
        "modelId":                       "us.anthropic.claude-opus-4-20250514-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "thinking_response_chunk_element": "delta.thinking",
        "thinking_response_nonchunk_element": "content[0].thinking",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"],
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ==============================
        // == Claude 4 Opus Thinking ==
        // ==============================
        "modelName":                     "Claude-4-Opus-Thinking",
        // "modelId":                       "anthropic.claude-opus-4-20250514-v1:0",
        "modelId":                       "us.anthropic.claude-opus-4-20250514-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "thinking_response_chunk_element": "delta.thinking",
        "thinking_response_nonchunk_element": "content[0].thinking",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"],
            "thinking": {
                "type": "enabled",
                "budget_tokens": 16000
            },
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // =====================
        // == Claude 4 Sonnet ==
        // =====================
        "modelName":                     "Claude-4-Sonnet",
        // "modelId":                       "anthropic.claude-sonnet-4-20250514-v1:0",
        "modelId":                       "us.anthropic.claude-sonnet-4-20250514-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "thinking_response_chunk_element": "delta.thinking",
        "thinking_response_nonchunk_element": "content[0].thinking",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"],
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ==============================
        // == Claude 4 Sonnet Thinking ==
        // ==============================
        "modelName":                     "Claude-4-Sonnet-Thinking",
        // "modelId":                       "anthropic.claude-sonnet-4-20250514-v1:0",
        "modelId":                       "us.anthropic.claude-sonnet-4-20250514-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "thinking_response_chunk_element": "delta.thinking",
        "thinking_response_nonchunk_element": "content[0].thinking",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"],
            "thinking": {
                "type": "enabled",
                "budget_tokens": 16000
            },
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ================================
        // == Claude 3.7 Sonnet Thinking ==
        // ================================
        "modelName":                     "Claude-3-7-Sonnet-Thinking",
        // "modelId":                       "anthropic.claude-3-7-sonnet-20250219-v1:0",
        "modelId":                       "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "thinking_response_chunk_element": "delta.thinking",
        "thinking_response_nonchunk_element": "content[0].thinking",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"],
            "thinking": {
                "type": "enabled",
                "budget_tokens": 16000
            },
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // =======================
        // == Claude 3.7 Sonnet ==
        // =======================
        "modelName":                     "Claude-3-7-Sonnet",
        // "modelId":                       "anthropic.claude-3-7-sonnet-20250219-v1:0",
        "modelId":                       "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 131072,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31",
            "anthropic_beta": ["output-128k-2025-02-19"]
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ==========================
        // == Claude 3.5 Sonnet v2 ==
        // ==========================
        "modelName":                     "Claude-3-5-Sonnet-v2",
        "modelId":                       "anthropic.claude-3-5-sonnet-20241022-v2:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31"
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // =======================
        // == Claude 3.5 Sonnet ==
        // =======================
        "modelName":                     "Claude-3-5-Sonnet",
        "modelId":                       "anthropic.claude-3-5-sonnet-20240620-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31"
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ======================
        // == Claude 3.5 Haiku ==
        // ======================
        "modelName":                     "Claude-3-5-Haiku",
        "modelId":                       "anthropic.claude-3-5-haiku-20241022-v1:0",
        "vision":                        false,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31"
        }
    },
    {
        // ====================
        // == Claude 3 Haiku ==
        // ====================
        "modelName":                     "Claude-3-Haiku",
        "modelId":                       "anthropic.claude-3-haiku-20240307-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "delta.text",
        "response_nonchunk_element":     "content[0].text",
        "special_request_schema": {
            "anthropic_version": "bedrock-2023-05-31"
        },
        "image_support": {
            "max_image_size": 20971520, // 20MB
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ===================
        // == Llama 3.3 70b ==
        // ===================
        "modelName":                     "Llama-3-3-70b",
        // "modelId":                       "meta.llama3-3-70b-instruct-v1:0",
        "modelId":                       "us.meta.llama3-3-70b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ==================
        // == Llama 3.2 1b ==
        // ==================
        "modelName":                     "Llama-3-2-1b",
        // "modelId":                       "meta.llama3-2-1b-instruct-v1:0",
        "modelId":                       "us.meta.llama3-2-1b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ==================
        // == Llama 3.2 3b ==
        // ==================
        "modelName":                     "Llama-3-2-3b",
        // "modelId":                       "meta.llama3-2-3b-instruct-v1:0",
        "modelId":                       "us.meta.llama3-2-3b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ===================
        // == Llama 3.2 11b ==
        // ===================
        "modelName":                     "Llama-3-2-11b",
        // "modelId":                       "meta.llama3-2-11b-instruct-v1:0",
        "modelId":                       "us.meta.llama3-2-11b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ===================
        // == Llama 3.2 90b ==
        // ===================
        "modelName":                     "Llama-3-2-90b",
        // "modelId":                       "meta.llama3-2-90b-instruct-v1:0",
        "modelId":                       "us.meta.llama3-2-90b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ==================
        // == Llama 3.1 8b ==
        // ==================
        "modelName":                     "Llama-3-1-8b",
        "modelId":                       "meta.llama3-1-8b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ===================
        // == Llama 3.1 70b ==
        // ===================
        "modelName":                     "Llama-3-1-70b",
        "modelId":                       "meta.llama3-1-70b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ====================
        // == Llama 3.1 405b ==
        // ====================
        "modelName":                     "Llama-3-1-405b",
        "modelId":                       "meta.llama3-1-405b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ================
        // == Llama 3 8b ==
        // ================
        "modelName":                     "Llama-3-8b",
        "modelId":                       "meta.llama3-8b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // =================
        // == Llama 3 70b ==
        // =================
        "modelName":                     "Llama-3-70b",
        "modelId":                       "meta.llama3-70b-instruct-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<|begin_of_text|>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "<|start_header_id|>",
        "role_system_suffix":            "<|end_header_id|>",
        "role_user_message_prefix":      "",
        "role_user_message_suffix":      "",
        "role_user_prefix":              "<|start_header_id|>",
        "role_user_suffix":              "<|end_header_id|>",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "<|start_header_id|>",
        "role_assistant_suffix":         "<|end_header_id|>",
        "eom_text":                      "<|eot_id|>",
        "display_role_names":            true,
        "max_tokens_param_name":         "max_gen_len",
        "max_supported_response_tokens": 2048,
        "response_chunk_element":        "generation"
    },
    {
        // ===============
        // == Nova Pro ==
        // ===============
        "modelName":                     "Nova-Pro",
        "modelId":                       "us.amazon.nova-pro-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "maxTokens",
        "max_supported_response_tokens": 5000,
        "response_chunk_element":        "contentBlockDelta.delta.text",
        "response_nonchunk_element":     "output.message.content[0].text",
        "special_request_schema": {
            "schemaVersion": "messages-v1",
            "inferenceConfig": {}
        },
        "image_support": {
            "max_image_size": 5242880, // 5MB per image
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // ================
        // == Nova Lite ==
        // ================
        "modelName":                     "Nova-Lite",
        "modelId":                       "us.amazon.nova-lite-v1:0",
        "vision":                        true,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "maxTokens",
        "max_supported_response_tokens": 5000,
        "response_chunk_element":        "contentBlockDelta.delta.text",
        "response_nonchunk_element":     "output.message.content[0].text",
        "special_request_schema": {
            "schemaVersion": "messages-v1",
            "inferenceConfig": {}
        },
        "image_support": {
            "max_image_size": 5242880, // 5MB per image
            "supported_formats": ["jpeg", "png", "gif", "webp"],
            "max_images_per_request": 10
        }
    },
    {
        // =================
        // == Nova Micro ==
        // =================
        "modelName":                     "Nova-Micro",
        "modelId":                       "us.amazon.nova-micro-v1:0",
        "vision":                        false,
        "messages_api":                  true,
        "system_as_separate_field":      true,
        "display_role_names":            true,
        "max_tokens_param_name":         "maxTokens",
        "max_supported_response_tokens": 5000,
        "response_chunk_element":        "contentBlockDelta.delta.text",
        "response_nonchunk_element":     "output.message.content[0].text",
        "special_request_schema": {
            "schemaVersion": "messages-v1",
            "inferenceConfig": {}
        }
    },
    {
        // ================
        // == Mistral-7b ==
        // ================
        "modelName":                     "Mistral-7b",
        "modelId":                       "mistral.mistral-7b-instruct-v0:2",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<s>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "",
        "role_system_suffix":            "",
        "role_user_message_prefix":      "[INST]",
        "role_user_message_suffix":      "[/INST]",
        "role_user_prefix":              "",
        "role_user_suffix":              "",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "",
        "role_assistant_suffix":         "",
        "eom_text":                      "</s>",
        "display_role_names":            false,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "outputs[0].text"
    },
    {
        // ==================
        // == Mixtral-8x7b ==
        // ==================
        "modelName":                     "Mixtral-8x7b",
        "modelId":                       "mistral.mixtral-8x7b-instruct-v0:1",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<s>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "",
        "role_system_suffix":            "",
        "role_user_message_prefix":      "[INST]",
        "role_user_message_suffix":      "[/INST]",
        "role_user_prefix":              "",
        "role_user_suffix":              "",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "",
        "role_assistant_suffix":         "",
        "eom_text":                      "</s>",
        "display_role_names":            false,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 4096,
        "response_chunk_element":        "outputs[0].text"
    },
    {
        // ===================
        // == Mistral Large ==
        // ===================
        "modelName":                     "Mistral-Large",
        "modelId":                       "mistral.mistral-large-2402-v1:0",
        "vision":                        false,
        "messages_api":                  false,
        "bos_text":                      "<s>",
        "role_system_message_prefix":    "",
        "role_system_message_suffix":    "",
        "role_system_prefix":            "",
        "role_system_suffix":            "",
        "role_user_message_prefix":      "[INST]",
        "role_user_message_suffix":      "[/INST]",
        "role_user_prefix":              "",
        "role_user_suffix":              "",
        "role_assistant_message_prefix": "",
        "role_assistant_message_suffix": "",
        "role_assistant_prefix":         "",
        "role_assistant_suffix":         "",
        "eom_text":                      "</s>",
        "display_role_names":            false,
        "max_tokens_param_name":         "max_tokens",
        "max_supported_response_tokens": 8192,
        "response_chunk_element":        "outputs[0].text"
    },
];