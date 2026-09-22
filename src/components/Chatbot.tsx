import { useState } from 'react';

const AI_URL =
  'https://cwlntqhxzipeuyoyrzfw.supabase.co/functions/v1/ai-chat';

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const userMessage = input.trim();

    if (!userMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      `🧑 You: ${userMessage}`,
    ]);

    setInput('');
    setLoading(true);

    try {
      console.log('Sending AI request...');

      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      console.log('AI status:', response.status);

      const data = await response.json();

      console.log('AI response:', data);

      if (!response.ok) {
        throw new Error(
          data?.error || `AI request failed (${response.status})`
        );
      }

      setMessages((prev) => [
        ...prev,
        `🤖 MediPal: ${data.reply}`,
      ]);
    } catch (error) {
      console.error('AI request failed:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not reach AI server';

      setMessages((prev) => [
        ...prev,
        `❌ Error: ${errorMessage}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t pt-4">
      <h2 className="text-xl font-semibold mb-2">
        💬 MediPal Chatbot
      </h2>

      <div className="h-48 overflow-y-auto border p-3 bg-gray-50 rounded mb-2">
        {messages.map((msg, index) => (
          <p key={index} className="mb-2 whitespace-pre-wrap">
            {msg}
          </p>
        ))}

        {loading && (
          <p className="text-gray-500">
            🤖 MediPal is thinking...
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Ask a health question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          disabled={loading}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
