import {
    BedrockRuntimeClient,
    ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";


export const claude = async (prompt) => {
    // Create a Bedrock Runtime client in the AWS Region you want to use.
    const client = new BedrockRuntimeClient({ 
        region: "ap-northeast-2",
        credentials:{
            accessKeyId: "PUT YOUR KEY HERE",
            secretAccessKey: "PUt YOUR SECRET KEY HERE"
        }
    });

    // Set the model ID, e.g., Claude 3 Haiku.
    // Claude 3 Haiku "anthropic.claude-3-haiku-20240307-v1:0"
    // and more on https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
    // make sure that it supports ap-northeast-2 region
    const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

    // Start a conversation with the user message.
    const userMessage = prompt;
    const conversation = [
        {
            role: "user",
            content: [{ text: userMessage }],
        },
    ];

    // Create a command with the model ID, the message, and a basic configuration.
    const command = new ConverseCommand({
        modelId,
        messages: conversation,
        inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
    });

    try {
        // Send the command to the model and wait for the response
        const response = await client.send(command);

        // Extract and print the response text.
        const responseText = response.output.message.content[0].text;
        console.log("CLAUDE SAID: " + responseText);
        return responseText;
    } catch (err) {
        console.log(`ERROR: Can't invoke '${modelId}'. Reason: ${err}`);
    }
}
