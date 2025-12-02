# HR Pro (Mock Frontend)

Skeleton project structure for the HR management demo per specification.

## Nhận diện khuôn mặt

Frontend hiện sử dụng `face-api.js` (TensorFlow.js) để chụp một khung hình từ camera, phát hiện khuôn mặt và chuyển thành vector đặc trưng (`Float32Array`). Vector này được gửi lên backend để:

- Lưu embedding khi nhân viên đăng ký khuôn mặt (POST `/api/enroll-face`).
- Chấm công bằng check-in/check-out (POST `/api/checkin`).

### Chuẩn bị môi trường

1. **Cài thư viện**

   ```bash
   npm install face-api.js @tensorflow/tfjs @types/face-api.js
   ```

2. **Model face-api.js**

   Mặc định ứng dụng đang tải model trực tiếp từ CDN:

   ```
   https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/
   ```

   Nếu muốn lưu model cục bộ (để chạy offline), tải 6 file weights tại repo face-api.js và đặt vào `public/face-models`, sau đó cấu hình biến môi trường:

   ```
   VITE_FACE_MODEL_URL=/face-models
   ```

3. **Cấu hình backend**

   - `POST /api/enroll-face`  
     Body: `{ "employeeId": string, "embedding": number[], "snapshot": string }`  
     Lưu vào bảng `face_embeddings`.
   - `POST /api/checkin`  
     Body: `{ "embedding": number[], "type": "checkin" | "checkout", "threshold": number }`  
     Backend so khớp vector với bảng `face_embeddings`, tính khoảng cách (Euclid/cosine). Nếu nhỏ hơn ngưỡng thì ghi bản ghi vào bảng `attendances` và trả `{ employeeId, timestamp, distance }`.
   - `GET /api/employees/:employeeId/face`  
     Trả `{ registered: boolean }` để xác định nhân viên đã có embedding hay chưa.

Frontend tự động fallback sang `localStorage` để lưu embedding và mô phỏng so khớp nếu backend chưa sẵn sàng, giúp quy trình đăng ký/chấm công vẫn hoạt động trong môi trường demo.
