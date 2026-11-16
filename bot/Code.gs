/**
 * Mint bot — Apps Script đứng giữa trang và Gemini.
 * 1. Dán file này vào một project Apps Script.
 * 2. Project settings → Script properties:
 *    GEMINI_API_KEY_1 và GEMINI_API_KEY_2 = hai khóa free.
 *    Mỗi câu hỏi dùng một khóa, khóa kia dành cho lượt sau. Gặp RPM thì đổi khóa còn lại.
 * 3. Deploy → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Dán URL web app vào BOT_URL trong js/bot.js.
 */
const QA_SHEET_ID = "1Z85DpxEDYBx210U-r9gOefe5X7uNl0HwUlpZJoCWgR4";
const MODEL = "gemini-3.1-flash-lite";
const FALLBACK =
  "Mình chưa có thông tin này. Bạn nhắn Zalo, Messenger, hoặc gọi trực tiếp Ms. Thủy Tiên theo số 098 123 8486.";

function doGet(e) {
  const question = String((e && e.parameter && e.parameter.q) || "").trim().slice(0, 500);
  let answer = FALLBACK;
  if (question) {
    try {
      answer = askGemini(question, readHistory(e));
    } catch (error) {
      answer = FALLBACK;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ answer: answer }))
    .setMimeType(ContentService.MimeType.JSON);
}

function readHistory(e) {
  try {
    const data = JSON.parse((e && e.parameter && e.parameter.h) || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .slice(-8)
      .map(function (item) {
        return {
          role: item && item.role === "user" ? "user" : "bot",
          text: String((item && item.text) || "").trim().slice(0, 500)
        };
      })
      .filter(function (item) {
        return item.text;
      });
  } catch (error) {
    return [];
  }
}

function geminiKeysInOrder() {
  const props = PropertiesService.getScriptProperties();
  const keys = [props.getProperty("GEMINI_API_KEY_1"), props.getProperty("GEMINI_API_KEY_2")]
    .map(function (value) {
      return String(value || "").trim();
    })
    .filter(Boolean);
  if (keys.length < 2) return keys;

  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  let index = 0;
  try {
    lock.waitLock(3000);
    index = Number(cache.get("gemini_key_index") || "0") || 0;
    cache.put("gemini_key_index", String((index + 1) % keys.length), 21600);
  } catch (error) {
    index = 0;
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
  const start = ((index % keys.length) + keys.length) % keys.length;
  return [keys[start], keys[(start + 1) % keys.length]];
}

function callGemini(key, prompt) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    MODEL +
    ":generateContent?key=" +
    encodeURIComponent(key);
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 400 }
    })
  });
  const code = response.getResponseCode();
  const body = response.getContentText();
  return {
    limited: code === 429 || code === 503 || /RESOURCE_EXHAUSTED|rate limit/i.test(body),
    ok: code >= 200 && code < 300,
    body: body
  };
}

function readAnswer(body) {
  const data = JSON.parse(body);
  const parts =
    (data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts) ||
    [];
  return parts
    .filter(function (part) {
      return part.text && !part.thought;
    })
    .map(function (part) {
      return part.text;
    })
    .join("")
    .trim();
}

function askGemini(question, history) {
  const keys = geminiKeysInOrder();
  if (!keys.length) return FALLBACK;

  const sheet = loadSheetParts();
  const historyText = (history || [])
    .map(function (turn) {
      return (turn.role === "user" ? "Khách" : "Mint bot") + ": " + turn.text;
    })
    .join("\n");
  const prompt = [
    sheet.prompt ||
      "Bạn là Mint bot của phòng tập Mint Yoga & Coffee. Chỉ trả lời về phòng tập, dựa trên mẫu hỏi đáp và lịch học. Không bịa. Nếu không có thông tin, nói đúng câu: " +
      FALLBACK,
    "",
    "MẪU HỎI ĐÁP:",
    sheet.qa || "(chưa có)",
    "",
    "LỊCH TẬP:",
    sheet.schedule || "(chưa tải được)",
    "",
    "LỊCH SỬ PHIÊN NÀY:",
    historyText || "(chưa có)",
    "",
    "CÂU HỎI MỚI:",
    question
  ].join("\n");

  let lastBody = "";
  for (let i = 0; i < keys.length; i += 1) {
    const result = callGemini(keys[i], prompt);
    lastBody = result.body;
    if (result.ok) {
      const text = readAnswer(result.body);
      if (text) return text;
    }
    if (!result.limited) break;
  }
  if (lastBody) {
    try {
      const text = readAnswer(lastBody);
      if (text) return text;
    } catch (error) {}
  }
  return FALLBACK;
}

function sheetCell(values, row, col) {
  return String((values[row] && values[row][col]) || "").trim();
}

function loadSheetParts() {
  const values = SpreadsheetApp.openById(QA_SHEET_ID).getSheets()[0].getDataRange().getValues();
  const promptParts = [sheetCell(values, 1, 0)];
  const infoWidth = Math.max(
    values[0] ? values[0].length : 0,
    values[1] ? values[1].length : 0
  );
  for (var col = 1; col < infoWidth; col += 1) {
    const block = [sheetCell(values, 0, col), sheetCell(values, 1, col)].filter(Boolean).join("\n");
    if (block) promptParts.push(block);
  }
  const prompt = promptParts.filter(Boolean).join("\n\n");

  const scheduleLines = [
    [sheetCell(values, 3, 0), sheetCell(values, 3, 1), sheetCell(values, 3, 2)].filter(Boolean).join(" | ")
  ];
  for (var day = 4; day <= 9; day += 1) {
    const name = sheetCell(values, day, 0);
    if (!name) continue;
    scheduleLines.push(name + ": " + sheetCell(values, day, 1) + " / " + sheetCell(values, day, 2));
  }

  const qaLines = [];
  for (var row = 12; row < values.length; row += 1) {
    const question = sheetCell(values, row, 0);
    const answer = sheetCell(values, row, 1);
    if (!question || !answer) continue;
    qaLines.push("Hỏi: " + question + "\nĐáp: " + answer);
  }

  return {
    prompt: prompt,
    qa: qaLines.join("\n\n"),
    schedule: scheduleLines.join("\n")
  };
}
