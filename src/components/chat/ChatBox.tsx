import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Brain, User, Bot } from "lucide-react";
import { askChatBot } from "../../utils/chat/api";
import { getAuth } from "../../utils/share";

type UserType = "student" | "teacher" | "admin";

interface ChatBotProps {
  userType: UserType;
}
const quickActions: Record<UserType, string[]> = {
  student: ["📚 Hỏi về bài học", "📊 Xem điểm", "📅 Lịch học", "💡 Gợi ý"],
  teacher: [
    "📝 Nhập điểm",
    "📅 Quản lý lịch",
    "📊 Thống kê lớp",
    "💡 Gợi ý giảng dạy",
  ],
  admin: [
    "👥 Quản lý người dùng",
    "📊 Báo cáo hệ thống",
    "⚙️ Cài đặt",
    "💡 Gợi ý",
  ],
};

export default function ChatBot({ userType }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => {
    // Generate a simple session ID
    const user = getAuth();
    return user.userId
      ? `user_${user.userId}`
      : `session_${Math.random().toString(36).substring(2, 10)}`;
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Chào bạn! Mình là trợ lý AI. Bạn cần hỗ trợ gì không? 😊",
      timestamp: new Date(),
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLInputElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "you",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      try {
        const response = await askChatBot({
          question: input,
          session_id: sessionId,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: response?.answer || "Xin lỗi, mình không hiểu câu hỏi 😅",
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: "❌ Lỗi khi gọi AI. Vui lòng thử lại!",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setTyping(false);
      }
    }, 1200);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative p-4 rounded-full bg-linear-to-br from-[#1970FB] to-[#3B82F6]
                     hover:from-blue-700 hover:to-indigo-800 shadow-2xl text-white 
                     transition-all duration-300 hover:scale-110 active:scale-95
                    "
        >
          <MessageCircle className="w-7 h-7" />

          {/* Notification Badge */}
          {/* <span
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
                         text-xs font-bold flex items-center justify-center
                         animate-pulse border-2 border-white"
          >
            1
          </span> */}

          {/* Tooltip */}
          <span
            className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white 
                         text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                         whitespace-nowrap pointer-events-none"
          >
            Chat với AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="w-[400px] h-[533px] bg-white rounded-2xl shadow-2xl 
                        flex flex-col overflow-hidden border border-slate-200
                        animate-[slideUp_0.3s_ease-out]"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#1970FB] to-[#3B82F6] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm 
                              flex items-center justify-center border-2 border-white/30"
                >
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {/* Online indicator */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 
                               rounded-full border-2 border-white"
                ></span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  AI Assistant
                </h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 
                       p-2 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            ref={chatRef}
            className="flex-1 max-h-[350px] overflow-y-auto p-4 space-y-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 transparent",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${
                  msg.sender === "you" ? "flex-row-reverse" : ""
                } animate-[fadeIn_0.3s_ease-out]`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "ai"
                      ? "bg-linear-to-br from-blue-500 to-indigo-600"
                      : "bg-linear-to-br from-slate-400 to-slate-500"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
                  ) : (
                    <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col ${
                    msg.sender === "you" ? "items-end" : "items-start"
                  } max-w-[75%]`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.sender === "ai"
                        ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                        : "bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-md"
                    } transition-all hover:shadow-lg`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex gap-3 items-start animate-[fadeIn_0.3s_ease-out]">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                              flex items-center justify-center flex-shrink-0"
                >
                  <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12
                           text-sm focus:outline-none focus:border-blue-500 
                           transition-colors bg-slate-50 focus:bg-white
                           placeholder:text-slate-400"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 
                           hover:text-slate-600 transition-colors"
                  title="Emoji"
                >
                  😊
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 
                         text-white transition-all hover:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Quick Actions */}
            <div
              className="flex gap-2 mt-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {quickActions[userType].map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 
               text-slate-700 rounded-lg transition-colors whitespace-nowrap
               border border-slate-200 hover:border-slate-300"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
