# environment

# 🌍 Dự Án "Màu Xanh Tương Lai" — Học Sinh Lớp 10.3

> **Chung tay hành động vì một Việt Nam Xanh - Sạch - Bền Vững**  
> Dự án học tập liên môn: **Địa lý • Giáo dục Kinh tế & Pháp luật • Tin học**  
> Tập thể học sinh: **Lớp 10.3 • Năm học 2025 - 2026**

---

## 📌 1. Giới Thiệu Dự Án

Trang web **"Màu Xanh Tương Lai"** là sản phẩm truyền thông và thực nghiệm khoa học số do học sinh Lớp 10.3 thực hiện. Trang web được thiết kế giao diện tươi sáng, hiện đại, thân thiện với lứa tuổi học sinh, kết hợp công nghệ **WebGL (Three.js)** để mô phỏng sống động các hiện tượng thời tiết cực đoan và thiên tai gắn liền với thực tiễn Việt Nam.

---

## 🧭 2. Cấu Trúc Các Trang Trong Hệ Thống

Dự án được phân chia thành **8 trang web chuyên biệt** với thanh điều hướng HUD đồng bộ:

| Tên File | Chức Năng Chính |
| :--- | :--- |
| [`index.html`](index.html) | **Trang chủ trung tâm**: Điểm nhấn video clip truyền thông *"1 Phút Xanh"* của Nhóm 3, tóm tắt các khu vực nổi bật và liên kết điều hướng toàn hệ thống. |
| [`trien-lam-poster.html`](trien-lam-poster.html) | **Triển lãm 8 tranh cổ động**: Trưng bày toàn bộ các sản phẩm tranh vẽ tay và đồ họa của các nhóm học sinh với bộ lọc danh mục và Lightbox phóng to chi tiết. |
| [`trung-tam-mo-phong.html`](trung-tam-mo-phong.html) | **Cổng trung tâm mô phỏng 3D**: Giới thiệu và dẫn lối vào 4 phòng thí nghiệm biến đổi khí hậu tương tác 360°. |
| [`mo-phong-han-han.html`](mo-phong-han-han.html) | **☀️ 3D Hạn mặn Miền Tây**: Mô phỏng nứt đất Voronoi, muối kết tinh đôi bờ, cột thủy chí đo mực nước sông, xuồng ba lá mắc cạn và **cửa cống thủy lợi ngăn mặn** tự động đóng mở khi độ mặn vượt 4‰. |
| [`mo-phong-bao-lu.html`](mo-phong-bao-lu.html) | **🌀 3D Bão lũ Miền Trung - Bắc**: Khung cảnh đường phố đô thị Việt Nam ngập lụt, xe hơi chết máy trôi dạt có đèn xi nhan nhấp nháy, xe máy ngã sóng xoài, cột mốc ngập lụt đô thị và hiện tượng **tôn bay trong gió bão cấp 12+**. |
| [`mo-phong-bang-tan.html`](mo-phong-bang-tan.html) | **🧊 3D Băng tan & Biển dâng**: Mô hình kép trực quan — Vách băng lục địa nứt lở (*Ice Calving*) rơi xuống biển kết hợp với **tuyến đê biển bê tông** bảo vệ làng chài ven biển Việt Nam (nước tràn vỡ đê khi biển dâng cao). |
| [`mo-phong-chay-rung.html`](mo-phong-chay-rung.html) | **🔥 3D Nắng nóng & Cháy rừng**: Mô phỏng nhiệt độ gay gắt, độ ẩm giảm kiệt và nguy cơ bùng phát cháy rừng phòng hộ. |
| [`so-tay-song-xanh.html`](so-tay-song-xanh.html) | **🌱 Sổ tay kêu gọi sống xanh**: Chiến dịch kêu gọi toàn trường cùng thực hiện 6 thói quen xanh, bộ đếm chữ ký đồng hành thời gian thực và Thử thách *"7 Ngày Sống Xanh"*. |

---

## 🛠️ 3. Công Nghệ Sử Dụng

* **Ngôn ngữ**: HTML5 Semantic, CSS3 Vanilla (Custom Properties, Glassmorphism, Responsive Grid/Flexbox).
* **Đồ họa 3D**: [Three.js](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) & OrbitControls — Toàn bộ mô hình địa hình, đường xá, phương tiện và thời tiết được xây dựng bằng thuật toán procedural, không phụ thuộc tài nguyên 3D ngoài.
* **Giao diện**: Hỗ trợ chuyển đổi mượt mà 2 chế độ **Giao diện Sáng (Light Mode)** và **Giao diện Tối (Dark Mode)** lưu trữ qua `localStorage`.

---

## 🚀 4. Hướng Dẫn Chạy Trang Web Trên Máy Cục Bộ

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/khoavip2070/environment.git
   cd environment
   ```

2. **Khởi chạy Local HTTP Server (khuyến nghị để tải video và shader mượt mà):**
   * Sử dụng Python:
     ```bash
     python -m http.server 3000
     ```
   * Hoặc mở thư mục bằng **VS Code** và nhấn **"Go Live"** (Extension Live Server).

3. **Mở trình duyệt truy cập:**
   ```text
   http://localhost:3000/
   ```

---

## 💐 5. Lời Tri Ân

Tập thể học sinh Lớp 10.3 xin chân thành cảm ơn quý Thầy Cô bộ môn:
* **Bộ môn Địa lý**: Hướng dẫn số liệu khoa học khí tượng và xâm nhập mặn Đồng bằng sông Cửu Long.
* **Bộ môn Giáo dục Kinh tế & Pháp luật**: Định hướng trách nhiệm công dân và cam kết Net Zero của Việt Nam.
* **Bộ môn Tin học**: Hướng dẫn xây dựng website, xử lý đa phương tiện và lập trình mô phỏng tương tác.

---
© 2026 Dự Án Học Tập Lớp 10.3 • Trường THPT • Việt Nam
