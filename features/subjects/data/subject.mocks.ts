import type { Subject } from "@/features/subjects/types";

export const initialSubjects: Subject[] = [
  {
    id: "information-theory",
    name: "Lý thuyết thông tin",
    shortName: "LTTT",
    description:
      "Entropy, mã hóa nguồn, thông tin tương hỗ và dung lượng kênh.",
    progress: 68,
    lessons: 12,
    lastStudied: "Hôm nay, 20:30",
    accent: "cyan",
    currentTopic: "Mutual Information",
  },
  {
    id: "machine-learning",
    name: "Học máy",
    shortName: "ML",
    description:
      "Các mô hình học có giám sát, đánh giá và tối ưu mô hình.",
    progress: 54,
    lessons: 18,
    lastStudied: "Hôm qua",
    accent: "violet",
    currentTopic: "Regularization",
  },
  {
    id: "natural-language-processing",
    name: "Xử lý ngôn ngữ tự nhiên",
    shortName: "NLP",
    description:
      "Tiền xử lý tiếng Việt, embedding, Transformer và PhoBERT.",
    progress: 41,
    lessons: 14,
    lastStudied: "3 ngày trước",
    accent: "amber",
    currentTopic: "Attention mechanism",
  },
];
