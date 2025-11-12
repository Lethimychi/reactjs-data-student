# 🎓 Dashboard Phân Tích Theo Sinh Viên

## 🎯 Mục tiêu
Xây dựng hệ thống hiển thị, thống kê và trực quan hóa dữ liệu học tập của **từng sinh viên** theo học kỳ, năm học và toàn khóa.

---

## 🧩 1. Hiển thị thông tin sinh viên
- **Mã số sinh viên, tên, lớp, khu vực**  
  👉 Hiển thị bằng: `Text Card` hoặc `Info Box`

---

## 🧾 2. Thông tin học kỳ
- Sinh viên đã học được tổng cộng bao nhiêu học kỳ?  
  👉 Hiển thị bằng: `Dropdown`

- Trong mỗi học kỳ, sinh viên học những môn nào?  
  👉 Hiển thị bằng: `Dropdown List`

---

## 📊 3. Thống kê GPA & học lực
- GPA của sinh viên theo từng học kỳ, năm học và loại học lực hiện tại (theo GPA).  
  👉 Biểu đồ: `Line Chart + KPI Card + Text Label`

- GPA trung bình toàn khóa học là bao nhiêu?  
  👉 Biểu đồ: `Donut Chart`  
  *(Tổng là 10, khi hover hiển thị loại học lực)*

---

## 📈 4. Tỷ lệ đậu/rớt môn học
- Tỷ lệ qua môn (số môn đậu / tổng môn) của sinh viên cho từng học kỳ, năm học và toàn khóa.  
  👉 Biểu đồ: `Bar Chart` hoặc `Donut Chart`

---

## 📋 5. Điểm chi tiết & bảng điểm
- Điểm chi tiết từng môn học trong mỗi học kỳ.  
  👉 Hiển thị bằng: `Table`  
  *(Mỗi học kỳ tương ứng 1 bảng riêng)*

- Trong kỳ học, môn nào sinh viên đạt cao nhất / thấp nhất?  
  👉 Hiển thị bằng: `2 KPI Cards` hoặc `Bar Ranking (Top 1 cao nhất/thấp nhất)`

---

## 📊 6. So sánh với trung bình toàn bộ sinh viên
- Trung bình điểm của sinh viên trong mỗi học so với trung bình chung của toàn bộ sinh viên học môn đó.  
  👉 Biểu đồ: `Line and Column Chart`  
  *(So sánh để biết sinh viên học tốt hơn hay yếu hơn trung bình lớp)*

---

## 📉 7. Xu hướng học tập
- Xu hướng GPA qua các học kỳ: tăng, giảm hay ổn định?  
  👉 Biểu đồ: `Line Chart (GPA theo thời gian)`

- Điểm rèn luyện của sinh viên trong từng học kỳ là bao nhiêu?  
  👉 Biểu đồ: `Column Chart`

---

## 🔄 8. Tương quan giữa GPA và điểm rèn luyện
- Kiểm tra xem GPA và điểm rèn luyện có tỷ lệ thuận với nhau không.  
  👉 Biểu đồ: `Scatter Chart`

---

## 🥇 9. Phân loại môn học
- Tỷ lệ môn học đạt loại **Giỏi**, **Khá**, **Trung bình**, **Yếu** của sinh viên là bao nhiêu?  
  👉 Biểu đồ: `Donut Chart` hoặc `Pie Chart`

---
Done
## 💡 Gợi ý mở rộng
- Lọc dữ liệu theo **năm học**, **ngành học**, hoặc **khu vực**.  
- Tích hợp **dashboard tổng hợp** để so sánh sinh viên với trung bình lớp/khoa/toàn trường.  
- Cho phép **xuất báo cáo PDF hoặc Excel**.  
- Gợi ý thêm: sử dụng thư viện như `ECharts`, `Recharts`, hoặc `Chart.js` để biểu diễn dữ liệu.

---

## 📅 Phân chia công việc

| STT | Tên chức năng | Loại hiển thị | Ghi chú |
|-----|----------------|----------------|----------|
| 1 | Thông tin sinh viên | Text Card | Mã, tên, lớp |
| 2 | Số học kỳ đã học | Dropdown | Tổng học kỳ |
| 3 | Danh sách môn học | Dropdown List | Theo học kỳ |
| 4 | GPA theo kỳ/năm/toàn khóa | Line + KPI + Text | Có học lực |
| 5 | Tỷ lệ đậu/rớt | Bar / Donut | Theo kỳ & toàn khóa |
| 6 | Điểm chi tiết | Table | Mỗi học kỳ 1 bảng |
| 7 | Môn cao nhất/thấp nhất | KPI / Bar Ranking | Top 1 |
| 8 | So sánh trung bình | Line + Column | So với lớp |
| 9 | Xu hướng GPA | Line Chart | Theo thời gian |
| 10 | Điểm rèn luyện | Column Chart | Theo kỳ |
| 11 | Liên hệ GPA–rèn luyện | Scatter Chart | Tương quan |
| 12 | Phân loại môn | Donut / Pie | Giỏi–Khá–TB–Yếu |

---

## 🛠️ Công nghệ gợi ý
- **Frontend:** ReactJS / Next.js / Vue  
- **Charts:** Chart.js, Recharts, ECharts  
- **Backend:** FastAPI / ASP.NET Core / NestJS  
- **Database:** PostgreSQL hoặc MySQL  
- **Triển khai:** Docker, Vercel hoặc Azure Web App

---

📍 **Người thực hiện:** *[Tên bạn hoặc nhóm dự án]*  
📅 **Cập nhật lần cuối:** *Tháng 11 / 2025*
