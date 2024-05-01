# 🪨 Bedrock Tunnel
Bedrock Tunnel simplifies the integration of existing OpenAI-compatible applications with Bedrock's serverless inference LLMs, enhancing ease of use from Bedrock's aweful API.

---

### Install / Setup

- install package dependencies: `npm ci`
- rename `.example.env` to `.env` and enter your AWS creds  
  _needed for the example; you will pass these objects yourself when integrating into your own app_
- run the example: `node index`

  ![node-index](/docs/node-index.gif)

---

### Usage

see `index.js` for a full code example

1. import `awsBedrockTunnelChatCompletion`  
    ```javascript
    import { awsBedrockTunnelChatCompletion } from "./bedrock_tunnel.js";
    ```

2. create an `awsCreds` object and fill in your AWS credentials  
    ```javascript
    const awsCreds = {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
    ```

3. clone your openai chat completions object into `openaiChatCompletionsCreateObject` or create a new one and edit the values.  
    ```javascript
    const openaiChatCompletionsCreateObject = {
        "messages": messages,
        "model": "Llama-3-8b",
        "max_tokens": LLM_MAX_GEN_TOKENS,
        "stream": true,
        "temperature": LLM_TEMPERATURE,
        "top_p": LLM_TOP_P,
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

    the `model` value should be either a corresponding `modelName` or `modelId` from the supplied `aws_models.js` file (see the Further Configuration section below for a list of models and more details).

4. call the `awsBedrockTunnelChatCompletion` function and pass in the previously defined `awsCreds` and `openaiChatCompletionsCreateObject` objects.  
    ```javascript
    // create a variable to hold the complete response
    let completeResponse = "";
    // invoke the streamed bedrock api response
    for await (const chunk of awsBedrockTunnelChatCompletion(awsCreds, openaiChatCompletionsCreateObject)) {
        completeResponse += chunk;
        // ---------------------------------------------------
        // -- each chunk is streamed as it is received here --
        // ---------------------------------------------------
        process.stdout.write(chunk); // ⇠ do stuff with the streamed chunk
    }
    // console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ optional do stuff with the complete response returned from the API reguardless of stream or not
    ```

    see `index.js` for a conditional check for streamed and unstreamed calls/reponses if unstreamed is required

---

### Further Configuration

The `aws_models.js` file can be expanded to support additional models offered on AWS Bedrock. Copy the template and fill in the model name, id, tokens, etc...

**Current Model List**

| modelName      | modelId                            |
|----------------|------------------------------------|
| Llama-3-8b     | meta.llama3-8b-instruct-v1:0       |
| Llama-3-70b    | meta.llama3-70b-instruct-v1:0      |
| Mixtral-8x7b   | mistral.mixtral-8x7b-instruct-v0:1 |
| Mistral-Large  | mistral.mistral-large-2402-v1:0    |
