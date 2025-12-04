# Phase 5: Add Gemma 3 Models

## Objective
Add three Google Gemma 3 model entries as a new model family. All Gemma 3 models support vision/multimodal input.

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Gemma-3-4b configuration entry (with vision)
- [x] Add Gemma-3-12b configuration entry (with vision)
- [x] Add Gemma-3-27b configuration entry (with vision)

## Technical Requirements

### Model IDs
- Gemma-3-4b: `google.gemma-3-4b-it`
- Gemma-3-12b: `google.gemma-3-12b-it`
- Gemma-3-27b: `google.gemma-3-27b-it`

### Gemma-3-4b Configuration
```javascript
{
    "modelName":                     "Gemma-3-4b",
    "modelId":                       "google.gemma-3-4b-it",
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

### Gemma-3-12b Configuration
```javascript
{
    "modelName":                     "Gemma-3-12b",
    "modelId":                       "google.gemma-3-12b-it",
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

### Gemma-3-27b Configuration
```javascript
{
    "modelName":                     "Gemma-3-27b",
    "modelId":                       "google.gemma-3-27b-it",
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

## Placement
Add these entries as a new section "Google Gemma Models" after DeepSeek or before the existing Mistral models.

## Gemma 3 Model Notes

1. **New model family**: Google Gemma is a new provider in this codebase
2. **Vision support**: All three sizes (4B, 12B, 27B) support multimodal image input
3. **Context window**: Gemma 3 supports up to 128K tokens input context
4. **API format**: Uses Converse API with OpenAI-compatible response format
5. **Multilingual**: Supports 35+ languages natively
6. **Model naming**: Uses `-it` suffix indicating "instruction-tuned" variants
