# Soulmate
Đồ án môn học Lập trình ứng dụng Web - NT208
## Đề tài app hẹn hò se duyên
Kết cấu giống phiên bản Shopee của ứng dụng Tinder nổi tiếng (^_^)
## TÓM TẮT LUỒNG HOẠT ĐỘNG CHÍNH:
- Người dùng mới cần vào localhost:3000/signup để tạo tài khoản mới, email được chọn làm user_id luôn vì trên thực tế email không bao giờ trùng lắp. Sau khi đăng kí thành công jwt token được cấp và lưu vào localStorage.   
- Lần đầu vào trang localhost:3000/app/recs, ứng dụng sẽ xin người dùng cho truy cập GPS. Ứng dụng cần GPS để lọc bớt các hồ sơ ở khoảng cách quá xa (khoảng 30 km) bằng ngeohash.
- Sau đó server sử dụng các bình luận (viewpoint) của các hồ sơ mà tính toán cosin similarity của các hồ sơ khác  SO VỚI NGƯỜI DÙNG NÀY, với mỗi LABEL(ví dụ trong hình POLITICIAN hay TV_SERIES) mà người dùng này có quan tâm đến, mà hồ sơ kia cũng quan tâm, và cùng quan tâm tới ít nhất là 1 ENTITY (như Squid Game, Harry Potter, BTS, v.v) thì thành phần vector sẽ được coi là 1. Cứ thế ta nhân vô hướng 2 vector, rồi nhân 0.85 (hay 85%), 15% còn lại được xét cộng thêm nếu viewpoint (bình luận) của hồ sơ kia KHÔNG ĐỂ TRỐNG. Xếp hạng các hồ sơ ở trong possiblematches của người dùng GIẢM DẦN theo cosinesimilarity. Logic này do src/utils/cosinesimilarityworker.js thực hiện.
![Alt text](cos.png)
## HƯỚNG DẪN CHẠY THỬ:
- Trước tiên cần lệnh npm install để cài đặt hết các thứ nêu trong package.json
- Sau đó, mở 2 terminal Powershell, trên 1 cái  npm run dev  để chạy web server, trên cái còn lại thì node socket-server.js để chạy socket.io server.
## MỘT SỐ LƯU Ý:
- Ứng dụng có Google OAuth, nhưng chỉ nội bộ gm.uit.edu.vn, và số lượng tài khoản mail thực này rất ít , vì thế, để tạo các tài khoản dummy chạy thử, cần phải truy cập thủ công vào localhost:3000/signup.
- Khi tạo tài khoản người dùng dummy mới để chạy thử ứng dụng, mà chưa thấy hiển thị lên /app/recs , thì nên thử tải lại trang /app/recs ở cả 2 tài khoản, vì bộ phận updatelocation và thêm các hồ sơ vào possiblematches chưa được mượt cho lắm.
- Vẫn chưa thể chạy thử ứng dụng trên Android, vì Android yêu cầu https thì mới cấp quyền GPS.
- Tạm thời, vì đang chạy thử nghiệm, chưa tới trạng thái “bạn đã xem hết hồ sơ”, trên thực tế thì điều này phải xảy ra. Nhưng ở đây do số lượng hồ sơ dummy để chạy thử ứng dụng khá nhỏ nên danh sách possiblematches vẫn đang được thiết lập giống như một cái danh sách vòng tròn (circular list), người dùng duyệt hết sẽ quay lại duyệt từ đầu. Tất nhiên hồ sơ nào đã matched rồi thì /app/recs sẽ không hiển thị nữa.
- Phần đồ án này có hạn chế rất lớn là vẫn còn lưu chủ yếu ở trên RAM (globalThis). Có thể mở file soulmate.sql để coi qua về MySQL database schema. Thao tác với MySQL do src/utils/db.js thực hiện. Một số thông tin quan trọng dùng cho MySQL lưu trong .env.local.
- Vẫn còn phải sử dụng một file .txt tạm để gửi notification về lượt match mới cho người dùng.
## MỘT SỐ TÀI NGUYÊN BỔ SUNG (CÂY THƯ MỤC CỦA ĐỒ ÁN, HÌNH ẢNH DÙNG KHI ĐĂNG KÍ ):
- Folder structure của đồ án cùng một số hình ảnh có thể dùng khi signup dummy user có thể xem tại:
  https://drive.google.com/drive/folders/1DDGzVR2Z11xoW87afdX09mwqjfeIyyCN





