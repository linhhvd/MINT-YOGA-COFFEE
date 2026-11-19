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
- Thông báo 2024–2025 để trong mục lưu trữ. Đến 920px một cột: thông báo mới nhất mở sẵn, các tin cũ thu gọn, cùng lúc chỉ một card mở. Từ 921px hai cột: tin mới nhất ở cột trái, luôn mở; cột phải thu gọn, cùng lúc chỉ một card mở.
- Bài viết đóng mở và xếp cột giống Thông báo. Mỗi bài có phần chữ và phần ảnh; bài có thể chỉ có một trong hai. Chưa có ảnh thì hiện dòng “photo”.
- Lịch học lấy từ `data/Lịch học.csv`. Chỉ Ms. Thủy Tiên. Không ghi Yoga 1 hay Yoga 2. Mint bot chỉ dùng `data/Prompt Min Bot.txt` và `data/Lịch học.csv`, không đọc Google Sheet.
- Giao diện có **ba** case theo bề ngang: **hẹp** (≤ điện thoại cỡ lớn nằm dọc), **trung bình** (giữa hẹp và rộng), **rộng** (≥ iPad thông thường nằm ngang, hoặc laptop). Ba case chỉ khác nhau ở layout các phần trong trang; **header và footer hoàn toàn như nhau** trên cả ba. Chi tiết layout từng phần nói cụ thể theo case. Khi yêu cầu chỉnh UI mà chưa nói rõ áp dụng thế nào với 3 case, hỏi lại trước khi sửa. (CSS hiện còn breakpoint cũ 920/921; sẽ chuyển dần khi chỉnh từng phần.)
- Về chúng tôi: thư cô Thủy Tiên và video. Hẹp xếp dọc (thư trên, video dưới). Rộng xếp ngang.
- Hoạt động nằm sau Về chúng tôi. Hẹp một cột. Rộng ba cột. Ảnh thường nằm trong khung ngang 3:2. Ảnh dọc để riêng một hàng, rộng bằng một cột, thấy trọn người. Ảnh đang chèn là ảnh thử.
- Mục liên lạc: nút tròn hai bên, Mint bot ở giữa, không vòng tròn, chớp mắt định kỳ. Đỉnh robot ngang đỉnh nút điện thoại. Ô “Chat với Mint Bot” nằm ngay dưới, hở thêm vài pixel, bề ngang vừa chữ, bấm được như robot. Khi nở, ô chat rộng gấp đôi (dừng trước nút hai bên nếu màn hẹp); trên điện thoại ô chat rộng hết màn hình. Robot thu nhỏ vào chỗ chữ MINT BOT. Góc trên bên phải ô chat có nút tròn dấu trừ, bấm thì thu ô chat như bấm Mint bot. Bấm ra ngoài ô đang mở thì thu lại. Rộng (≥921px): ô xanh đóng bằng 3/4 chiều cao cũ, mở bằng 5/4; khoảng cách dọc các nút tròn cố định. Mọi cỡ màn hình, khi ô xanh nở thì trang cuộn lên cùng lúc để mép dưới luôn sát đáy màn hình (hẹp: hàng nút tròn nằm trên thanh công cụ của trình duyệt; rộng: footer), rồi ô chat mới nở. Khi đóng: ô chat thu trước, rồi ô xanh thấp dần trong lúc trang cuộn về chỗ cũ. Hẹp (≤920px): đóng giữ chiều cao cũ; mở thì ô xanh cao bằng màn hình trừ header. Sáu nút tròn một hàng khi ô chat đóng. Khi ô chat mở, hàng nút ẩn và ô chat chiếm hết ô xanh. Thu ô chat thì hàng nút hiện lại. Địa chỉ và Chị Thủy Tiên nằm ở footer.

## Xuất bản

- Bản mới: https://linhhvd.github.io/MINT-YOGA-COFFEE/ (Pages, nhánh `main`).
- Đã gỡ custom domain và xóa `CNAME` để `github.io` không chuyển sang Google Sites.
- `mintyogacoffee.com` vẫn là Google Sites. DNS GoDaddy giữ nguyên cho đến khi chuyển site.
- Khi chuyển tên miền: thêm lại `CNAME` với `mintyogacoffee.com`, gắn custom domain trên Pages, rồi sửa DNS.
