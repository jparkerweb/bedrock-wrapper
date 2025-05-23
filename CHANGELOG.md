# Changelog
All notable changes to this project will be documented in this file.

## [2.3.1] - 2025-05-22 (Claude 4 Opus / Sonnet)
### Added
- Support for Claude 4 Opus & Claude 4 Sonnet models
  - Claude-4-Opus
  - Claude-4-Opus-Thinking
  - Claude-4-Sonnet
  - Claude-4-Sonnet-Thinking

## [2.3.0] - 2025-02-15 (Claude 3.7 & Image Support)
### Added
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

### Changed
- Updated model configuration for image-capable models
- Improved response handling for multimodal inputs

## [2.2.0] - 2025-01-01 (Llama 3.3 70b)
### Added
- Support for Llama 3.3 70b

## [2.1.0] - 2024-11-21 (Claude 3.5 Haiku)
### Added
- Support for Claude 3.5 Haiku

## [2.0.0] - 2024-10-31 (Claude Sonnet & Haiku)
### Added
- Support for Anthropic Sonnet & Haiku models
  - Claude-3-5-Sonnet-v2
  - Claude-3-5-Sonnet
  - Claude-3-Haiku
- Interactive example script for testing models
- Testing script with streaming and non-streaming support for all models
- Stardardize output to be a string via Streamed and non-Streamed responses  
  > **NOTE:** This is a breaking change for previous non-streaming responses. Existing streaming responses will remain unchanged.

### Changed
- Complete architecture overhaul for better model support
- Improved message handling with role-based formatting
- Enhanced error handling and response processing
- Standardized model configuration format
- Updated AWS SDK integration

### Technical Details
- Implemented messages API support for compatible models
- Added system message handling as separate field where supported
- Configurable token limits per model
- Flexible response parsing with chunk/non-chunk handling
- Cross-region profile support for certain models

## [1.3.0] - 2024-07-24 (Llama3.2)
### Added
- Support for Llama 3.2 series models
  - Llama-3-2-1b
  - Llama-3-2-3b
  - Llama-3-2-11b
  - Llama-3-2-90b

## [1.1.0] - 2024-07-24 (Llama3.1)
### Added
- Support for Llama 3.1 series models
  - Llama-3-1-8b
  - Llama-3-1-70b


## [1.0.14] - 2024-05-06 (Initial Stable Release)
### Added
- Initial stablerelease of Bedrock Wrapper
- Basic AWS Bedrock integration
- OpenAI-compatible API object support
- Basic model support 
  - Llama-3-8b
  - Llama-3-70b
  - Mistral-7b
  - Mixtral-8x7b
  - Mistral-Large
