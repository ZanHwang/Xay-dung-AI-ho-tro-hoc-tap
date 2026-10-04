import type { Subject } from "@/features/subjects/types";
import type { QuizQuestion } from "../types";

function q(id: string, topic: string, difficulty: QuizQuestion["difficulty"], prompt: string, options: string[], correctIndex: number, explanation: string): QuizQuestion {
  return { id, topic, difficulty, prompt, options, correctIndex, explanation };
}
const banks: Record<string, QuizQuestion[]> = {
  information: [
    q("info-1", "Entropy", "easy", "Entropy Shannon đo đại lượng nào?", ["Mức bất định trung bình", "Tốc độ CPU", "Số lớp mạng", "Kích thước màn hình"], 0, "Entropy biểu diễn mức bất định trung bình của một biến ngẫu nhiên theo phân phối xác suất của nó."),
    q("info-2", "Entropy", "medium", "Một đồng xu công bằng có entropy bằng bao nhiêu khi dùng log cơ số 2?", ["0 bit", "0,5 bit", "1 bit", "2 bit"], 2, "H = −2 × (1/2) × log₂(1/2) = 1 bit."),
    q("info-3", "Entropy", "hard", "Biến ngẫu nhiên có 4 giá trị đồng xác suất có entropy bằng bao nhiêu?", ["1 bit", "2 bit", "4 bit", "0 bit"], 1, "Với n giá trị đồng xác suất, H = log₂(n). Vì vậy log₂(4) = 2 bit."),
    q("info-4", "Thông tin tương hỗ", "easy", "Nếu X và Y độc lập thì I(X;Y) bằng bao nhiêu?", ["1", "H(X)", "H(Y)", "0"], 3, "Hai biến độc lập không cung cấp thông tin về nhau, nên thông tin tương hỗ bằng 0."),
    q("info-5", "Thông tin tương hỗ", "medium", "Công thức nào đúng?", ["I(X;Y) = H(X) − H(X|Y)", "I(X;Y) = H(X) + H(X|Y)", "I(X;Y) = −H(X)", "I(X;Y) = H(X|Y) − H(Y)"], 0, "Thông tin tương hỗ là mức giảm bất định về X khi biết Y."),
    q("info-6", "Thông tin tương hỗ", "hard", "Nếu H(X) = 3 bit và H(X|Y) = 1 bit thì I(X;Y) là bao nhiêu?", ["4 bit", "1 bit", "2 bit", "3 bit"], 2, "Áp dụng I(X;Y) = H(X) − H(X|Y) = 3 − 1 = 2 bit."),
  ],
  learning: [
    q("ml-1", "Hồi quy tuyến tính", "easy", "Hồi quy tuyến tính thường dùng để dự đoán gì?", ["Chỉ nhãn văn bản", "Một giá trị số liên tục", "Chỉ hình ảnh", "Tên biến"], 1, "Hồi quy dự đoán đại lượng số như giá nhà; hồi quy tuyến tính mô hình hóa quan hệ tuyến tính với các đặc trưng."),
    q("ml-2", "Hồi quy tuyến tính", "medium", "MSE là gì?", ["Trung bình sai số tuyệt đối", "Tỷ lệ phân loại đúng", "Trung bình bình phương sai số", "Sai số lớn nhất"], 2, "MSE = tổng (giá trị dự đoán − giá trị thực)² chia cho số mẫu."),
    q("ml-3", "Hồi quy tuyến tính", "hard", "Với dự đoán [2, 4] và giá trị thực [1, 2], MSE bằng bao nhiêu?", ["1,5", "5", "2", "2,5"], 3, "MSE = ((2−1)² + (4−2)²)/2 = (1+4)/2 = 2,5."),
    q("ml-4", "Overfitting", "easy", "Dấu hiệu thường gặp của overfitting là gì?", ["Kết quả huấn luyện tốt nhưng kiểm tra kém", "Mọi tập đều không có mẫu", "Mô hình không có tham số", "Dữ liệu luôn tuyến tính"], 0, "Mô hình học quá sát dữ liệu huấn luyện và khái quát kém trên dữ liệu mới."),
    q("ml-5", "Overfitting", "medium", "Regularization nhằm mục đích gì?", ["Xóa nhãn của toàn bộ dữ liệu", "Khuyến khích mô hình quá phức tạp", "Hạn chế độ phức tạp để giảm overfitting", "Đảm bảo sai số luôn bằng 0"], 2, "Regularization thêm ràng buộc hoặc hình phạt vào quá trình học để hạn chế mô hình quá phức tạp."),
    q("ml-6", "Overfitting", "hard", "Tập nào nên dùng để chọn hệ số regularization trước khi đánh giá cuối cùng?", ["Tập test cuối cùng", "Tập validation hoặc các fold validation", "Chỉ dữ liệu chưa có nhãn", "Không cần dữ liệu"], 1, "Dùng validation để chọn siêu tham số; giữ tập test độc lập cho đánh giá cuối cùng để tránh rò rỉ thông tin."),
  ],
  language: [
    q("nlp-1", "Tokenization", "easy", "Tokenization là thao tác gì?", ["Xóa mọi từ", "Tăng độ sáng ảnh", "Chia văn bản thành các đơn vị token", "Nén âm thanh"], 2, "Tokenization chia văn bản thành token, có thể là từ, từ con hoặc ký tự tùy bộ tách."),
    q("nlp-2", "Tokenization", "medium", "Một token có luôn tương ứng với một từ hoàn chỉnh không?", ["Không, token có thể là từ con", "Luôn luôn", "Chỉ khi có chữ số", "Token luôn là một câu"], 0, "Nhiều tokenizer dùng từ con, nên một từ có thể được biểu diễn bằng nhiều token."),
    q("nlp-3", "Tokenization", "hard", "Khi dùng mô hình đã huấn luyện trước, nên chọn tokenizer nào?", ["Bất kỳ tokenizer nào cũng tương đương", "Không cần tokenizer", "Chỉ tách theo dấu chấm", "Tokenizer tương thích với mô hình đó"], 3, "ID token và cách phân đoạn phải khớp từ vựng và cấu hình mà mô hình đã học."),
    q("nlp-4", "Embedding", "easy", "Embedding của từ thường được biểu diễn bằng gì?", ["Một tên file", "Một vector số", "Một bảng màu", "Một câu hỏi"], 1, "Embedding ánh xạ các đơn vị ngôn ngữ sang vector trong không gian số."),
    q("nlp-5", "Embedding", "medium", "Cosine similarity so sánh đặc điểm nào của hai vector khác vector 0?", ["Tên biến", "Số ký tự", "Độ dài file", "Hướng của hai vector"], 3, "Cosine similarity là tích vô hướng chia cho tích chuẩn, phản ánh góc giữa hai vector."),
    q("nlp-6", "Embedding", "hard", "Hai vector khác 0 vuông góc có cosine similarity bằng bao nhiêu?", ["1", "−1", "0", "2"], 2, "Hai vector vuông góc có tích vô hướng bằng 0, nên cosine similarity bằng 0."),
  ],
};

export function questionsForSubject(subject: Subject): QuizQuestion[] {
  const name = subject.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  if (/ly thuyet thong tin|information theory/.test(name)) return banks.information;
  if (/hoc may|machine learning/.test(name)) return banks.learning;
  if (/xu ly ngon ngu tu nhien|natural language processing|\bnlp\b/.test(name)) return banks.language;
  return [];
}
