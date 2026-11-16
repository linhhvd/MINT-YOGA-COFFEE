const QA_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1Z85DpxEDYBx210U-r9gOefe5X7uNl0HwUlpZJoCWgR4/export?format=csv";
const QA_FILE = "data/hoi-dap.csv";
const SCHEDULE_CSV =
  "https://docs.google.com/spreadsheets/d/1PceP2P5Wn-tNfeclBWP4mtQiAwzYrWHz6fDRYCfftXo/export?format=csv";
const BOT_URL =
  "https://script.google.com/macros/s/AKfycbzhMVrgs5JHt3MgU4C7QCCSqCUZsvlXgqVRnFbNgUXv1FprDRn5CpaQP9sM1XxryF7W/exec";
const BOT_FALLBACK =
  "Mình chưa có thông tin này. Bạn nhắn Zalo, Messenger, hoặc gọi trực tiếp Ms. Thủy Tiên theo số 098 123 8486.";

const botLog = document.querySelector("#mint-bot-log");
const botForm = document.querySelector("#mint-bot-form");
const botInput = document.querySelector("#mint-bot-input");

let qaRows = [];
let scheduleRows = [];
const session = [];

function foldText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function addMessage(text, role) {
  if (!botLog) return;
  const item = document.createElement("p");
  item.className = `mint-bot__msg mint-bot__msg--${role}`;
  text.split(/(https?:\/\/\S+)/).forEach((part) => {
    if (/^https?:\/\//.test(part)) {
      const link = document.createElement("a");
      link.href = part;
      link.textContent = part;
      link.target = "_blank";
      link.rel = "noopener";
      item.append(link);
    } else if (part) {
      item.append(document.createTextNode(part));
    }
  });
  botLog.append(item);
  const firstOnly = botLog.children.length === 1 && botLog.scrollHeight > botLog.clientHeight;
  botLog.scrollTop = firstOnly ? 0 : botLog.scrollHeight;
}

