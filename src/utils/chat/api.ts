import { API_BASE_URL, getAuth } from "../share";

export interface ChatBotResponse {
  answer: string;
  mdx_generated?: string;
  model?: string;
}

export interface ChatBotRequest {
  question: string;
  session_id: string;
}

export async function askChatBot(
  payload: ChatBotRequest
): Promise<ChatBotResponse | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API ChatBot");
      return null;
    }

    const url = `${API_BASE_URL}/chatbot/ask_chat_bot`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${auth.tokenType} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Lỗi API ChatBot:", text);
      throw new Error(`API Error ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response: ${text}`);
    }

    const data = await res.json();
    console.log("✅ ChatBot API trả JSON:", data);

    return data as ChatBotResponse;
  } catch (err) {
    console.error("❌ Lỗi gọi API ChatBot:", err);
    throw err;
  }
}
