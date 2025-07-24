# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bedrock Wrapper (v2.4.0) is an npm package that translates OpenAI-compatible API objects to AWS Bedrock's serverless inference LLMs. It supports 26+ models including:
- **Claude 4 models**: Opus/Sonnet with thinking capabilities and 131K output tokens
- **Claude 3.x series**: Various sizes with vision support
- **AWS Nova models**: Pro/Lite/Micro with multimodal capabilities
- **Llama models**: 3.3, 3.2, 3.1, and 3.0 series
- **Mistral models**: 7B, 8x7B, and Large variants

## Core Architecture

The system uses three main components working together:

1. **bedrock-wrapper.js**: Main async generator function that:
   - Handles API format translation between OpenAI and AWS Bedrock
   - Supports both streaming and non-streaming responses
   - Processes images using Sharp library for vision-capable models
   - Manages different API patterns (messages API vs prompt-based)
   - Handles Nova's special "messages-v1" schema format

2. **bedrock-models.js**: Configuration registry containing:
   - 26+ model definitions with specific parameters
   - Vision support flags and image processing limits
   - Response parsing paths for different model outputs
   - Special request schemas (e.g., Nova's inferenceConfig, Claude's thinking mode)

3. **utils.js**: Helper utilities for object path traversal and ASCII art

## Development Commands

```bash
# Install dependencies
npm install

# Clean reinstall (removes node_modules and package-lock.json) 
npm run clean

# Test all 26+ models (outputs to test-models-output.txt)
npm run test

# Test vision capabilities on 11 vision-enabled models (outputs to test-vision-models-output.txt)
npm run test-vision

# Interactive CLI for manual model testing
npm run interactive
```

## Environment Configuration

Create a `.env` file with AWS credentials:
```
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
LLM_MAX_GEN_TOKENS=1024
LLM_TEMPERATURE=0.1
LLM_TOP_P=0.9
```

## Adding New Models

When adding models to bedrock-models.js, include these key fields:
- `modelName`: Used by consumers to reference the model
- `modelId`: AWS Bedrock model identifier
- `vision`: Boolean for image/multimodal support
- `messages_api`: Boolean for OpenAI-style messages vs prompt format
- `response_chunk_element`/`response_nonchunk_element`: JSON paths for parsing responses
- `special_request_schema`: Model-specific API requirements (Nova uses "messages-v1" schema)

## Critical Implementation Notes

**Nova Models Handling**: Nova models require special handling in bedrock-wrapper.js:
- Detect Nova by checking `special_request_schema.schemaVersion === "messages-v1"`
- Convert string content to `[{text: content}]` array format
- Structure parameters in `inferenceConfig` object instead of top-level

**Vision Model Support**: Images are processed through Sharp library and converted to base64 format. Vision-capable models are automatically tested by test-vision.js.

**Streaming Architecture**: The main `bedrockWrapper` function is an async generator that yields chunks as they arrive, supporting real-time streaming for all compatible models.

## Test Infrastructure

- **test-models.js**: Automatically tests all models from bedrock-models.js array
- **test-vision.js**: Dynamically filters and tests only vision-capable models (`vision: true`) - currently 11 models
- Both tests write detailed results to text files with timestamps and error logging
- Interactive testing available via `interactive-example.js`