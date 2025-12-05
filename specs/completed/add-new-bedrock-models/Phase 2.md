# Phase 2: Add Nova 2 Lite Model

## Objective
Add Nova-2-Lite model entry following the existing Nova model pattern.

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Nova-2-Lite configuration entry

## Technical Requirements

### Model ID
- `us.amazon.nova-2-lite-v1:0`

### Reference Pattern
Copy configuration from existing `Nova-Lite` model, updating modelName and modelId.

### Nova-2-Lite Configuration
```javascript
{
    "modelName":                     "Nova-2-Lite",
    "modelId":                       "us.amazon.nova-2-lite-v1:0",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      true,
    "display_role_names":            true,
    "max_tokens_param_name":         "maxTokens",
    "max_supported_response_tokens": 5000,
    "stop_sequences_param_name":     "stopSequences",
    "response_chunk_element":        "contentBlockDelta.delta.text",
    "response_nonchunk_element":     "output.message.content[0].text",
    "special_request_schema": {
        "schemaVersion": "messages-v1"
    },
    "image_support": {
        "max_image_size": 5242880,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

## Placement
Add this entry near the other Nova models (after Nova-Pro or Nova-Lite).

## Nova-Specific Notes

1. **schemaVersion**: Must be `"messages-v1"` - this is how the wrapper detects Nova models
2. **Parameter naming**: Nova uses camelCase (`maxTokens`, `stopSequences`) not snake_case
3. **Response paths**: Nova has unique response structure:
   - Streaming: `contentBlockDelta.delta.text`
   - Non-streaming: `output.message.content[0].text`
4. **Vision support**: Nova 2 Lite supports images and video input
5. **Extended thinking**: Nova 2 Lite supports reasoning via `reasoningConfig` (handled by Converse API automatically, no special config needed in model definition)
