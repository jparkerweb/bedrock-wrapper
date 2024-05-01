// Description: This file contains the model configurations
export const aws_models = [
    {
        // ================
        // == Llama 3 8b ==
        // ================
        "modelName":                     "Llama-3-8b",
        "modelId":                       "meta.llama3-8b-instruct-v1:0",
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
        "response_chunk_element":        "generation",
    },
    {
        // =================
        // == Llama 3 70b ==
        // =================
        "modelName":                     "Llama-3-70b",
        "modelId":                       "meta.llama3-70b-instruct-v1:0",
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
        "response_chunk_element":        "generation",
    },
    {
        // ==================
        // == Mixtral-8x7b ==
        // ==================
        "modelName":                     "Mixtral-8x7b",
        "modelId":                       "mistral.mixtral-8x7b-instruct-v0:1",
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
        "response_chunk_element":        "outputs[0].text",
    },
    {
        // ===================
        // == Mistral Large ==
        // ===================
        "modelName":                     "Mistral-Large",
        "modelId":                       "mistral.mistral-large-2402-v1:0",
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
        "response_chunk_element":        "outputs[0].text",
    },
];