async function loadCsvFrom(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`);
      if (!response.ok) continue;
      const rows = parseCsv(await response.text());
      if (rows.length > 1) return rows;
    } catch (error) {
      /* thử nguồn sau */
    }
  }
  return [];
}

function isScheduleQuestion(folded) {
  if (/\b(le|tet|thong bao|su kien|bai viet|yin|hoi tho)\b/.test(folded)) return false;
  return /\b(lich|gio hoc|may gio|sang|toi|chieu|thu hai|thu ba|thu tu|thu nam|thu sau|thu bay|chu nhat|cuoi tuan)\b/.test(folded);
}

function formatSchedule(rows) {
  const headers = rows[0].slice(1).map((cell) => cell.trim());
  const lines = ["Lịch đang niêm yết:"];
  rows.slice(1).forEach((line) => {
    const label = (line[0] || "").trim();
    const cells = headers.map((_, index) => (line[index + 1] || "").trim());
    const filled = cells.filter(Boolean);
    if (!label || !filled.length) return;
    if (filled.length <= 1) {
      lines.push(`${label}: ${filled[0]}`);
      return;
    }
    const bits = headers
      .map((header, index) => (header ? `${header} ${showCell(cells[index] || "")}` : ""))
      .filter(Boolean);
    lines.push(`${label}: ${bits.join(", ")}`);
  });
  return lines.join("\n");
}

function answerFromKnowledge(question) {
  const folded = foldText(question);
  if (/^(chao|xin chao|hello|hi|hey)\b/.test(folded)) {
    return "Mint bot đây. Bạn hỏi địa chỉ, giờ học, hoặc cách liên lạc với phòng tập.";
  }
  if (isScheduleQuestion(folded) && scheduleRows.length) return formatSchedule(scheduleRows);

  let best = null;
  let bestScore = 0;
  qaRows.slice(1).forEach((row) => {
    const keywords = foldText(row[2] || "")
      .split("|")
      .map((item) => item.trim())
      .filter((item) => item.length > 2);
    const score = keywords.reduce((total, word) => (folded.includes(word) ? total + word.length : total), 0);
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  });
  if (best && bestScore >= 4) return best[1];
  return BOT_FALLBACK;
}

function botRequestUrl(question) {
  let prior = session.slice(-6);
  const build = (history) =>
    `${BOT_URL}?q=${encodeURIComponent(question)}&h=${encodeURIComponent(JSON.stringify(history))}`;
  let url = build(prior);
  while (prior.length && url.length > 6000) {
    prior = prior.slice(1);
    url = build(prior);
  }
  return url;
}

async function askBot(question) {
  if (!BOT_URL) return answerFromKnowledge(question);
  try {
    const response = await fetch(botRequestUrl(question));
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    const answer = (data.answer || "").trim().replace(/^Đáp:\s*/i, "");
    session.push({ role: "user", text: question });
    session.push({ role: "bot", text: answer || BOT_FALLBACK });
    return answer || BOT_FALLBACK;
  } catch (error) {
    return BOT_FALLBACK;
  }
}

function setupBotToggle() {
  const toggle = document.querySelector(".reach__bot");
  const mid = document.querySelector(".reach__mid");
  const reach = document.querySelector(".reach");
  const panel = document.querySelector("#mint-bot");
  const chat = panel?.querySelector(".mint-bot__chat");
  const labelBtn = panel?.querySelector(".mint-bot__label");
  const icon = document.querySelector(".icon-btn");
  if (!toggle || !mid || !reach || !panel || !chat || !icon) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionMs = 620;
  let busy = false;
  let open = false;

  const wait = (ms) => new Promise((resolve) => {
    window.setTimeout(resolve, reduceMotion ? 0 : ms);
  });

  const phoneLayout = () => window.matchMedia("(max-width: 760px)").matches;
  const scroller = document.scrollingElement || document.documentElement;
  let returnScroll = 0;

  const anchorBottom = () => {
    if (phoneLayout()) {
      const icons = [...reach.querySelectorAll(".icon-btn")];
      return Math.max(...icons.map((el) => el.getBoundingClientRect().bottom));
    }
    return document.querySelector(".site-footer").getBoundingClientRect().bottom;
  };

  const bandHeight = (tall) => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;box-sizing:border-box;";
    if (phoneLayout()) {
      probe.style.height = tall ? "calc(100svh - var(--header))" : "17.05rem";
    } else {
      probe.style.height = tall ? "calc(20.45rem * 1.25)" : "calc(20.45rem * 0.75)";
    }
    document.body.appendChild(probe);
    const height = probe.offsetHeight;
    probe.remove();
    return height;
  };

  const trackBand = (band, from, to, place) => new Promise((resolve) => {
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    if (reduceMotion || Math.abs(to - from) < 1) {
      place(1);
      root.style.scrollBehavior = "";
      resolve();
      return;
    }
    const started = performance.now();
    const step = () => {
      const height = band.offsetHeight;
      const progress = Math.min(1, Math.max(0, (height - from) / (to - from)));
      place(progress);
      if (Math.abs(height - to) <= 1 || performance.now() - started > 1000) {
        place(1);
        root.style.scrollBehavior = "";
        resolve();
        return;
      }
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  });

  const measureReach = (variable) => {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;height:0;overflow:hidden;pointer-events:none;";
    probe.style.width = `var(${variable})`;
    reach.appendChild(probe);
    const width = probe.offsetWidth;
    probe.remove();
    return width;
  };

  const layoutBot = () => {
    const reachW = reach.clientWidth;
    const iconW = icon.getBoundingClientRect().width;
    const style = getComputedStyle(panel);
    const padLeft = Number.parseFloat(style.paddingLeft) || 0;
    const padRight = Number.parseFloat(style.paddingRight) || 0;
    const padTop = Number.parseFloat(style.paddingTop) || 0;
    const phone = window.matchMedia("(max-width: 760px)").matches;
    const band = reach.closest(".contact-band");
    const bandStyle = getComputedStyle(band);
    const bandPad = (Number.parseFloat(bandStyle.paddingTop) || 0) + (Number.parseFloat(bandStyle.paddingBottom) || 0);
    const reachBox = reach.getBoundingClientRect();
    let openW;
    let openLeft;
    let openH;
    if (phone) {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;top:0;height:100svh;width:0;visibility:hidden;pointer-events:none;";
      document.body.appendChild(probe);
      const screenH = probe.offsetHeight;
      probe.remove();
      const headerH = document.querySelector(".site-header").offsetHeight;
      const iconH = icon.getBoundingClientRect().height;
      const bandBox = band.getBoundingClientRect();
      openW = bandBox.width;
      openLeft = bandBox.left - reachBox.left;
      openH = Math.max(0, screenH - headerH - bandPad - iconH - 8);
    } else {
      const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const currentW = measureReach("--chat-w");
      const openMax = measureReach("--chat-open-max");
      openW = Math.min(currentW * 2, openMax);
      openLeft = Math.max(0, (reachW - openW) / 2);
      openH = 20.45 * 1.25 * fontSize - bandPad;
    }
    const shift = openLeft + padLeft - reachW / 2 + iconW / 2;
    mid.style.setProperty("--bot-shift-to", `${shift}px`);
    mid.style.setProperty("--bot-shift-y-to", `${padTop}px`);
    panel.style.setProperty("--chat-open", `${Math.round(openH)}px`);
    panel.style.setProperty("--chat-open-w", `${Math.round(openW)}px`);
    panel.style.setProperty("--chat-open-left", `${Math.round(openLeft)}px`);
    if (!panel.classList.contains("is-open")) {
      const label = panel.querySelector(".mint-bot__label");
      const closedW = Math.ceil(label.scrollWidth + padLeft + padRight);
      const closedLeft = Math.max(0, (reachW - closedW) / 2);
      const closed = Math.ceil(
        label.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      );
      panel.style.setProperty("--chat-closed", `${closed}px`);
      panel.style.setProperty("--chat-closed-w", `${closedW}px`);
      panel.style.setProperty("--chat-left", `${closedLeft}px`);
    }
  };

  layoutBot();
  window.addEventListener("resize", layoutBot);
  window.addEventListener("load", layoutBot);

  panel.addEventListener("click", (event) => {
    if (open || busy || event.target.closest(".mint-bot__chat")) return;
    toggle.click();
  });

  document.addEventListener("click", (event) => {
    if (!open || busy) return;
    if (panel.contains(event.target) || mid.contains(event.target)) return;
    toggle.click();
  });

  toggle.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    layoutBot();
    const band = reach.closest(".contact-band");
    if (!open) {
      toggle.setAttribute("aria-expanded", "true");
      labelBtn?.setAttribute("aria-expanded", "true");
      returnScroll = scroller.scrollTop;
      const from = band.offsetHeight;
      const to = bandHeight(true);
      const startBottom = anchorBottom();
      const viewH = window.innerHeight;
      band.classList.add("is-tall");
      await trackBand(band, from, to, (progress) => {
        const desired = startBottom + (viewH - startBottom) * progress;
        scroller.scrollTop += anchorBottom() - desired;
      });
      mid.classList.add("is-small", "is-left");
      panel.classList.add("is-open");
      chat.inert = false;
      chat.removeAttribute("aria-hidden");
      await wait(motionMs);
      open = true;
      busy = false;
      if (botInput) botInput.focus({ preventScroll: true });
      if (botLog && botLog.children.length <= 1) botLog.scrollTop = 0;
      return;
    }
    if (botInput) botInput.blur();
    panel.classList.remove("is-open");
    chat.inert = true;
    chat.setAttribute("aria-hidden", "true");
    mid.classList.remove("is-left", "is-small");
    await wait(motionMs);
    const from = band.offsetHeight;
    const to = bandHeight(false);
    const scrollStart = scroller.scrollTop;
    band.classList.remove("is-tall");
    await trackBand(band, from, to, (progress) => {
      scroller.scrollTop = returnScroll + (scrollStart - returnScroll) * (1 - progress);
    });
    layoutBot();
    toggle.setAttribute("aria-expanded", "false");
    labelBtn?.setAttribute("aria-expanded", "false");
    open = false;
    busy = false;
  });
}

async function bootBot() {
  setupBotToggle();
  if (!botLog || !botForm || !botInput) return;
  [qaRows, scheduleRows] = await Promise.all([
    loadCsvFrom([QA_SHEET_CSV, QA_FILE]),
    loadCsvFrom([SCHEDULE_CSV])
  ]);
  const greeting = "Mint bot đây. Bạn hỏi địa chỉ, giờ học, hoặc cách liên lạc với phòng tập.";
  session.push({ role: "bot", text: greeting });
  addMessage(greeting, "bot");

  botForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = botInput.value.trim();
    if (!question) return;
    botInput.value = "";
    addMessage(question, "user");
    const pending = document.createElement("p");
    pending.className = "mint-bot__msg mint-bot__msg--bot mint-bot__pending";
    pending.setAttribute("aria-label", "Đang trả lời");
    for (let i = 0; i < 3; i += 1) pending.append(document.createElement("span"));
    botLog.append(pending);
    const answer = await askBot(question);
    pending.remove();
    addMessage(answer, "bot");
    botInput.focus();
  });
}

bootBot();
