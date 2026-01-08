# AGENTS.md

This file provides guidance to AI coding agents like Claude Code (claude.ai/code), Cursor AI, Codex, Gemini CLI, GitHub Copilot, and other AI coding assistants when working with code in this repository.

## Project Purpose

Bedrock Wrapper translates OpenAI-compatible API objects to AWS Bedrock's serverless inference LLMs. It acts as an adapter layer allowing applications using the OpenAI API format to seamlessly call AWS Bedrock models.

## Development Commands

```bash
npm install              # Install dependencies
npm run clean            # Clean reinstall (removes node_modules and package-lock.json)
npm run test             # Test all models with both Invoke and Converse APIs
npm run test:invoke      # Test with Invoke API only
npm run test:converse    # Test with Converse API only
npm run test-vision      # Test vision capabilities
npm run test-stop        # Test stop sequences
npm run interactive      # Interactive CLI for testing specific models
```

## Architecture Overview

```
bedrock-wrapper.js (main entry)
       │
       ├── Converse API Path (useConverseAPI: true)
       │   └── Unified format for all models
       │
       └── Invoke API Path (default)
           └── Model-specific request/response handling
                    │
                    └── bedrock-models.js
                        └── Model configurations registry
```

### Key Functions in bedrock-wrapper.js

| Function | Line | Purpose |
|----------|------|---------|
| `bedrockWrapper()` | ~501 | Main entry point, async generator |
| `convertToConverseFormat()` | ~86 | OpenAI messages → Converse API format |
| `processMessagesForInvoke()` | ~168 | Model-specific message processing |
| `buildInvokePrompt()` | ~234 | Constructs model-specific prompts |
| `buildInvokeRequest()` | ~300 | Creates model-specific request objects |
| `executeInvokeAPI()` | ~409 | Handles streaming and non-streaming |
| `findAwsModelWithId()` | ~763 | Model lookup by name or ID |

### Model Configuration Schema (bedrock-models.js)

Each model entry requires:
- `modelName`: Consumer-facing name (e.g., "Claude-4-5-Sonnet")
- `modelId`: AWS Bedrock identifier
- `vision`: Boolean for image support
- `messages_api`: Boolean (true = structured messages, false = prompt string)
- `response_chunk_element`: JSON path for streaming response extraction
- `response_nonchunk_element`: JSON path for non-streaming response

### Two API Paths

1. **Converse API** (`useConverseAPI: true`): Unified format, handles all models consistently
2. **Invoke API** (default): Model-specific formatting required

Some models (e.g., DeepSeek-V3.1) have `converse_api_only: true` and automatically use the Converse API.

## Model Family Patterns

| Family | API Type | Special Handling |
|--------|----------|------------------|
| Claude | Messages API | Thinking tags: `<think>`, anthropic_version required |
| Nova | Messages API | Content as array `[{text: content}]`, schemaVersion: "messages-v1" |
| Llama | Prompt-based | Role tags: `<\|begin_of_text\|>`, `<\|start_header_id\|>` |
| Mistral | Prompt-based (older) / Messages (v3+) | `[INST]`/`[/INST]` tags for older models |
| GPT-OSS | Messages API | Reasoning tags: `<reasoning>`, streaming not supported |
| Qwen | Messages API | Standard messages format |
| DeepSeek | Messages API | V3.1 requires Converse API only |
| Gemma | Messages API | Standard messages format with vision |
| Kimi | Messages API | preserve_reasoning for thinking models |

## Adding a New Model

1. Add entry to `bedrock_models` array in `bedrock-models.js`
2. For prompt-based models, define all role prefix/suffix tokens
3. For vision models, set `vision: true` and add `image_support` config
4. For thinking models, add `thinking` config in `special_request_schema`
5. Test with `npm run test` to verify both API paths

## Key Implementation Details

### Image Processing
- Uses Sharp library to resize images to max 2048x2048
- Converts all formats to JPEG for consistency
- Handles base64, data URLs, and HTTP URLs

### Thinking Mode
- Claude: `<think>` tags, budget_tokens in special_request_schema
- GPT-OSS: `<reasoning>` tags, preserve_reasoning flag
- Temperature auto-set to 1.0, budget_tokens constrained to 80% of max_tokens

### Stop Sequences
- Claude: `stop_sequences` (up to 8,191)
- Nova: `stopSequences` (up to 4)
- Mistral: `stop` (up to 10)
- Llama: Not supported by AWS Bedrock

## Environment Setup

Create `.env` file:
```
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
LLM_MAX_GEN_TOKENS=1024
LLM_TEMPERATURE=0.2
```

## Test Output Files

After running tests, check these files for results:
- `test-models-output.txt`
- `test-vision-models-output.txt`
- `test-stop-sequences-output.txt`
- `test-converse-api-output.txt`
