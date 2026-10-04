import type { TutorRequest } from "../types";

export async function generateTutorReply(request: TutorRequest): Promise<string> {
  const latest = request.messages.filter((message) => message.role === "user").at(-1);
  const question = latest?.content ?? "";
  if (latest?.documents?.length) return "Đã nhận tài liệu đính kèm. Bản demo lưu tệp cùng cuộc hội thoại, chưa trích xuất hoặc đọc nội dung tài liệu bằng AI. Bạn có thể nhập nội dung cần hỏi để tiếp tục.";
  if (latest?.images?.length) {
    return `Đã nhận ${latest.images.length} ảnh bài tập${request.subjectName ? ` trong môn ${request.subjectName}` : ""}. Bản demo chưa có AI thị giác/OCR nên mình chưa đọc hoặc giải bài trong ảnh. Bạn có thể nhập nội dung đề bài để tiếp tục thử luồng hội thoại.`;
  }
  const normalizedQuestion = question.toLowerCase();

  if (
    normalizedQuestion.includes("mutual") ||
    normalizedQuestion.includes("thông tin tương hỗ")
  ) {
    return "Mutual Information đo lượng thông tin mà biến Y cung cấp về biến X. Có thể hiểu là mức giảm bất định về X sau khi biết Y. Công thức thường dùng: I(X;Y) = H(X) - H(X|Y).";
  }

  return `Mình đã ghi nhận câu hỏi ${request.subjectName ? `trong môn ${request.subjectName}` : "học tập chung"}: “${question}”. Cuộc hội thoại hiện có ${request.messages.filter((message) => message.role === "user").length} câu hỏi. Phản hồi đang được mô phỏng; chưa kết nối AI hoặc tìm kiếm trong tài liệu.`;
}
