export type ChatRole = "user" | "assistant";

export type ChatImage = { id: string; name: string; type: string; size: number };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  images?: ChatImage[];
  documents?: ChatImage[];
};

export type Conversation = {
  classification?: "automatic" | "manual" | "uncertain" | "general";
  id: string;
  subjectId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type TutorRequest = {
  conversationId: string;
  subjectId: string | null;
  subjectName?: string;
  messages: ChatMessage[];
};
