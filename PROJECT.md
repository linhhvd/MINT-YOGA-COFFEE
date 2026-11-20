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
- `js/main.js` — menu, lịch đọc từ `data/lịch học.csv`
- `js/bot.js` — Mint bot. Lịch lấy từ `data/lịch học.csv`. Prompt Gemini lấy từ `data/prompt min bot.txt` qua Apps Script.
- `data/lịch học.csv` — bảng lịch học trên trang và cho Mint bot
- `data/prompt min bot.txt` — prompt và thông tin phòng tập gửi cho Gemini
- `bot/Code.gs` — Apps Script gọi `gemini-3.1-flash-lite`, đọc hai file trên từ GitHub Pages. Hai khóa `GEMINI_API_KEY_1` và `GEMINI_API_KEY_2` xoay tua trong Script properties, không đưa vào repo.
- `img/logo-white.png` — logo trắng trên header khi đầu trang. `img/logo-teal.png` — logo `#0D9488` khi header cuộn/thu gọn và ở footer. `img/logo-mint.png` giữ trong repo.
- `img/mint-bot.png` — robot xanh lá mint, lá có cuống ở trên đầu, lắc sau mỗi lần chớp mắt, nền trong suốt, nút giữa mục liên lạc
- `img/favicon.png` — icon tab

## Quyết định

- Không bịa bài viết. Chỉ đưa chữ đã đọc được trên site cũ. Ba bài dạng ảnh (Drishti, lời tri ân, liên kết cơ thể) chưa đưa lên trang.
- Thông báo 2024–2025 để trong mục lưu trữ. Hiện 3 tin mới nhất + “Xem thông báo cũ hơn…” / “Thu gọn”. Hẹp (≤390): một cột, cùng lúc một card mở, card đầu mở sẵn. Trung bình + rộng: hai cột — lead trái luôn mở full + viền xanh; hai tin còn lại (và tin cũ khi mở thêm) ở cột phải, cùng lúc một card phải mở.
- Bài viết: `_list.csv` `title;ngày;file;file;…` (txt/jpg/png/gif, không giới hạn), nạp dòng cuối → đầu, fetch song song. Card: ảnh đầu + text đầu (cắt). Overlay hẹp: file theo thứ tự CSV; TB+rộng: trái txt, phải ảnh; khoảng hở đứng giữa các phần trong mỗi cột đều nhau (`gap`). Thiếu file: `<not found>` / `<img not found>`. Lưới 1/2/3 cột; tối đa 6 + “Xem tất cả…”.
- Lịch học lấy từ `data/lịch học.csv`. Chỉ Ms. Thủy Tiên. Không ghi Yoga 1 hay Yoga 2. Mint bot chỉ dùng `data/prompt min bot.txt` và `data/lịch học.csv`, không đọc Google Sheet. Hẹp + trung bình: xếp từng ngày. Rộng: bảng tuần như hiện tại.
- Giao diện **ba** case: hẹp ≤390px (iPhone thường dọc), trung bình 391–1023px, rộng ≥1024px (iPad thường ngang / laptop). Header/footer: logo–slogan–kích thước giống nhau; menu hẹp+TB = nút, rộng = hàng chữ. Khi chỉnh UI chưa nói rõ 3 case → hỏi lại.
- Nền section xen kẽ mọi màn hình: Về chúng tôi `#f3efe6` → Lịch `#e7e1d4` → Thông báo `#f3efe6` → Bài viết `#e7e1d4`; Liên lạc `#143833`.
- Popup từ `_list.csv` khi còn `;ngày hết hạn` và còn hạn (sau 5s, tối đa 3 mới nhất): không `;màu` → kicker “Thông báo”, nền kem như card tin; có `;G|P|O` → kicker “Sự kiện”, xanh mint (gradient mint đậm) / tím / cam (gradient về đen) + chiếu sáng. Scrim `rgba(16,28,26,0.25)` (mờ hơn ảnh). Chỉ đóng bằng nút X. Hẹp giữ cỡ chữ; TB+rộng ≈ 1.4×. Cascade: đáy ngang, card trên thấp hơn. Kicker “Thông báo/Sự kiện” luôn góc trên trái; chỉ title/date/body căn giữa dọc khi không tràn. Card tin + popup hiện “Ngày đăng d/m/y” (nghiêng, nhỏ); không hiện ngày hết hạn. File thiếu: `<not found>` / `<img not found>` (nghiêng, nhỏ, mờ).
- Về chúng tôi: thư cô Thủy Tiên, video, rồi card ảnh hoạt động. Hẹp+TB một cột. Rộng hai cột (trái thư; phải video + card ảnh). Ảnh trong `data/ảnh hoạt động` (không để trong `img/`). Card: 4 / 8 / 12 thumbnail ngẫu nhiên, đổi mỗi 15s; bấm mở overlay xem hết ảnh (đứng: 1 cột + up/down; ngang: 1 hàng + back/forward; theo cao/rộng cửa sổ trang; ảnh contain full trong khung).
- Mục liên lạc: nút tròn hai bên, Mint bot ở giữa, không vòng tròn, chớp mắt định kỳ. Đỉnh robot ngang đỉnh nút điện thoại. Ô “Chat với Mint Bot” nằm ngay dưới, hở thêm vài pixel, bề ngang vừa chữ, bấm được như robot. Band thu: cụm bot + chữ Chat căn giữa dọc ô xanh (mọi màn). Band nở: từ dưới lên, đỉnh gần sát chân header trắng (cao = visualViewport − đáy header), mọi màn; nút tròn ẩn, ô chat chiếm hết ô xanh. Robot thu nhỏ vào góc chat. Góc trên phải ô chat có nút tròn dấu trừ. Bấm ra ngoài thì thu. Khi nở trang cuộn để đáy band sát đáy viewport; đóng thì chat thu trước, band thấp dần, cuộn về chỗ cũ. Hẹp đóng ~17rem; TB+rộng đóng ~3/4 chiều cao cũ. Hẹp: sáu nút một hàng khi đóng. Địa chỉ và Chị Thủy Tiên ở footer.

## Xuất bản

- Bản mới: https://linhhvd.github.io/MINT-YOGA-COFFEE/ (Pages, nhánh `main`).
- Đã gỡ custom domain và xóa `CNAME` để `github.io` không chuyển sang Google Sites.
- `mintyogacoffee.com` vẫn là Google Sites. DNS GoDaddy giữ nguyên cho đến khi chuyển site.
- Khi chuyển tên miền: thêm lại `CNAME` với `mintyogacoffee.com`, gắn custom domain trên Pages, rồi sửa DNS.
