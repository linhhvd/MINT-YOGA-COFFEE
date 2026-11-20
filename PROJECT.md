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
- `js/main.js` — menu, lịch đọc từ `data/Lịch học.csv`
- `js/bot.js` — Mint bot. Lịch lấy từ `data/Lịch học.csv`. Prompt Gemini lấy từ `data/Prompt Min Bot.txt` qua Apps Script.
- `data/Lịch học.csv` — bảng lịch học trên trang và cho Mint bot
- `data/Prompt Min Bot.txt` — prompt và thông tin phòng tập gửi cho Gemini
- `bot/Code.gs` — Apps Script gọi `gemini-3.1-flash-lite`, đọc hai file trên từ GitHub Pages. Hai khóa `GEMINI_API_KEY_1` và `GEMINI_API_KEY_2` xoay tua trong Script properties, không đưa vào repo.
- `img/logo-white.png` — logo trắng trên header khi đầu trang. `img/logo-teal.png` — logo `#0D9488` khi header cuộn/thu gọn và ở footer. `img/logo-mint.png` giữ trong repo.
- `img/mint-bot.png` — robot xanh lá mint, lá có cuống ở trên đầu, lắc sau mỗi lần chớp mắt, nền trong suốt, nút giữa mục liên lạc
- `img/favicon.png` — icon tab

## Quyết định

- Không bịa bài viết. Chỉ đưa chữ đã đọc được trên site cũ. Ba bài dạng ảnh (Drishti, lời tri ân, liên kết cơ thể) chưa đưa lên trang.
- Thông báo 2024–2025 để trong mục lưu trữ. Hiện 3 tin mới nhất + “Xem thông báo cũ hơn…” / “Thu gọn”. Hẹp (≤390): một cột, cùng lúc một card mở, card đầu mở sẵn. Trung bình + rộng: hai cột — lead trái luôn mở full + viền xanh; hai tin còn lại (và tin cũ khi mở thêm) ở cột phải, cùng lúc một card phải mở.
- Bài viết: card lưới đều; hẹp 1 cột, trung bình 2 cột, rộng 3 cột; tối đa 6 + “Xem tất cả bài viết…”. Bấm card mở overlay (giữ layout overlay hiện tại).
- Lịch học lấy từ `data/Lịch học.csv`. Chỉ Ms. Thủy Tiên. Không ghi Yoga 1 hay Yoga 2. Mint bot chỉ dùng `data/Prompt Min Bot.txt` và `data/Lịch học.csv`, không đọc Google Sheet. Hẹp + trung bình: xếp từng ngày. Rộng: bảng tuần như hiện tại.
- Giao diện **ba** case: hẹp ≤390px (iPhone thường dọc), trung bình 391–1023px, rộng ≥1024px (iPad thường ngang / laptop). Header/footer: logo–slogan–kích thước giống nhau; menu hẹp+TB = nút, rộng = hàng chữ. Khi chỉnh UI chưa nói rõ 3 case → hỏi lại.
- Nền section xen kẽ mọi màn hình: Về chúng tôi `#f3efe6` → Lịch `#e7e1d4` → Thông báo `#f3efe6` → Bài viết `#e7e1d4`; Liên lạc `#143833`.
- Sự kiện = thông báo đặc biệt trong `_list.csv` có thêm `;ngày hết hạn`. Còn hạn → card bình thường + overlay tím đậm khi mở trang (sau 5s). Scrim + card tone TPBank, chiếu sáng radial; chữ sáng. Hẹp giữ cỡ chữ; TB+rộng (≥391) chữ popup ≈ 1.4× hẹp. Khung overlay cùng viewport với bài viết/ảnh. Cascade tối đa 3: đáy ngang, card trên thấp hơn; nội dung không tràn thì căn giữa dọc.
- Về chúng tôi: thư cô Thủy Tiên, video, rồi card ảnh hoạt động. Hẹp+TB một cột. Rộng hai cột (trái thư; phải video + card ảnh). Ảnh trong `data/ảnh hoạt động` (không để trong `img/`). Card: 4 / 8 / 12 thumbnail ngẫu nhiên, đổi mỗi 15s; bấm mở overlay xem hết ảnh (đứng: 1 cột + up/down; ngang: 1 hàng + back/forward; theo cao/rộng cửa sổ trang; ảnh contain full trong khung).
- Mục liên lạc: nút tròn hai bên, Mint bot ở giữa, không vòng tròn, chớp mắt định kỳ. Đỉnh robot ngang đỉnh nút điện thoại. Ô “Chat với Mint Bot” nằm ngay dưới, hở thêm vài pixel, bề ngang vừa chữ, bấm được như robot. Khi nở, ô chat rộng gấp đôi (dừng trước nút hai bên nếu màn hẹp); trên điện thoại ô chat rộng hết màn hình. Robot thu nhỏ vào chỗ chữ MINT BOT. Góc trên bên phải ô chat có nút tròn dấu trừ, bấm thì thu ô chat như bấm Mint bot. Bấm ra ngoài ô đang mở thì thu lại. Trung bình + rộng (≥391px): ô xanh đóng bằng 3/4 chiều cao cũ, mở bằng 5/4; khoảng cách dọc các nút tròn cố định. Mọi cỡ màn hình, khi ô xanh nở thì trang cuộn lên cùng lúc để mép dưới luôn sát đáy màn hình (hẹp: hàng nút tròn nằm trên thanh công cụ của trình duyệt; TB+rộng: footer), rồi ô chat mới nở. Khi đóng: ô chat thu trước, rồi ô xanh thấp dần trong lúc trang cuộn về chỗ cũ. Hẹp (≤390px): đóng giữ chiều cao cũ; mở thì ô xanh cao bằng màn hình trừ header. Sáu nút tròn một hàng khi ô chat đóng. Khi ô chat mở, hàng nút ẩn và ô chat chiếm hết ô xanh. Thu ô chat thì hàng nút hiện lại. Địa chỉ và Chị Thủy Tiên nằm ở footer.

## Xuất bản

- Bản mới: https://linhhvd.github.io/MINT-YOGA-COFFEE/ (Pages, nhánh `main`).
- Đã gỡ custom domain và xóa `CNAME` để `github.io` không chuyển sang Google Sites.
- `mintyogacoffee.com` vẫn là Google Sites. DNS GoDaddy giữ nguyên cho đến khi chuyển site.
- Khi chuyển tên miền: thêm lại `CNAME` với `mintyogacoffee.com`, gắn custom domain trên Pages, rồi sửa DNS.
