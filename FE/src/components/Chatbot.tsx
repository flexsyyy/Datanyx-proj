import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Sprout, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatbotResponse {
  reply: string;
  newHistory: ChatMessage[];
  error?: string;
}

const CHATBOT_API_URL = 'http://localhost:3001/api/chatbot/fungi';

const suggestedQuestions = [
  "What's the ideal temperature?",
  "How to prevent contamination?",
  "When should I harvest?",
  "How to trigger fruiting?",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your mushroom growing assistant. How can I help you today?", isBot: true, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: messageText,
          chatHistory: chatHistory,
        }),
      });

      const data: ChatbotResponse = await response.json();

      if (data.error) {
        setError(data.error);
        const errorMessage: Message = {
          id: messages.length + 2,
          text: `Error: ${data.error}`,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // Update chat history
        setChatHistory(data.newHistory);

        // Convert chat history to display messages
        const botMessage: Message = {
          id: messages.length + 2,
          text: data.reply,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMsg);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: `Error: ${errorMsg}. Please ensure the chatbot server is running on port 3001.`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all",
          "bg-primary hover:bg-primary-dark",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[500px] flex flex-col shadow-2xl z-50 rounded-2xl overflow-hidden border-border/50">
          {/* Header */}
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Mushroom Assistant</h3>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.isBot ? "justify-start" : "justify-end")}>
                {msg.isBot && (
                  <div className="p-1.5 bg-primary/10 rounded-full h-fit">
                    <Sprout className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap",
                  msg.isBot ? "bg-card border border-border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm",
                  msg.text.startsWith("Error:") && "bg-destructive/10 border-destructive/20 text-destructive"
                )}>
                  {msg.text}
                </div>
                {!msg.isBot && (
                  <div className="p-1.5 bg-primary/10 rounded-full h-fit">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="p-1.5 bg-primary/10 rounded-full">
                  <Sprout className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(question)}
                    className="text-xs px-2.5 py-1.5 bg-card border border-border rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about mushroom growing..."
                className="flex-1 rounded-full border-border/60"
              />
              <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary-dark">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}

