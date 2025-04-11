import OpenAI from "openai";

export const grok = async (prompt) => {
    const client = new OpenAI({
      apiKey: "API KEY HERE",
      baseURL: "https://api.x.ai/v1",
      dangerouslyAllowBrowser: true 
    });
    const completion = await client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
          {
              role: "user",
              content: prompt
          },
      ],
    });
    return completion.choices[0].message.content;
  }