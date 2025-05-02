import { useState } from "react";
import { cosineSimilarity, getEmbedding } from "./utils";
import documents from "./documents.json";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const getTopChunks = async (query, k = 3) => {
    const queryVec = await getEmbedding(query, apiKey);
    return documents
      .map((doc) => ({
        ...doc,
        score: cosineSimilarity(queryVec, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  };

  const handleAsk = async () => {
    setLoading(true);
    const topChunks = await getTopChunks(question);
    const context = topChunks.map((c) => c.text).join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
        ]
      })
    });

    const data = await res.json();
    setAnswer(data.choices[0].message.content);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🧠 Simple Vector RAG</h1>
      <textarea
        rows="3"
        cols="60"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
      />
      <br />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      <h3>Answer:</h3>
      <pre>{answer}</pre>
    </div>
  );
}

export default App;
