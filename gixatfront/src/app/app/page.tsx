"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { env } from "@/config/env";

// Extended MessageType definition to handle structured data
type MessageType = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  imageUrl?: string;
  requiresConfirmation?: boolean;
  extractedInfo?: Record<string, string>;
  missingFields?: string[];
  isComplete?: boolean;
  agentType?: string;
  activeAgent?: string;
};

export default function AppPage() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize session or retrieve existing one from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Fetch existing session messages
      fetchSessionMessages(savedSessionId);
    }
  }, []);

  // Fetch messages for an existing session
  const fetchSessionMessages = async (sid: string) => {
    try {
      const response = await fetch(`${env.apiUrl}/ai-chat/session/${sid}`);
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.messages && sessionData.messages.length > 0) {
          // Transform API messages to our MessageType format
          const formattedMessages = sessionData.messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            imageUrl: msg.imageUrl,
            requiresConfirmation: msg.requiresConfirmation,
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMessage.trim() === "") return;

    // Add user message to UI immediately
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Send message to API
    try {
      const response = await fetch(`${env.apiUrl}/ai-chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Save session ID if it's a new session
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("chatSessionId", data.sessionId);
        }

        // Handle structured response format (for client registration)
        if (data.response) {
          // Create AI message from the structured response
          const aiMessage: MessageType = {
            id: Date.now().toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
            extractedInfo: data.extractedInfo,
            missingFields: data.missingFields,
            isComplete: data.isComplete,
            agentType: data.agentType,
            activeAgent: data.activeAgent,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Handle traditional response format
          const aiMessage: MessageType = {
            id: data.id || Date.now().toString(),
            content: data.content,
            sender: "ai",
            timestamp: new Date(),
            imageUrl: data.imageUrl,
            requiresConfirmation: data.requiresConfirmation,
          };

          setMessages((prev) => [...prev, aiMessage]);
        }

        // Set confirmation state if needed
        if (data.requiresConfirmation) {
          setAwaitingConfirmation(true);
        }
      } else {
        // Handle error
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          content:
            "Sorry, there was an error processing your message. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        content: "Network error. Please check your connection and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only proceed with image files
    if (file.type.startsWith("image/")) {
      // Create a preview for immediate display
      const imageUrl = URL.createObjectURL(file);
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: "I uploaded an image:",
        sender: "user",
        timestamp: new Date(),
        imageUrl: imageUrl,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Upload image to server
      try {
        const formData = new FormData();
        formData.append("image", file);

        if (sessionId) {
          formData.append("sessionId", sessionId);
        }

        const response = await fetch(`${env.apiUrl}/ai-chat/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();

          // Save session ID if it's a new session
          if (data.sessionId && !sessionId) {
            setSessionId(data.sessionId);
            localStorage.setItem("chatSessionId", data.sessionId);
          }

          // Handle structured response format (for client registration)
          if (data.response) {
            // Create AI message from the structured response
            const aiMessage: MessageType = {
              id: Date.now().toString(),
              content: data.response,
              sender: "ai",
              timestamp: new Date(),
              extractedInfo: data.extractedInfo,
              missingFields: data.missingFields,
              isComplete: data.isComplete,
              agentType: data.agentType,
              activeAgent: data.activeAgent,
            };

            setMessages((prev) => [...prev, aiMessage]);
          } else {
            // Handle traditional response format
            const aiMessage: MessageType = {
              id: data.id || Date.now().toString(),
              content: data.content,
              sender: "ai",
              timestamp: new Date(),
              imageUrl: data.imageUrl,
              requiresConfirmation: data.requiresConfirmation,
            };

            setMessages((prev) => [...prev, aiMessage]);
          }

          // Set confirmation state if needed
          if (data.requiresConfirmation) {
            setAwaitingConfirmation(true);
          }
        } else {
          // Handle error
          const errorMessage: MessageType = {
            id: Date.now().toString(),
            content:
              "Sorry, there was an error uploading your image. Please try again.",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          content: "Network error. Please check your connection and try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle confirmation (used when AI suggests actions that require user confirmation)
  const handleConfirmation = async (confirm: boolean) => {
    if (!sessionId) return;

    setIsTyping(true);
    setAwaitingConfirmation(false);

    try {
      const response = await fetch(`${env.apiUrl}/ai-chat/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId,
          confirm: confirm,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Handle structured response format (for client registration)
        if (data.response) {
          // Create AI message from the structured response
          const aiMessage: MessageType = {
            id: Date.now().toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
            extractedInfo: data.extractedInfo,
            missingFields: data.missingFields,
            isComplete: data.isComplete,
            agentType: data.agentType,
            activeAgent: data.activeAgent,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Handle traditional response format
          const aiMessage: MessageType = {
            id: data.id || Date.now().toString(),
            content: data.content,
            sender: "ai",
            timestamp: new Date(),
            imageUrl: data.imageUrl,
          };

          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Handle error
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          content:
            "Sorry, there was an error processing your confirmation. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending confirmation:", error);
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        content: "Network error. Please check your connection and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat session
  const handleClearSession = () => {
    setMessages([
      {
        id: "1",
        content: "Hello! How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
    localStorage.removeItem("chatSessionId");
    setAwaitingConfirmation(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))] md:h-[calc(100vh-theme(spacing.20))] bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700">
      {/* Chat header */}
      <div className="p-4 bg-gray-800/60 backdrop-blur-md border-b border-gray-700/50 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearSession}
            className="text-gray-400 hover:text-white text-xs border border-gray-700 hover:border-gray-500 px-2 py-1 rounded-md transition-colors"
            title="Start new conversation"
          >
            New Chat
          </button>
          <div className="flex space-x-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Chat messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-800/20 to-gray-900/30 backdrop-blur-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "ai" && (
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                message.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-800/80 text-gray-100 rounded-tl-none border border-gray-700/50"
              }`}
            >
              <div className="text-sm md:text-base">{message.content}</div>

              {/* Render image if present */}
              {message.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-600/30">
                  <Image
                    src={message.imageUrl}
                    alt="Shared image"
                    width={300}
                    height={200}
                    className="object-contain"
                  />
                </div>
              )}

              {/* Display extracted information (for client registration) */}
              {message.extractedInfo &&
                Object.keys(message.extractedInfo).length > 0 && (
                  <div className="mt-3 bg-gray-700/50 rounded-lg p-3 border border-gray-600/30">
                    <div className="text-sm font-medium text-blue-300 mb-1">
                      Extracted Information:
                    </div>
                    <div className="space-y-1">
                      {Object.entries(message.extractedInfo).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-300 capitalize">
                              {key}:
                            </span>
                            <span className="text-white font-medium">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Display missing fields (for client registration) */}
              {message.missingFields && message.missingFields.length > 0 && (
                <div className="mt-3 bg-gray-700/50 rounded-lg p-3 border border-gray-600/30">
                  <div className="text-sm font-medium text-amber-300 mb-1">
                    Missing Information:
                  </div>
                  <div className="space-y-1">
                    {message.missingFields.map((field) => (
                      <div key={field} className="flex items-center text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mr-2"></span>
                        <span className="text-gray-200 capitalize">
                          {field}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation buttons if required */}
              {message.requiresConfirmation && awaitingConfirmation && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleConfirmation(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleConfirmation(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Message timestamp */}
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {message.sender === "user" && (
              <div className="h-8 w-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* AI typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="bg-gray-800/80 text-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-gray-700/50">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-800/60 backdrop-blur-md border-t border-gray-700/50 rounded-b-xl">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Upload image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-gray-700/70 text-white rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600/50"
              disabled={awaitingConfirmation}
            />
          </div>
          <button
            type="submit"
            className={`p-3 rounded-full ${
              inputMessage.trim() && !awaitingConfirmation
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700/50 cursor-not-allowed"
            } text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={!inputMessage.trim() || awaitingConfirmation}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
