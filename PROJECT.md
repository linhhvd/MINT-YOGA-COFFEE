# Mint Yoga & Coffee

Trang giới thiệu phòng tập yoga tại Tân Phú, TP.HCM. Thay site Google Sites tại mintyogacoffee.com bằng trang tĩnh, rồi xuất bản qua GitHub Pages và trỏ tên miền sẵn có.

## Stack

- HTML, CSS, JavaScript thuần. Không framework, không bước build.
- Một trang `index.html`, các mục menu cũ là các section.

## Chạy / xem

```powershell
python -m http.server 5500
```

Mở http://127.0.0.1:5500/

## Module map

- `index.html` — toàn bộ nội dung
- `css/styles.css` — giao diện
- `js/main.js` — menu, highlight ngày hôm nay
- `favicon.svg` — icon lá

## Quyết định

- Không bịa bài viết. Chỉ đưa chữ đã đọc được trên site cũ. Ba bài dạng ảnh (Drishti, lời tri ân, liên kết cơ thể) được ghi tên, chưa chép nội dung.
- Thông báo 2024–2025 để trong mục lưu trữ. Phần đang hiện trên site cũ không có thông báo mới.
- Lịch học theo hai bảng Yoga 1 và Yoga 2 trên trang Lịch học.

## Xuất bản (chưa xong)

- Repo dự kiến: `linhhvd/mint-yoga-coffee`, GitHub Pages.
- `CNAME` trong repo: `mintyogacoffee.com`.
- DNS hiện tại: GoDaddy. `www` trỏ `ghs.googlehosted.com` (Google Sites). Đổi DNS sau khi Pages đã lên.
