/**
 * Mint bot — Apps Script đứng giữa trang và Gemini.
 * 1. Dán file này vào một project Apps Script.
 * 2. Project settings → Script properties:
 *    GEMINI_API_KEY_1 và GEMINI_API_KEY_2 = hai khóa free.
 *    Mỗi câu hỏi dùng một khóa, khóa kia dành cho lượt sau. Gặp RPM thì đổi khóa còn lại.
 * 3. Deploy → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Dán URL web app vào BOT_URL trong js/bot.js.
 *
 * Nguồn kiến thức chỉ lấy từ repo GitHub Pages:
 * - data/prompt min bot.txt
 * - data/lịch học.csv
 */
const PROMPT_URL =
  "https://linhhvd.github.io/MINT-YOGA-COFFEE/data/prompt%20min%20bot.txt";
const SCHEDULE_URL =
  "https://linhhvd.github.io/MINT-YOGA-COFFEE/data/l%E1%BB%8Bch%20h%E1%BB%8Dc.csv";
const MODEL = "gemini-3.1-flash-lite";
const FALLBACK =
  "Em chưa có thông tin này. Anh/chị vui lòng nhắn Zalo, Messenger, hoặc gọi trực tiếp Ms.Thủy Tiên theo số 098 123 8486 để được tư vấn thêm.";

function doGet(e) {
  const question = String((e && e.parameter && e.parameter.q) || "").trim().slice(0, 500);
  let answer = FALLBACK;
  if (question) {
    try {
      answer = askGemini(question, readHistory(e), readClientNow(e));
    } catch (error) {
      answer = FALLBACK;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ answer: answer }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** now từ trình duyệt (ISO); nếu thiếu/hỏng thì dùng giờ server theo Asia/Ho_Chi_Minh. */
function readClientNow(e) {
  const raw = String((e && e.parameter && e.parameter.now) || "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatVietnamNow(date) {
  const tz = "Asia/Ho_Chi_Minh";
  const when = date || new Date();
  const weekdayMap = {
    "1": "Thứ hai",
    "2": "Thứ ba",
    "3": "Thứ tư",
    "4": "Thứ năm",
    "5": "Thứ sáu",
    "6": "Thứ bảy",
    "7": "Chủ nhật"
  };
  const weekday = weekdayMap[Utilities.formatDate(when, tz, "u")] || "";
  const datePart = Utilities.formatDate(when, tz, "dd/MM/yyyy");
  const timePart = Utilities.formatDate(when, tz, "HH:mm");
  return weekday + ", " + datePart + ", " + timePart + " (giờ Việt Nam)";
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

function askGemini(question, history, clientNow) {
  const keys = geminiKeysInOrder();
  if (!keys.length) return FALLBACK;

  const knowledge = loadRepoKnowledge();
  const historyText = (history || [])
    .map(function (turn) {
      return (turn.role === "user" ? "Khách" : "Mint bot") + ": " + turn.text;
    })
    .join("\n");
  const nowText = formatVietnamNow(clientNow);
  const prompt = [
    knowledge.prompt ||
      "Bạn là Mint Bot của phòng tập Mint Yoga & Coffee. Chỉ trả lời dựa trên thông tin được cung cấp. Không bịa. Nếu không có thông tin, nói đúng câu: " +
      FALLBACK,
    "",
    "BÂY GIỜ (bắt buộc dùng khi hiểu hôm nay / ngày mai / thứ mấy / còn lớp nào):",
    nowText,
    "",
    "LỊCH HỌC MỚI NHẤT (file lịch học.csv, ưu tiên hơn bảng lịch trong mục 4 nếu khác nhau):",
    knowledge.schedule || "(chưa tải được)",
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

function fetchText(url) {
  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error("fetch " + response.getResponseCode());
  }
  return response.getContentText();
}

function cachedText(key, url) {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(key);
  if (hit) return hit;
  const text = fetchText(url);
  cache.put(key, text, 300);
  return text;
}

function formatScheduleCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n|\r/)
    .map(function (line) {
      return line.trim();
    })
    .filter(Boolean);
  if (!lines.length) return "";
  return lines.join("\n");
}

function loadRepoKnowledge() {
  try {
    return {
      prompt: cachedText("mint_prompt", PROMPT_URL).trim(),
      schedule: formatScheduleCsv(cachedText("mint_schedule", SCHEDULE_URL))
    };
  } catch (error) {
    return { prompt: "", schedule: "" };
  }
}
