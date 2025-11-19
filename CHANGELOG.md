# Changelog
All notable changes to this project will be documented in this file.

## [2.7.0] - 2025-11-18 (DeepSeek & Qwen 3)
### ✨ Added
- Support for DeepSeek foundation models
  - DeepSeek-R1 (reasoning model with chain-of-thought capabilities, 8K max output tokens)
  - DeepSeek-V3.1 (hybrid thinking mode for complex reasoning, 8K max output tokens, **Converse API only**)
- Support for Qwen 3 foundation models
  - Qwen3-32B (dense architecture, 32K max output tokens)
  - Qwen3-Coder-30B-A3B (MoE architecture for code generation, 32K max output tokens)
  - Qwen3-235B-A22B-2507 (MoE architecture for general reasoning, 32K max output tokens)
  - Qwen3-Coder-480B-A35B (MoE architecture for advanced software engineering, 32K max output tokens)
- Reasoning content extraction for DeepSeek-R1 via `reasoningContent.reasoningText`
- Stop sequences support (max 10 items) for DeepSeek and Qwen models
- Text-to-text completion with streaming support
- MIT-licensed open weight models for commercial use (DeepSeek)
- `converse_api_only` flag for models that only support Converse API (automatically forces `useConverseAPI = true`)
- Long-context handling support for Qwen 3 (up to 256K tokens natively, 1M with extrapolation)
- Hybrid thinking modes for complex problem-solving vs. fast responses
- Repository-scale code analysis capabilities for Qwen Coder models

### 🤬 Breaking Changes
- Removed `top_p` parameter from all models as it is not fully supported by AWS Bedrock
  - `temperature` should always be used instead

### ⚙️ Technical Details
- **Model Configuration**: All new models use messages API format (OpenAI-compatible)
- **API Compatibility**:
  - Qwen 3 models: Support both Invoke API and Converse API
  - DeepSeek-R1: Supports both Invoke API and Converse API
  - DeepSeek-V3.1: Converse API only (automatically enforced)

## [2.6.2] - 2025-10-16 (Claude Haiku 4.5)
### ✨ Added
- Support for Claude Haiku 4.5 models
  - Claude-4-5-Haiku
  - Claude-4-5-Haiku-Thinking
