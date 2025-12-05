# Add New AWS Bedrock Models - Implementation Overview

## Summary
Add support for 13 new AWS Bedrock models to the bedrock-wrapper package. This includes new model families (Kimi, MiniMax, Gemma) and updates to existing families (Nova, Mistral, Qwen, Claude). A total of 18 model configuration entries will be added.

## File to Modify
- `bedrock-wrapper/bedrock-models.js`

## Models to Add

| Model Name | Model ID | Vision | Family |
|------------|----------|--------|--------|
| Claude-4-5-Opus | us.anthropic.claude-opus-4-5-20251101-v1:0 | Yes | Claude |
| Claude-4-5-Opus-Thinking | us.anthropic.claude-opus-4-5-20251101-v1:0 | Yes | Claude |
| Nova-2-Lite | us.amazon.nova-2-lite-v1:0 | Yes | Nova |
| Qwen3-Next-80B-A3B | qwen.qwen3-next-80b-a3b | No | Qwen |
| Mistral-Large-3 | mistral.mistral-large-3-675b-instruct | Yes | Mistral |
| Ministral-3-3b | mistral.ministral-3-3b-instruct | Yes | Mistral |
| Ministral-3-8b | mistral.ministral-3-8b-instruct | Yes | Mistral |
| Ministral-3-14b | mistral.ministral-3-14b-instruct | Yes | Mistral |
| Magistral-Small-2509 | mistral.magistral-small-2509 | No | Mistral |
| Gemma-3-4b | google.gemma-3-4b-it | Yes | Gemma |
| Gemma-3-12b | google.gemma-3-12b-it | Yes | Gemma |
| Gemma-3-27b | google.gemma-3-27b-it | Yes | Gemma |
| Kimi-K2 | moonshot.kimi-k2-thinking | No | Kimi |
| Kimi-K2-Thinking | moonshot.kimi-k2-thinking | No | Kimi |
| MiniMax-M2 | minimax.minimax-m2 | No | MiniMax |

## Implementation Phases

- [x] **Phase 1**: Add Claude Opus 4.5 Models (2 entries)
  - Add Claude-4-5-Opus and Claude-4-5-Opus-Thinking following existing Claude pattern

- [x] **Phase 2**: Add Nova 2 Lite Model (1 entry)
  - Add Nova-2-Lite following existing Nova pattern with schemaVersion "messages-v1"

- [x] **Phase 3**: Add Qwen3 Next Model (1 entry)
  - Add Qwen3-Next-80B-A3B following existing Qwen pattern

- [x] **Phase 4**: Add New Mistral Family Models (5 entries)
  - Add Mistral-Large-3, Ministral-3-3b/8b/14b, and Magistral-Small-2509 using Converse API

- [x] **Phase 5**: Add Gemma 3 Models (3 entries)
  - Add Gemma-3-4b, Gemma-3-12b, Gemma-3-27b as new model family with vision support

- [x] **Phase 6**: Add Kimi K2 and MiniMax M2 Models (3 entries)
  - Add Kimi-K2, Kimi-K2-Thinking, and MiniMax-M2 as new model families

## Key Technical Notes

1. **All new models use Converse API** (`messages_api: true`) except they follow different response patterns
2. **Vision-enabled models** require `image_support` configuration object
3. **Thinking variants** (Claude, Kimi) have different handling:
   - Claude: Uses `thinking` in `special_request_schema` with budget_tokens
   - Kimi: Uses `preserve_reasoning: true` to keep reasoning tags in output
4. **New Mistral models** use Converse API (unlike older Mistral models that use Invoke API)

## Implementation Summary

**Completed:** 2025-12-02

### Files Modified
- `bedrock-models.js` - Added 15 new model configuration entries

### Models Added (15 total)

| Model Name | Model ID | Vision | Family |
|------------|----------|--------|--------|
| Claude-4-5-Opus | us.anthropic.claude-opus-4-5-20251101-v1:0 | Yes | Claude |
| Claude-4-5-Opus-Thinking | us.anthropic.claude-opus-4-5-20251101-v1:0 | Yes | Claude |
| Nova-2-Lite | us.amazon.nova-2-lite-v1:0 | Yes | Nova |
| Qwen3-Next-80B-A3B | qwen.qwen3-next-80b-a3b | No | Qwen |
| Mistral-Large-3 | mistral.mistral-large-3-675b-instruct | Yes | Mistral |
| Ministral-3-3b | mistral.ministral-3-3b-instruct | Yes | Mistral |
| Ministral-3-8b | mistral.ministral-3-8b-instruct | Yes | Mistral |
| Ministral-3-14b | mistral.ministral-3-14b-instruct | Yes | Mistral |
| Magistral-Small-2509 | mistral.magistral-small-2509 | No | Mistral |
| Gemma-3-4b | google.gemma-3-4b-it | Yes | Gemma |
| Gemma-3-12b | google.gemma-3-12b-it | Yes | Gemma |
| Gemma-3-27b | google.gemma-3-27b-it | Yes | Gemma |
| Kimi-K2 | moonshot.kimi-k2-thinking | No | Kimi |
| Kimi-K2-Thinking | moonshot.kimi-k2-thinking | No | Kimi |
| MiniMax-M2 | minimax.minimax-m2 | No | MiniMax |

### New Model Families Introduced
- **Google Gemma** - 3 vision-enabled models (4B, 12B, 27B parameters)
- **Moonshot AI Kimi** - 2 models (standard and thinking variants)
- **MiniMax** - 1 model (M2)

### Key Implementation Notes
- All new models use the Converse API (`messages_api: true`)
- Vision-enabled models include full `image_support` configuration
- Kimi-K2-Thinking uses `preserve_reasoning: true` to keep reasoning tags
- Claude thinking variants use `thinking.budget_tokens: 16000`
- New Mistral models (Converse API) are separate from older Invoke API models
