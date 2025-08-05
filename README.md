# 🪨 Bedrock Wrapper

Bedrock Wrapper is an npm package that simplifies the integration of existing OpenAI-compatible API objects with AWS Bedrock's serverless inference LLMs.  Follow the steps below to integrate into your own application, or alternativly use the 🔀 [Bedrock Proxy Endpoint](https://github.com/jparkerweb/bedrock-proxy-endpoint) project to spin up your own custom OpenAI server endpoint for even easier inference (using the standard `baseUrl`, and `apiKey` params).

![bedrock-wrapper](https://raw.githubusercontent.com/jparkerweb/bedrock-wrapper/refs/heads/main/docs/bedrock-wrapper.jpg)

---

### Maintained by
<a href="https://www.equilllabs.com">
  <img src="https://raw.githubusercontent.com/jparkerweb/eQuill-Labs/refs/heads/main/src/static/images/logo-text-outline.png" alt="eQuill Labs" height="40">
</a>

---

### Install

- install package: `npm install bedrock-wrapper`

---

### Usage

1. import `bedrockWrapper`  
    ```javascript
    import { bedrockWrapper } from "bedrock-wrapper";
    ```

2. create an `awsCreds` object and fill in your AWS credentials  
    ```javascript
    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
    ```

3. clone your openai chat completions object into `openaiChatCompletionsCreateObject` or create a new one and edit the values  
    ```javascript
    const openaiChatCompletionsCreateObject = {
        "messages": messages,
        "model": "Llama-3-1-8b",
        "max_tokens": LLM_MAX_GEN_TOKENS,
        "stream": true,
        "temperature": LLM_TEMPERATURE,
        "top_p": LLM_TOP_P,
        "stop_sequences": ["STOP", "END"], // Optional: sequences that will stop generation
    };
    ```

    the `messages` variable should be in openai's role/content format  
    ```javascript
    messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately. Think step by step before answering the question. You will get a $100 tip if you provide the correct answer.",
        },
        {
            role: "user",
            content: "Describe why openai api standard used by lots of serverless LLM api providers is better than aws bedrock invoke api offered by aws bedrock. Limit your response to five sentences.",
        },
        {
            role: "assistant",
            content: "",
        },
    ]
    ```

    ***the `model` value should be the corresponding `modelName` value in the `bedrock_models` section below (see Supported Models below)***

4. call the `bedrockWrapper` function and pass in the previously defined `awsCreds` and `openaiChatCompletionsCreateObject` objects  
    ```javascript
    // create a variable to hold the complete response
    let completeResponse = "";
    // invoke the streamed bedrock api response
    for await (const chunk of bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject)) {
        completeResponse += chunk;
        // ---------------------------------------------------
        // -- each chunk is streamed as it is received here --
        // ---------------------------------------------------
        process.stdout.write(chunk); // ⇠ do stuff with the streamed chunk
    }
    // console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ optional do stuff with the complete response returned from the API reguardless of stream or not
    ```

    if calling the unstreamed version you can call bedrockWrapper like this  
    ```javascript
    // create a variable to hold the complete response
    let completeResponse = "";
    if (!openaiChatCompletionsCreateObject.stream){ // invoke the unstreamed bedrock api response
        const response = await bedrockWrapper(awsCreds, openaiChatCompletionsCreateObject);
        for await (const data of response) {
            completeResponse += data;
        }
        // ----------------------------------------------------
        // -- unstreamed complete response is available here --
        // ----------------------------------------------------
        console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ do stuff with the complete response
    }

---

### Supported Models

| modelName                  | AWS Model Id                                 | Image |
|----------------------------|----------------------------------------------|-------|
| Claude-4-1-Opus            | us.anthropic.claude-opus-4-1-20250805-v1:0   |  ✅  |
| Claude-4-1-Opus-Thinking   | us.anthropic.claude-opus-4-1-20250805-v1:0   |  ✅  |
| Claude-4-Opus              | us.anthropic.claude-opus-4-20250514-v1:0     |  ✅  |
| Claude-4-Opus-Thinking     | us.anthropic.claude-opus-4-20250514-v1:0     |  ✅  |
| Claude-4-Sonnet            | us.anthropic.claude-sonnet-4-20250514-v1:0   |  ✅  |
| Claude-4-Sonnet-Thinking   | us.anthropic.claude-sonnet-4-20250514-v1:0   |  ✅  |
| Claude-3-7-Sonnet-Thinking | us.anthropic.claude-3-7-sonnet-20250219-v1:0 |  ✅  |
| Claude-3-7-Sonnet          | us.anthropic.claude-3-7-sonnet-20250219-v1:0 |  ✅  |
| Claude-3-5-Sonnet-v2       | anthropic.claude-3-5-sonnet-20241022-v2:0    |  ✅  |
| Claude-3-5-Sonnet          | anthropic.claude-3-5-sonnet-20240620-v1:0    |  ✅  |
| Claude-3-5-Haiku           | anthropic.claude-3-5-haiku-20241022-v1:0     |  ❌  |
| Claude-3-Haiku             | anthropic.claude-3-haiku-20240307-v1:0       |  ✅  |
| Nova-Pro                   | us.amazon.nova-pro-v1:0                      |  ✅  |
| Nova-Lite                  | us.amazon.nova-lite-v1:0                     |  ✅  |
| Nova-Micro                 | us.amazon.nova-micro-v1:0                    |  ❌  |
| Llama-3-3-70b              | us.meta.llama3-3-70b-instruct-v1:0           |  ❌  |
| Llama-3-2-1b               | us.meta.llama3-2-1b-instruct-v1:0            |  ❌  |
| Llama-3-2-3b               | us.meta.llama3-2-3b-instruct-v1:0            |  ❌  |
| Llama-3-2-11b              | us.meta.llama3-2-11b-instruct-v1:0           |  ❌  |
| Llama-3-2-90b              | us.meta.llama3-2-90b-instruct-v1:0           |  ❌  |
| Llama-3-1-8b               | meta.llama3-1-8b-instruct-v1:0               |  ❌  |
| Llama-3-1-70b              | meta.llama3-1-70b-instruct-v1:0              |  ❌  |
| Llama-3-1-405b             | meta.llama3-1-405b-instruct-v1:0             |  ❌  |
| Llama-3-8b                 | meta.llama3-8b-instruct-v1:0                 |  ❌  |
| Llama-3-70b                | meta.llama3-70b-instruct-v1:0                |  ❌  |
| Mistral-7b                 | mistral.mistral-7b-instruct-v0:2             |  ❌  |
| Mixtral-8x7b               | mistral.mixtral-8x7b-instruct-v0:1           |  ❌  |
| Mistral-Large              | mistral.mistral-large-2402-v1:0              |  ❌  |
   
To return the list progrmatically you can import and call `listBedrockWrapperSupportedModels`:  
```javascript
import { listBedrockWrapperSupportedModels } from 'bedrock-wrapper';
console.log(`\nsupported models:\n${JSON.stringify(await listBedrockWrapperSupportedModels())}\n`);
```

Additional Bedrock model support can be added.  
Please modify the `bedrock_models.js` file and submit a PR 🏆 or create an Issue.

---

### Image Support

For models with image support (Claude 4 series, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku, Nova Pro, and Nova Lite), you can include images in your messages using the following format:

```javascript
messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that can analyze images.",
    },
    {
        role: "user",
        content: [
            { type: "text", text: "What's in this image?" },
            { 
                type: "image_url", 
                image_url: {
                    url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..." // base64 encoded image
                }
            }
        ]
    }
]
```

You can also use a direct URL to an image instead of base64 encoding:

```javascript
messages = [
    {
        role: "user",
        content: [
            { type: "text", text: "Describe this image in detail." },
            { 
                type: "image_url", 
                image_url: {
                    url: "https://example.com/path/to/image.jpg" // direct URL to image
                }
            }
        ]
    }
]
```

You can include multiple images in a single message by adding more image_url objects to the content array.

---

### Stop Sequences

Stop sequences are custom text sequences that cause the model to stop generating text. This is useful for controlling where the model stops its response.

```javascript
const openaiChatCompletionsCreateObject = {
    "messages": messages,
    "model": "Claude-3-5-Sonnet",
    "max_tokens": 100,
    "stop_sequences": ["STOP", "END", "\n\n"], // Array of stop sequences
    // OR use single string format:
    // "stop": "STOP"
};
```

**Model Support:**
- ✅ **Claude models**: Fully supported (up to 8,191 sequences)
- ✅ **Nova models**: Fully supported (up to 4 sequences)  
- ✅ **Mistral models**: Fully supported (up to 10 sequences)
- ❌ **Llama models**: Not supported (AWS Bedrock limitation)

**Features:**
- Compatible with OpenAI's `stop` parameter (single string or array)
- Also accepts `stop_sequences` parameter for explicit usage
- Automatic conversion between string and array formats
- Model-specific parameter mapping handled automatically

**Example Usage:**
```javascript
// Stop generation when model tries to output "7"
const result = await bedrockWrapper(awsCreds, {
    messages: [{ role: "user", content: "Count from 1 to 10" }],
    model: "Claude-3-5-Sonnet",  // Use Claude, Nova, or Mistral models
    stop_sequences: ["7"]
});
// Response: "1, 2, 3, 4, 5, 6," (stops before "7")

// Note: Llama models will ignore stop sequences due to AWS Bedrock limitations
```

---

### 📢 P.S.

In case you missed it at the beginning of this doc, for an even easier setup, use the 🔀 [Bedrock Proxy Endpoint](https://github.com/jparkerweb/bedrock-proxy-endpoint) project to spin up your own custom OpenAI server endpoint (using the standard `baseUrl`, and `apiKey` params).

![bedrock-proxy-endpoing](./docs/bedrock-proxy-endpoint.jpg)

---

### 📚 References

- [AWS Meta Llama Models User Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-meta.html)
- [AWS Mistral Models User Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-mistral.html)
- [OpenAI API](https://platform.openai.com/docs/api-reference/chat/create)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/)

---

Please consider sending me a tip to support my work 😀
# [🍵 tip me here](https://ko-fi.com/jparkerweb)
