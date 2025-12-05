# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bedrock Wrapper is an npm package that translates OpenAI-compatible API objects to AWS Bedrock's serverless inference LLMs. It supports Claude, Nova, DeepSeek, GPT-OSS, Llama, Mistral, Qwen, Gemma, Kimi, and MiniMax model families with features like vision support, thinking modes, and stop sequences.

## Core Architecture

The system has two main API paths and three core components:

### API Paths

1. **Converse API Path** (`useConverseAPI: true`):
   - Unified request/response format across all models
   - Simplified message handling without model-specific formatting
   - Native system prompt support
   - Cleaner multimodal handling
   - Located at lines ~507-689 in bedrock-wrapper.js

2. **Invoke API Path** (default):
   - Model-specific request formatting and response parsing
   - Complex prompt construction for non-messages API models
   - Located at lines ~696-745 in bedrock-wrapper.js

### Core Components

1. **bedrock-wrapper.js** (~777 lines): Main async generator function
   - `bedrockWrapper()` (line 501): Entry point supporting both APIs
   - `convertToConverseFormat()` (line 86): Converts OpenAI messages to Converse API format
   - `processMessagesForInvoke()` (line 168): Handles model-specific message processing
   - `buildInvokePrompt()` (line 234): Constructs model-specific prompts
   - `buildInvokeRequest()` (line 300): Creates model-specific request objects
   - `executeInvokeAPI()` (line 409): Handles Invoke API streaming and non-streaming
   - Thinking mode support with `<think>` tags for Claude and `<reasoning>` tags for GPT-OSS

2. **bedrock-models.js** (~1078 lines): Model configuration registry
   - Each model entry contains: modelName, modelId, vision support, API type, response paths
   - Special configurations for thinking models (budget_tokens, anthropic_beta headers)
   - Stop sequences parameter mapping per model family

3. **utils.js**: Helper utilities (getValueByPath, writeAsciiArt)

## Development Commands

```bash
# Install dependencies
npm install

# Clean reinstall
npm run clean

# Test all models with both APIs (comparison mode)
npm run test

# Test with specific API
npm run test:invoke      # Invoke API only
npm run test:converse    # Converse API only

# Test vision capabilities (11 vision-enabled models)
npm run test-vision
npm run test-vision:invoke
npm run test-vision:converse

# Test stop sequences (Claude, Nova, GPT-OSS, Mistral)
npm run test-stop
npm run test-stop:invoke
npm run test-stop:converse

# Test Converse API specifically
npm run test-converse

# Interactive CLI testing
npm run interactive
```

## Environment Configuration

Create `.env` file:
```
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
LLM_MAX_GEN_TOKENS=1024
LLM_TEMPERATURE=0.2
```

## Adding New Models

Required fields in bedrock-models.js:
- `modelName`: Consumer-facing name
- `modelId`: AWS Bedrock identifier
- `vision`: Boolean for image support
- `messages_api`: Boolean (true for Claude/Nova/GPT-OSS/Qwen, false for prompt-based)
- `response_chunk_element`: JSON path for streaming responses
- `response_nonchunk_element`: JSON path for non-streaming responses
- `special_request_schema`: Model-specific requirements
- `stop_sequences_param_name`: Parameter name for stop sequences

## Critical Implementation Details

### Converse API Only Models
Some models only support the Converse API and will automatically use it regardless of the `useConverseAPI` flag:
- DeepSeek-V3.1

These models have `converse_api_only: true` in their configuration and the wrapper automatically forces `useConverseAPI = true` for them (see line 507 in bedrock-wrapper.js).

### Converse API Thinking Support
- Thinking configuration added via `additionalModelRequestFields`
- Response thinking data extracted from `reasoningContent.reasoningText.text`
- Budget tokens calculated with constraints: 1024 <= budget_tokens <= (maxTokens * 0.8)
- Temperature forced to 1.0 for thinking models

### Nova Models Special Handling
- Detect via `special_request_schema.schemaVersion === "messages-v1"`
- Content must be array format: `[{text: content}]`
- Parameters nested in `inferenceConfig` object

### Image Processing
- Sharp library resizes images to max 2048x2048
- Converts all images to JPEG format
- Supports base64, data URLs, and HTTP URLs
- Image-only messages are valid (no text required)

### Stop Sequences Support Matrix
| Model Family | Support | Parameter | Max Count |
|-------------|---------|-----------|-----------|
| Claude      | ✅      | stop_sequences | 8,191 |
| Nova        | ✅      | stopSequences | 4 |
| GPT-OSS     | ✅      | stop_sequences | TBD |
| Mistral     | ✅      | stop | 10 |
| Qwen        | ✅      | stop | TBD |
| Llama       | ❌      | N/A | N/A |

### Test Files Output
- `test-models-output.txt`: Full model test results
- `test-vision-models-output.txt`: Vision test results
- `test-stop-sequences-output.txt`: Stop sequences test results
- `test-converse-api-output.txt`: Converse API comparison results

## Common Issues and Solutions

### Thinking Models Not Showing Tags
- Ensure `include_thinking_data: true` is in the request
- Converse API extracts from `reasoningContent.reasoningText.text`
- Invoke API uses model-specific `thinking_response_chunk_element`

### Stop Sequences Not Working
- Llama models don't support stop sequences (AWS limitation)
- Stop sequence stops generation BEFORE the sequence appears
- Both `stop` and `stop_sequences` parameters are accepted

### Image Processing Failures
- Ensure images are under 2048x2048 pixels
- Use JPEG format for best compatibility
- Check model has `vision: true` in configuration

## Testing Best Practices
- Always test with both APIs using `--both` flag for comparison
- Check output files for detailed error messages
- Use `npm run interactive` for debugging specific models
- Test thinking models with `include_thinking_data: true`