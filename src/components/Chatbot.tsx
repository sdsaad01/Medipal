import { useState } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `🧑 You: ${input}`]);

    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3', // Replace with your Ollama model name if different
          messages: [{ role: 'user', content: input }],
          stream: false,
        }),
      });

      const data = await res.json();
      const reply = data?.message?.content || '[No response from AI]';

      setMessages((prev) => [...prev, `🤖 AI: ${reply}`]);
      setInput('');
    } catch (err) {
      console.error('Ollama fetch error:', err);
      setMessages((prev) => [...prev, '❌ Error: Could not reach AI server']);
    }
  };

  return (
    <div className="mt-10 border-t pt-4">
      <h2 className="text-xl font-semibold mb-2">💬 MediPal Chatbot</h2>

      <div className="h-48 overflow-y-scroll border p-3 bg-gray-50 rounded mb-2">
        {messages.map((msg, idx) => (
          <p key={idx} className="mb-1">{msg}</p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
