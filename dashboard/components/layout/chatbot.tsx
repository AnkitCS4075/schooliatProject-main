"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, HelpCircle, CalendarCheck, Users, BarChart3, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatMessage, useConversations } from "@/lib/hooks/use-ai";
import { toast } from "sonner";

interface Message {
  id: number;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

const quickActions = [
  {
    icon: HelpCircle,
    label: "Help",
    action: "How can you help me?",
  },
  {
    icon: CalendarCheck,
    label: "Schedule",
    action: "Show today's schedule",
  },
  {
    icon: Users,
    label: "Students",
    action: "Student management options",
  },
  {
    icon: BarChart3,
    label: "Reports",
    action: "Generate a report",
  },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: "Hello! 👋 I'm your SchooliAT Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useChatMessage();
  // Only fetch when chatbot is open to avoid 403 on every page load (when role lacks GET_CHATBOT_HISTORY in DB)
  const { data: conversationsData } = useConversations(
    { page: 1, limit: 1 },
    { enabled: isOpen }
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = inputText.trim();
    setInputText("");
    scrollToBottom();

    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync({ query: queryText });
      const botResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: response.data?.response || response.data?.answer || "I'm here to help! How can I assist you further?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      scrollToBottom();
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(error?.message || "Failed to process your query");
      scrollToBottom();
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 lg:bottom-8 right-6 lg:right-8 z-[1000]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-black hover:bg-gray-800 shadow-lg"
        >
          {isOpen ? (
            <X className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-28 right-6 lg:right-8 w-[340px] lg:w-[400px] h-[480px] lg:h-[560px] bg-white rounded-2xl shadow-2xl z-[999] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-4 bg-black rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-white">
                  SchooliAT Assistant
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs text-white/70">Online</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-gray-50 p-3 lg:p-4" ref={scrollRef}>
            <div className="space-y-3 lg:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "bot" && (
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] px-3 lg:px-4 py-2 lg:py-3 rounded-2xl",
                      message.type === "user"
                        ? "bg-black text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    )}
                  >
                    <p className="text-sm lg:text-base leading-relaxed">
                      {message.text}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-black flex items-center justify-center">
                    <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 lg:px-4 py-2.5 lg:py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Quick Actions</p>
              <div className="flex gap-2 overflow-x-auto">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <Icon className="h-3.5 w-3.5 text-gray-700" />
                      <span className="text-xs text-gray-700 font-medium">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-end gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border-t border-gray-200">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 min-h-[38px] lg:min-h-[44px] rounded-full bg-gray-100 border-0 focus-visible:ring-0"
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              size="icon"
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-300"
            >
              <Send className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center py-1.5 lg:py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-[10px] text-gray-500">Powered by SchooliAT AI</p>
          </div>
        </div>
      )}
    </>
  );
}

