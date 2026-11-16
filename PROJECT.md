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
- `js/main.js` — menu, lịch đọc từ Google Sheet `Lịch học`
- `js/bot.js` — Mint bot. Sheet hỏi đáp cố định: dòng 2 là prompt và các cột thông tin (chung, đối tượng học viên), dòng 4–10 là lịch tập, từ dòng 13 trở xuống là hỏi đáp.
- `bot/Code.gs` — Apps Script gọi `gemini-3.1-flash-lite`. Hai khóa `GEMINI_API_KEY_1` và `GEMINI_API_KEY_2` xoay tua trong Script properties, không đưa vào repo.
- `img/logo-mint.png`, `img/logo-white.png` — logo phòng tập, cắt từ thư mục `Logo`
- `img/mint-bot.png` — robot xanh lá mint, lá có cuống ở trên đầu, lắc sau mỗi lần chớp mắt, nền trong suốt, nút giữa mục liên lạc
- `img/favicon.png` — icon tab

## Quyết định

- Không bịa bài viết. Chỉ đưa chữ đã đọc được trên site cũ. Ba bài dạng ảnh (Drishti, lời tri ân, liên kết cơ thể) chưa đưa lên trang.
- Thông báo 2024–2025 để trong mục lưu trữ. Đến 920px một cột: thông báo mới nhất mở sẵn, các tin cũ thu gọn, cùng lúc chỉ một card mở. Từ 921px hai cột: tin mới nhất ở cột trái, luôn mở; cột phải thu gọn, cùng lúc chỉ một card mở.
- Lịch học lấy từ Google Sheet. Chỉ Ms. Thủy Tiên. Không ghi Yoga 1 hay Yoga 2.
- Giao diện luôn dùng được trên máy tính, điện thoại và máy tính bảng. Máy tính bảng gồm cả iPad, dọc và ngang. Từ 921px menu là hàng chữ. Đến 920px nút ba gạch ngang, bấm thì thành dấu X và mở menu. Lịch học xếp theo ngày.
- Về chúng tôi: thư cô Thủy Tiên và video. Đến 920px (điện thoại, iPad dọc) xếp dọc, thư trên video dưới. Từ 921px (máy tính, iPad ngang) xếp ngang.
- Mục liên lạc: nút tròn hai bên, Mint bot ở giữa, không vòng tròn, chớp mắt định kỳ. Đỉnh robot ngang đỉnh nút điện thoại. Ô “Chat với Mint Bot” nằm ngay dưới, hở thêm vài pixel, bề ngang vừa chữ, bấm được như robot. Khi nở, ô chat rộng gấp đôi (dừng trước nút hai bên nếu màn hẹp); trên điện thoại ô chat rộng hết màn hình. Robot thu nhỏ vào chỗ chữ MINT BOT. Bấm ra ngoài ô đang mở thì thu lại. Máy tính và iPad: ô xanh đóng bằng 3/4 chiều cao cũ, mở bằng 5/4; khoảng cách dọc các nút tròn cố định. Mọi cỡ màn hình, khi ô xanh nở thì trang cuộn lên cùng lúc để mép dưới luôn sát đáy màn hình (điện thoại: hàng nút tròn; máy tính và iPad: footer), rồi ô chat mới nở. Khi đóng: ô chat thu trước, rồi ô xanh thấp dần trong lúc trang cuộn về chỗ cũ. Điện thoại: đóng giữ chiều cao cũ; mở thì ô xanh cao bằng màn hình trừ header. Sáu nút tròn một hàng dưới ô xanh, cách mép dưới ô chat một khoảng. Địa chỉ và Chị Thủy Tiên nằm ở footer.

## Xuất bản

- Bản mới: https://linhhvd.github.io/MINT-YOGA-COFFEE/ (Pages, nhánh `main`).
- Đã gỡ custom domain và xóa `CNAME` để `github.io` không chuyển sang Google Sites.
- `mintyogacoffee.com` vẫn là Google Sites. DNS GoDaddy giữ nguyên cho đến khi chuyển site.
- Khi chuyển tên miền: thêm lại `CNAME` với `mintyogacoffee.com`, gắn custom domain trên Pages, rồi sửa DNS.
