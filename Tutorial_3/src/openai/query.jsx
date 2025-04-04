export async function query({ input, handleResponse }) {
    const apiKey = "";
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-2024-08-06',
                messages: [
                    {
                        role: 'system', content: input
                    }],
                store: true,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "intent",
                        schema: {
                            type: "object",
                            properties: {
                                controlAction: {
                                    type: "string",
                                    description: "Either the user would increase or decrease the target temperature.",
                                    enum: ["up", "down"]
                                },
                                userEmotion: {
                                    type: "string",
                                    description: "The user's emotion about the current temperature."
                                }
                            },
                            required: ["controlAction", "userEmotion"]
                        }
                    }
                }
            }),
        });
        const data = await res.json();
        const rawJSON = data.choices?.[0]?.message?.content || null;
        const parsedJSON = JSON.parse(rawJSON);

        handleResponse(parsedJSON);
    } catch (err) {
        console.error(err);
        handleResponse(err.toString());
    }

}