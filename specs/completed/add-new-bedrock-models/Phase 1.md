# Phase 1: Add Claude Opus 4.5 Models

## Objective
Add two new Claude model entries: Claude-4-5-Opus (standard) and Claude-4-5-Opus-Thinking (with thinking mode enabled).

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Claude-4-5-Opus configuration entry
- [x] Add Claude-4-5-Opus-Thinking configuration entry

## Technical Requirements

### Model ID
- `us.anthropic.claude-opus-4-5-20251101-v1:0` (same for both variants)

### Reference Pattern
Copy configuration from existing `Claude-4-5-Sonnet` and `Claude-4-5-Sonnet-Thinking` models, updating only the modelName and modelId.

### Claude-4-5-Opus Configuration
```javascript
{
    "modelName":                     "Claude-4-5-Opus",
    "modelId":                       "us.anthropic.claude-opus-4-5-20251101-v1:0",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      true,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 131072,
    "stop_sequences_param_name":     "stop_sequences",
    "response_chunk_element":        "delta.text",
    "response_nonchunk_element":     "content[0].text",
    "thinking_response_chunk_element": "delta.thinking",
    "thinking_response_nonchunk_element": "content[0].thinking",
    "special_request_schema": {
        "anthropic_version": "bedrock-2023-05-31",
        "anthropic_beta": ["output-128k-2025-02-19"],
    },
    "image_support": {
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

### Claude-4-5-Opus-Thinking Configuration
```javascript
{
    "modelName":                     "Claude-4-5-Opus-Thinking",
    "modelId":                       "us.anthropic.claude-opus-4-5-20251101-v1:0",
    "vision":                        true,
    "messages_api":                  true,
    "system_as_separate_field":      true,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 131072,
    "stop_sequences_param_name":     "stop_sequences",
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
        "max_image_size": 20971520,
        "supported_formats": ["jpeg", "png", "gif", "webp"],
        "max_images_per_request": 10
    }
}
```

## Placement
Add these entries near the other Claude 4.5 models (after Claude-4-5-Haiku-Thinking or at the beginning of the Claude section).

## Key Differences from Standard Model
The Thinking variant includes:
- `thinking.type: "enabled"` in special_request_schema
- `thinking.budget_tokens: 16000` for reasoning allocation