- Extended thinking support for Haiku 4.5 (first Haiku model with thinking capabilities)
- Vision support for Haiku 4.5 (20MB max image size, JPEG/PNG/GIF/WebP formats)
- 64,000 max output tokens (significant increase from Claude 3.5 Haiku's 8,192)
- Temperature/Top-P mutual exclusion parameter handling for Haiku 4.5 models

## [2.6.1] - 2025-09-30 (Claude Sonnet 4.5)
### ✨ Added
- Support for Claude Sonnet 4.5 models
  - Claude-4-5-Sonnet
  - Claude-4-5-Sonnet-Thinking

## [2.5.0] - 2025-08-12 (Converse API)
### ✨ Added
- Support for Converse API (streaming and non-streaming)

### ⚙️ Technical Details
- **Model Configuration**: All models use standard messages API format
- **API Compatibility**: Supports OpenAI-style requests
- **Response Processing**: Automatic reasoning tag handling based on model variant
- **Streaming Fallback**: Automatic detection and fallback to non-streaming for unsupported models
- **Testing Coverage**: Full integration with existing test suites and interactive example

## [2.4.5] - 2025-08-06 (GPT-OSS Models)
### ✨ Added
- Support for OpenAI GPT-OSS models on AWS Bedrock
  - GPT-OSS-120B (120B parameter open weight model)
  - GPT-OSS-20B (20B parameter open weight model)
  - GPT-OSS-120B-Thinking (with reasoning tag preservation)
  - GPT-OSS-20B-Thinking (with reasoning tag preservation)
- `<reasoning>` tag processing for GPT-OSS thinking variants
  - Regular GPT-OSS models automatically strip `<reasoning>` tags
  - Thinking variants preserve `<reasoning>` tags (similar to Claude's `<think>` tags)
- Non-streaming support for GPT-OSS models (streaming not supported by AWS Bedrock)
- OpenAI-compatible API format with `max_completion_tokens` parameter

### ⚙️ Technical Details
- **Model Configuration**: All GPT-OSS models use standard messages API format
- **API Compatibility**: Supports OpenAI-style requests with Apache 2.0 licensed models
- **Response Processing**: Automatic reasoning tag handling based on model variant
- **Streaming Fallback**: Automatic detection and fallback to non-streaming for unsupported models
- **Testing Coverage**: Full integration with existing test suites and interactive example

## [2.4.4] - 2025-08-05 (Claude 4.1 Opus)
### ✨ Added
- Support for Claude 4.1 Opus models
  - Claude-4-1-Opus
  - Claude-4-1-Opus-Thinking

## [2.4.3] - 2025-07-31 (Stop Sequences Fixes)
### 🛠️ Fixed
- **Critical Discovery**: Removed stop sequences support from Llama models
  - AWS Bedrock does not support stop sequences for Llama models (confirmed via official AWS documentation)
  - Llama models only support: `prompt`, `temperature`, `top_p`, `max_gen_len`, `images`
  - This is an AWS Bedrock limitation, not a wrapper limitation
- Fixed Nova model configuration conflicts that were causing stop sequence inconsistencies
  - Removed conflicting empty `inferenceConfig: {}` from Nova model configurations
- Improved error handling for empty responses when stop sequences trigger early

### 📝 Updated
- **Documentation corrections**
  - Corrected stop sequences support claims (removed "all models support" language)
  - Added accurate model-specific support matrix with sequence limits
  - Added comprehensive stop sequences support table with AWS documentation references
- **Model Support Matrix** now clearly documented:
  - ✅ Claude models: Full support (up to 8,191 sequences) 
  - ✅ Nova models: Full support (up to 4 sequences)
  - ✅ Mistral models: Full support (up to 10 sequences)
  - ❌ Llama models: Not supported (AWS Bedrock limitation)

### ⚙️ Technical Details
- Based on comprehensive research of official AWS Bedrock documentation
- All changes maintain full backward compatibility
- Test results show significant improvements in stop sequences reliability for supported models
- Added detailed explanations to help users understand AWS Bedrock's actual capabilities

## [2.4.2] - 2025-07-31 (Stop Sequences Support)
### ✨ Added
- Stop sequences support for compatible models
  - OpenAI-compatible `stop` and `stop_sequences` parameters
  - Automatic string-to-array conversion for compatibility
  - Model-specific parameter mapping (stop_sequences for Claude, stopSequences for Nova, stop for Mistral)
- Enhanced request building logic to include stop sequences in appropriate API formats
- Comprehensive stop sequences testing and validation with `npm run test-stop`

### 🛠️ Fixed
- **Critical Discovery**: Removed stop sequences support from Llama models
  - AWS Bedrock does not support stop sequences for Llama models (confirmed via official documentation)
  - Llama models only support: `prompt`, `temperature`, `top_p`, `max_gen_len`, `images`
  - This is an AWS Bedrock limitation, not a wrapper limitation
- Fixed Nova model configuration conflicts that were causing stop sequence inconsistencies
- Improved error handling for empty responses when stop sequences trigger early

### ⚙️ Technical Details
- **Model Support Matrix**:
  - ✅ Claude models: Full support (up to 8,191 sequences)
  - ✅ Nova models: Full support (up to 4 sequences)
  - ✅ Mistral models: Full support (up to 10 sequences)
  - ❌ Llama models: Not supported (AWS Bedrock limitation)
- Updated request construction for both messages API and prompt-based models
- Supports both single string and array formats for stop sequences
- Maintains full backward compatibility with existing API usage
- Added comprehensive documentation in README.md and CLAUDE.md explaining support limitations

## [2.4.0] - 2025-07-24 (AWS Nova Models)
### ✨ Added
- Support for AWS Nova models
  - Nova-Pro (300K context, multimodal, 5K output tokens)
  - Nova-Lite (300K context, multimodal, optimized for speed)
  - Nova-Micro (128K context, text-only, lowest latency)
- Nova-specific API format handling with schemaVersion "messages-v1"
- Proper inferenceConfig parameter structure for Nova models
- Automatic content array formatting for Nova message compatibility

## [2.3.1] - 2025-05-22 (Claude 4 Opus / Sonnet)
### ✨ Added
- Support for Claude 4 Opus & Claude 4 Sonnet models
  - Claude-4-Opus
  - Claude-4-Opus-Thinking
  - Claude-4-Sonnet
  - Claude-4-Sonnet-Thinking

## [2.3.0] - 2025-02-15 (Claude 3.7 & Image Support)
### ✨ Added
- Support for Claude 3.7 models
  - Claude-3-7-Sonnet
  - Claude-3-7-Sonnet-Thinking
- Image support for compatible Claude models
  - Claude 3.5 Sonnet
  - Claude 3.5 Sonnet v2
  - Claude 3.7 Sonnet
  - Claude 3.7 Sonnet Thinking
- Enhanced message handling for multimodal content
- Documentation for image support usage

### 🔄 Changed
- Updated model configuration for image-capable models
- Improved response handling for multimodal inputs

## [2.2.0] - 2025-01-01 (Llama 3.3 70b)
### ✨ Added
- Support for Llama 3.3 70b

## [2.1.0] - 2024-11-21 (Claude 3.5 Haiku)
### ✨ Added
- Support for Claude 3.5 Haiku

## [2.0.0] - 2024-10-31 (Claude Sonnet & Haiku)
### ✨ Added
- Support for Anthropic Sonnet & Haiku models
  - Claude-3-5-Sonnet-v2
  - Claude-3-5-Sonnet
  - Claude-3-Haiku
- Interactive example script for testing models
- Testing script with streaming and non-streaming support for all models
- Stardardize output to be a string via Streamed and non-Streamed responses  
  > **NOTE:** This is a breaking change for previous non-streaming responses. Existing streaming responses will remain unchanged.

### 🔄 Changed
- Complete architecture overhaul for better model support
- Improved message handling with role-based formatting
- Enhanced error handling and response processing
- Standardized model configuration format
- Updated AWS SDK integration

### ⚙️ Technical Details
- Implemented messages API support for compatible models
- Added system message handling as separate field where supported
- Configurable token limits per model
- Flexible response parsing with chunk/non-chunk handling
- Cross-region profile support for certain models

## [1.3.0] - 2024-07-24 (Llama3.2)
### ✨ Added
- Support for Llama 3.2 series models
  - Llama-3-2-1b
  - Llama-3-2-3b
  - Llama-3-2-11b
  - Llama-3-2-90b

## [1.1.0] - 2024-07-24 (Llama3.1)
### ✨ Added
- Support for Llama 3.1 series models
  - Llama-3-1-8b
  - Llama-3-1-70b


## [1.0.14] - 2024-05-06 (Initial Stable Release)
### ✨ Added
- Initial stablerelease of Bedrock Wrapper
- Basic AWS Bedrock integration
- OpenAI-compatible API object support
- Basic model support 
  - Llama-3-8b
  - Llama-3-70b
  - Mistral-7b
  - Mixtral-8x7b
  - Mistral-Large
