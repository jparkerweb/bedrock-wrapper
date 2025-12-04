# Phase 3: Add Qwen3 Next Model

## Objective
Add Qwen3-Next-80B-A3B model entry following the existing Qwen model pattern.

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Qwen3-Next-80B-A3B configuration entry

## Technical Requirements

### Model ID
- `qwen.qwen3-next-80b-a3b`

### Reference Pattern
Copy configuration from existing `Qwen3-32B` model, updating modelName and modelId.

### Qwen3-Next-80B-A3B Configuration
```javascript
{
    "modelName":                     "Qwen3-Next-80B-A3B",
    "modelId":                       "qwen.qwen3-next-80b-a3b",
    "vision":                        false,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 32768,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "special_request_schema": {}
}
```

## Placement
Add this entry near the other Qwen models (after Qwen3-Coder-480B-A35B).

## Qwen-Specific Notes

1. **system_as_separate_field**: Set to `false` - Qwen includes system prompt in messages array
2. **stop_sequences_param_name**: Qwen uses `"stop"` (not `stop_sequences`)
3. **Response paths**: OpenAI-compatible format:
   - Streaming: `choices[0].delta.content`
   - Non-streaming: `choices[0].message.content`
4. **Vision**: Not supported for this model
5. **special_request_schema**: Empty object (no special requirements)
