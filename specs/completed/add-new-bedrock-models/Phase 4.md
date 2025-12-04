# Phase 4: Add New Mistral Family Models

## Objective
Add five new Mistral family models: Mistral-Large-3, Ministral-3-3b, Ministral-3-8b, Ministral-3-14b, and Magistral-Small-2509.

**Important**: These new Mistral models use the **Converse API** (`messages_api: true`), unlike older Mistral models (Mistral-7b, Mixtral-8x7b, Mistral-Large) which use Invoke API.

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Mistral-Large-3 configuration entry (with vision)
- [x] Add Ministral-3-3b configuration entry (with vision)
- [x] Add Ministral-3-8b configuration entry (with vision)
- [x] Add Ministral-3-14b configuration entry (with vision)
- [x] Add Magistral-Small-2509 configuration entry (text-only)

## Technical Requirements

### Model IDs
- Mistral-Large-3: `mistral.mistral-large-3-675b-instruct`
- Ministral-3-3b: `mistral.ministral-3-3b-instruct`
- Ministral-3-8b: `mistral.ministral-3-8b-instruct`
- Ministral-3-14b: `mistral.ministral-3-14b-instruct`
- Magistral-Small-2509: `mistral.magistral-small-2509`

### Mistral-Large-3 Configuration (with vision)
```javascript
{
    "modelName":                     "Mistral-Large-3",
    "modelId":                       "mistral.mistral-large-3-675b-instruct",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 32768,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {},
    "image_support": {
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

### Ministral-3-3b Configuration (with vision)
```javascript
{
    "modelName":                     "Ministral-3-3b",
    "modelId":                       "mistral.ministral-3-3b-instruct",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 8192,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {},
    "image_support": {
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

### Ministral-3-8b Configuration (with vision)
```javascript
{
    "modelName":                     "Ministral-3-8b",
    "modelId":                       "mistral.ministral-3-8b-instruct",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 8192,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {},
    "image_support": {
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

### Ministral-3-14b Configuration (with vision)
```javascript
{
    "modelName":                     "Ministral-3-14b",
    "modelId":                       "mistral.ministral-3-14b-instruct",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 16384,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {},
    "image_support": {
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

### Magistral-Small-2509 Configuration (text-only)
```javascript
{
    "modelName":                     "Magistral-Small-2509",
    "modelId":                       "mistral.magistral-small-2509",
    "vision":                        false,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 8192,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {}
}
```

## Placement
Add these entries after the existing Mistral models section, clearly separated as "New Mistral Models (Converse API)".

## Key Notes

1. **API Difference**: These models use `messages_api: true` (Converse API), unlike older Mistral models
2. **Response paths**: OpenAI-compatible format (same as Qwen, GPT-OSS)
3. **Vision support**: Mistral-Large-3 and all Ministral models have multimodal vision support
4. **Magistral**: Text-only model, no vision support
5. **stop_sequences_param_name**: Uses `"stop"` (consistent with new Mistral convention)
