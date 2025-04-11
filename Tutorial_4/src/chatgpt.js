import OpenAI from "openai";

export const chatgpt = async (prompt) => {
    const client = new OpenAI({
        apiKey: "PUT YOUR KEY HERE",
        dangerouslyAllowBrowser: true
    });
    const completion = await client.chat.completions.create({
        model: "o3-mini-2025-01-31",  // You can switch to gpt-3.5-turbo if you want
                        // more models are available on https://platform.openai.com/docs/models
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
}
