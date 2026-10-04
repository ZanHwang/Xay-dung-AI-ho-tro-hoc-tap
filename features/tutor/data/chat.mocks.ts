import type { ChatMessage } from "@/features/tutor/types";

export const starterMessages: ChatMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "Chào Đức, mình là JARVIS. Hôm nay bạn muốn tiếp tục Lý thuyết thông tin hay hỏi về một chủ đề khác?",
    timestamp: "20:42",
  },
];
