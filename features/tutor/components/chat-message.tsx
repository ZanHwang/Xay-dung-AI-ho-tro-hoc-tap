import { Bot } from "lucide-react";
import { ChatImageView } from "./chat-image";
import { ChatDocument } from "./chat-document";
import type { ChatMessage as ChatMessageModel } from "@/features/tutor/types";

type ChatMessageProps = {
  message: ChatMessageModel;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
          <Bot className="size-4" />
        </span>
      ) : null}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-md bg-blue-500 text-white"
            : "rounded-bl-md border border-border bg-card text-foreground"
        }`}
      >
        {!!message.images?.length && <div className="mb-2 flex flex-wrap gap-2">{message.images.map((image) => <ChatImageView key={image.id} image={image} />)}</div>}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
        {message.documents?.map((document) => <ChatDocument key={document.id} document={document} />)}
        <p
          className={`mt-2 text-[11px] ${
            isUser ? "text-blue-100" : "text-muted-foreground"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
