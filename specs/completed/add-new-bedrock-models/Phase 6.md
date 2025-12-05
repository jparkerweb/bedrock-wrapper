# Phase 6: Add Kimi K2 and MiniMax M2 Models

## Objective
Add three new model entries from two new providers: Kimi-K2, Kimi-K2-Thinking (from Moonshot AI), and MiniMax-M2 (from MiniMax AI).

## File to Modify
- `bedrock-models.js`

## Tasks

- [x] Add Kimi-K2 configuration entry (strips reasoning)
- [x] Add Kimi-K2-Thinking configuration entry (preserves reasoning)
- [x] Add MiniMax-M2 configuration entry

## Technical Requirements

### Model IDs
- Kimi-K2: `moonshot.kimi-k2-thinking`
- Kimi-K2-Thinking: `moonshot.kimi-k2-thinking`
- MiniMax-M2: `minimax.minimax-m2`

### Kimi-K2 Configuration (strips reasoning)
This variant strips reasoning/thinking tags from the output, similar to how non-thinking GPT-OSS models work.

```javascript
{
    "modelName":                     "Kimi-K2",
    "modelId":                       "moonshot.kimi-k2-thinking",
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

### Kimi-K2-Thinking Configuration (preserves reasoning)
This variant preserves reasoning tags in the output, like GPT-OSS-Thinking models.

```javascript
{
    "modelName":                     "Kimi-K2-Thinking",
    "modelId":                       "moonshot.kimi-k2-thinking",
    "vision":                        false,
    "messages_api":                  true,
    "system_as_separate_field":      false,
    "display_role_names":            true,
    "max_tokens_param_name":         "max_tokens",
    "max_supported_response_tokens": 32768,
    "stop_sequences_param_name":     "stop",
    "response_chunk_element":        "choices[0].delta.content",
    "response_nonchunk_element":     "choices[0].message.content",
    "preserve_reasoning":            true,
    "special_request_schema": {}
}
```

### MiniMax-M2 Configuration
```javascript
{
    "modelName":                     "MiniMax-M2",
    "modelId":                       "minimax.minimax-m2",
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
Add these entries as new sections:
- "Moonshot AI Kimi Models" section for Kimi-K2 variants
- "MiniMax Models" section for MiniMax-M2

## Key Notes

### Kimi K2 Model Details
1. **Provider**: Moonshot AI
2. **Architecture**: 1 trillion total parameters, 32B active (MoE)
3. **Context**: 256K token context window
4. **Thinking mode**: Has native chain-of-thought reasoning
5. **Two variants**:
   - `Kimi-K2`: Default behavior, strips reasoning tags
   - `Kimi-K2-Thinking`: Preserves reasoning with `preserve_reasoning: true`
6. **Vision**: Not supported (text-only model)

### MiniMax M2 Model Details
1. **Provider**: MiniMax AI
2. **Architecture**: 230B total parameters, 10B active (MoE)
3. **Context**: 204.8K token context window
4. **API compatibility**: OpenAI and Anthropic API compatible
5. **Vision**: Not supported (text-only model)
6. **License**: MIT License (enterprise-friendly)

### preserve_reasoning Flag
The `preserve_reasoning: true` flag in Kimi-K2-Thinking tells the wrapper to:
- NOT strip `<reasoning>` or similar thinking tags from the response
- Pass through the full model output including reasoning content
- This is handled by the `processReasoningTags()` function in bedrock-wrapper.js (line 66)
