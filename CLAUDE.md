# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bedrock Wrapper (v2.4.5) is an npm package that translates OpenAI-compatible API objects to AWS Bedrock's serverless inference LLMs. It supports 32+ models including:
- **Claude 4 models**: Opus/Sonnet with thinking capabilities and 131K output tokens
- **Claude 3.x series**: Various sizes with vision support
- **AWS Nova models**: Pro/Lite/Micro with multimodal capabilities
- **OpenAI GPT-OSS models**: GPT-OSS-120B and GPT-OSS-20B with 128K context and thinking capabilities
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
   - Implements stop sequences support for all model types

2. **bedrock-models.js**: Configuration registry containing:
   - 32+ model definitions with specific parameters
   - Vision support flags and image processing limits
   - Response parsing paths for different model outputs
   - Special request schemas (e.g., Nova's inferenceConfig, Claude's thinking mode)
   - Stop sequences parameter mapping (`stop_sequences_param_name`)

3. **utils.js**: Helper utilities for object path traversal and ASCII art

## Development Commands

```bash
# Install dependencies
npm install

# Clean reinstall (removes node_modules and package-lock.json) 
npm run clean

# Test all 32+ models (outputs to test-models-output.txt)
npm run test

# Test vision capabilities on 11 vision-enabled models (outputs to test-vision-models-output.txt)
npm run test-vision

# Test stop sequences functionality across representative models (outputs to test-stop-sequences-output.txt)
npm run test-stop

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
- `stop_sequences_param_name`: Parameter name for stop sequences (e.g., "stop_sequences" for Claude, "stopSequences" for Nova, "stop" for Mistral). Omit for Llama models as they don't support stop sequences in AWS Bedrock.

## Critical Implementation Notes

**Nova Models Handling**: Nova models require special handling in bedrock-wrapper.js:
- Detect Nova by checking `special_request_schema.schemaVersion === "messages-v1"`
- Convert string content to `[{text: content}]` array format
- Structure parameters in `inferenceConfig` object instead of top-level

**Vision Model Support**: Images are processed through Sharp library and converted to base64 format. Vision-capable models are automatically tested by test-vision.js.

**Streaming Architecture**: The main `bedrockWrapper` function is an async generator that yields chunks as they arrive, supporting real-time streaming for all compatible models.

**Stop Sequences Implementation**: Claude, Nova, GPT-OSS, and Mistral models support stop sequences through OpenAI-compatible parameters:

**GPT-OSS Thinking Support**: GPT-OSS models support reasoning capabilities similar to Claude thinking:
- **GPT-OSS-120B**: Clean responses with `<reasoning>` tags stripped
- **GPT-OSS-120B-Thinking**: Full responses with `<reasoning>` tags preserved
- **GPT-OSS-20B**: Clean responses with `<reasoning>` tags stripped
- **GPT-OSS-20B-Thinking**: Full responses with `<reasoning>` tags preserved
- Accepts both `stop` and `stop_sequences` parameters from input
- Automatically converts single strings to arrays where needed
- Maps to model-specific parameter names based on `stop_sequences_param_name` configuration
- For messages API models: added to main request object or inferenceConfig (Nova)
- For prompt-based models: added to request parameters
- **Llama models**: Do NOT support stop sequences in AWS Bedrock (AWS limitation, not wrapper limitation)

## Test Infrastructure

- **test-models.js**: Automatically tests all models from bedrock-models.js array
- **test-vision.js**: Dynamically filters and tests only vision-capable models (`vision: true`) - currently 11 models
- **test-stop-sequences.js**: Tests stop sequences functionality across representative models from each family (Claude, Nova, GPT-OSS, Llama, Mistral)
- All tests automatically include both regular and thinking variants of supported models
- All tests write detailed results to text files with timestamps and error logging
- Interactive testing available via `interactive-example.js`

## Stop Sequences Support by Model Family

Based on AWS Bedrock documentation and testing:

| Model Family | Stop Sequences Support | Parameter Name | Max Sequences | AWS Documentation |
|--------------|------------------------|----------------|---------------|-------------------|
| **Claude**   | ✅ Full Support        | `stop_sequences` | 8,191        | Official AWS docs |
| **Nova**     | ✅ Full Support        | `stopSequences`  | 4            | Official AWS docs |
| **GPT-OSS**  | ✅ Full Support        | `stop_sequences` | TBD          | Official AWS docs |
| **Mistral**  | ✅ Full Support        | `stop`           | 10           | Official AWS docs |
| **Llama**    | ❌ Not Supported       | N/A              | N/A          | No mention in AWS docs |

**Important**: Llama models in AWS Bedrock only support `prompt`, `temperature`, `top_p`, `max_gen_len`, and `images` parameters. Stop sequences are not supported according to AWS Bedrock documentation.