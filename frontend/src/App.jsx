import { useState } from "react";

import axios from "axios";

function App() {

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {

    if (!question.trim()) return;

    const userMessage = {
      type: "user",
      text: question
    };

    setMessages(prev => [...prev, userMessage]);

    const currentQuestion = question;

    setQuestion("");

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat",
        {
          question: currentQuestion
        }
      );

      const aiMessage = {
        type: "ai",
        text: response.data.answer,
        sources: response.data.sources
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: "Unable to connect to backend server.",
          sources: []
        }
      ]);

    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-[#f5f7fb]">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">

          <div>

            <h1 className="text-2xl font-semibold text-[#0f172a]">
              SWS AI Assistant
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Internal Policy Retrieval System
            </p>

          </div>

          <div className="text-sm text-gray-500">
            RAG Powered Knowledge Assistant
          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[72vh] flex flex-col">

          {/* CHAT AREA */}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {
              messages.length === 0 && (

                <div className="h-full flex items-center justify-center">

                  <div className="text-center">

                    <h2 className="text-3xl font-semibold text-[#0f172a]">
                      Company Policy Assistant
                    </h2>

                    <p className="text-gray-500 mt-3">
                      Ask questions about HR policies, leave rules,
                      IT security, work from home guidelines,
                      onboarding, and employee benefits.
                    </p>

                  </div>

                </div>

              )
            }

            {
              messages.map((msg, index) => (

                <div
                  key={index}
                  className={`flex ${
                    msg.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                      msg.type === "user"
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#f8fafc] border border-gray-200 text-[#0f172a]"
                    }`}
                  >

                    <p className="leading-7 whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {
                      msg.sources?.length > 0 && (

                        <div className="mt-5 pt-4 border-t border-gray-200">

                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Sources
                          </p>

                          <div className="space-y-2">

                            {
                              msg.sources.map((source, i) => (

                                <div
                                  key={i}
                                  className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2"
                                >
                                  {source.document} — Page {source.page + 1}
                                </div>

                              ))
                            }

                          </div>

                        </div>

                      )
                    }

                  </div>

                </div>

              ))
            }

            {
              loading && (

                <div className="flex justify-start">

                  <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl px-5 py-4 text-gray-500">

                    Processing request...

                  </div>

                </div>

              )
            }

          </div>

          {/* INPUT AREA */}

          <div className="border-t border-gray-200 p-5">

            <div className="flex gap-4">

              <input
                type="text"
                placeholder="Ask a question about company policies..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-xl px-5 py-4 text-[#0f172a] outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendMessage}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] transition-all text-white px-8 rounded-xl font-medium"
              >
                Send
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );
}

export default App;
