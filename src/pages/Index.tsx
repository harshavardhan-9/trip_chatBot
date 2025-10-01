import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! Ask me anything about your Dubai itinerary.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dubai-chat", {
        body: { question: input },
      });

      if (error) {
        console.error("Function error:", error);
        
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          toast({
            title: "Rate Limit Reached",
            description: "Please wait a moment before sending another message.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402") || error.message?.includes("Payment")) {
          toast({
            title: "Credits Required",
            description: "Please add credits to continue using the AI features.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to get response. Please try again.",
            variant: "destructive",
          });
        }
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dubai Travel Assistant
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your personal guide to the 5-night Dubai itinerary
          </p>
        </header>

        <Card className="shadow-xl border-2 border-border/50 mb-4 overflow-hidden">
          <div
            className="h-[500px] overflow-y-auto p-6 space-y-4"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--muted)/0.3))",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                      : "bg-card border-2 border-border/50 text-card-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border-2 border-border/50 px-5 py-3 rounded-2xl shadow-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t-2 border-border/50 bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about flights, hotels, activities..."
                disabled={isLoading}
                className="flex-1 border-2 focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          This chatbot only answers questions from your Dubai itinerary
        </p>
      </main>
    </div>
  );
};

export default Index;
