import type { Subject } from "@/features/subjects/types";
import type { Conversation } from "../types";

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function contains(text: string, phrase: string) {
  return (` ${text} `).includes(` ${normalize(phrase)} `);
}

// Conservative prototype rules, not an AI classifier. Match only existing subjects.
const topics = [
  { names: ["học máy", "machine learning"], terms: ["linear regression", "hồi quy tuyến tính", "decision tree", "cây quyết định", "overfitting", "regularization", "gradient descent", "supervised learning"] },
  { names: ["lý thuyết thông tin", "information theory"], terms: ["mutual information", "thông tin tương hỗ", "dung lượng kênh", "mã hóa nguồn"] },
  { names: ["xử lý ngôn ngữ tự nhiên", "natural language processing", "nlp"], terms: ["phobert", "tokenization", "tokenizer", "tách từ", "word embedding", "phân tích cảm xúc"] },
];

export function classifyQuestion(question: string, subjects: Subject[], selectedSubjectId: string | null = null): {
  subjectId: string | null; classification: Conversation["classification"];
} {
  if (selectedSubjectId && subjects.some((subject) => subject.id === selectedSubjectId)) {
    return { subjectId: selectedSubjectId, classification: "manual" };
  }
  const text = normalize(question);
  const ranked = subjects.map((subject) => {
    const name = normalize(subject.name);
    let score = name && contains(text, name) ? 10 : 0;
    for (const topic of topics) {
      if (topic.names.some((alias) => contains(name, alias))) {
        score += topic.terms.filter((term) => contains(text, term)).length * 3;
      }
    }
    // Custom subjects can also match their explicitly configured current topic.
    const currentTopic = normalize(subject.currentTopic);
    if (score === 0 && currentTopic !== "entropy" && currentTopic.split(" ").length >= 2 &&
      currentTopic !== "chua chon chu de" && contains(text, currentTopic)) score += 3;
    return { id: subject.id, score };
  }).sort((a, b) => b.score - a.score);
  if (ranked[0]?.score >= 3 && ranked[0].score - (ranked[1]?.score ?? 0) >= 2) {
    return { subjectId: ranked[0].id, classification: "automatic" };
  }
  const general = ["lập kế hoạch học", "kế hoạch học tập", "quản lý thời gian", "cách ghi nhớ", "phương pháp học", "xin chào"]
    .some((phrase) => contains(text, phrase));
  return { subjectId: null, classification: general && !ranked[0]?.score ? "general" : "uncertain" };
}

export function titleFromQuestion(question: string) {
  const title = question.trim().replace(/\s+/g, " ");
  return title.length > 80 ? `${title.slice(0, 77)}…` : title;
}
