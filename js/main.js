const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

if (toggle && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  };

  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

const header = document.querySelector(".site-header");
const heroSlogan = document.querySelector(".hero__slogan");
const headerSlogan = document.querySelector(".brand__slogan");
/** Hẹp + trung bình: nút menu, slogan dock. Rộng ≥1024: menu hàng chữ. */
const phoneHeader = window.matchMedia("(max-width: 1023px)");
const narrowLayout = window.matchMedia("(max-width: 390px)");
const wideLayout = window.matchMedia("(min-width: 1024px)");

function measureSloganLines(el, fontSizePx) {
  const cs = getComputedStyle(el);
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  let max = 0;
  for (const part of parts) {
    const span = document.createElement("span");
    span.style.cssText = [
      "position:absolute",
      "visibility:hidden",
      "white-space:nowrap",
      `font-family:${cs.fontFamily}`,
      `font-weight:${cs.fontWeight}`,
      `font-style:${cs.fontStyle}`,
      `letter-spacing:${cs.letterSpacing}`,
      `font-size:${fontSizePx}px`,
    ].join(";");
    span.innerHTML = part;
    document.body.appendChild(span);
    max = Math.max(max, span.getBoundingClientRect().width);
    span.remove();
  }
  return max || 1;
}

function fitHeaderSlogan() {
  if (!header || !headerSlogan) return;
  if (!phoneHeader.matches || !header.classList.contains("is-slogan-docked")) {
    headerSlogan.style.fontSize = "";
    return;
  }
  const logo = header.querySelector(".brand__logo--teal") || header.querySelector(".brand__logo");
  const menu = header.querySelector(".nav-toggle");
  const lockup = header.querySelector(".brand-lockup");
  if (!logo || !menu || !lockup) return;

  // Khoảng trống giữa mép phải logo và mép trái nút menu (slogan canh giữa).
  const avail =
    menu.getBoundingClientRect().left - logo.getBoundingClientRect().right - 12;
  if (avail < 48) return;

  const logoH = logo.getBoundingClientRect().height || 32;
  // Cỡ chữ ~42% chiều cao logo; tối đa ~0.72rem khi logo 2rem.
  const maxPx = Math.min(logoH * 0.42, 14);
  const minPx = Math.max(9, logoH * 0.28);
  const ref = 12;
  const lineW = measureSloganLines(headerSlogan, ref);
  // Vừa khoảng logo–menu; vẫn đúng 2 dòng, không tràn.
  const fitted = Math.min(Math.max((avail / lineW) * ref * 0.82, minPx), maxPx);
  headerSlogan.style.fontSize = `${fitted.toFixed(2)}px`;
}

const footerAddress = document.querySelector(".footer-address");
const footerNote = document.querySelector(".footer-note");

function measurePlainTextWidth(text, fontSizePx, el) {
  const cs = getComputedStyle(el);
  const span = document.createElement("span");
  span.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "white-space:nowrap",
    `font-family:${cs.fontFamily}`,
    `font-weight:${cs.fontWeight}`,
    `font-style:${cs.fontStyle}`,
    `letter-spacing:${cs.letterSpacing}`,
    `font-size:${fontSizePx}px`,
  ].join(";");
  span.textContent = text;
  document.body.appendChild(span);
  const width = span.getBoundingClientRect().width;
  span.remove();
  return width || 1;
}

/** Co font địa chỉ footer theo bề rộng thực tế — luôn 1 dòng, không xuống hàng. */
function fitFooterAddress() {
  if (!footerAddress || !footerNote) return;
  footerAddress.style.fontSize = "";
  const avail = Math.floor(footerNote.getBoundingClientRect().width);
  if (avail < 40) return;
  const text = (footerAddress.textContent || "").trim();
  if (!text) return;
  const maxPx = parseFloat(getComputedStyle(footerAddress).fontSize) || 17;
  const minPx = 9;
  const need = measurePlainTextWidth(text, maxPx, footerAddress);
  const fitted = Math.min(Math.max((avail / need) * maxPx * 0.98, minPx), maxPx);
  footerAddress.style.fontSize = `${fitted.toFixed(2)}px`;
}

const onScroll = () => {
  if (!header) return;
  const phone = phoneHeader.matches;
  header.classList.toggle("is-scrolled", window.scrollY > 80);
  header.classList.toggle("is-compact", phone && window.scrollY > 24);

  let docked = false;
  if (phone && heroSlogan) {
    const headerBottom = header.getBoundingClientRect().bottom;
    docked = heroSlogan.getBoundingClientRect().top <= headerBottom + 2;
  }
  header.classList.toggle("is-slogan-docked", docked);
  if (heroSlogan) heroSlogan.classList.toggle("is-docked", docked);
  // Bản trong header chỉ là bản nhìn; h1 thật nằm ở hero.
  if (headerSlogan) headerSlogan.setAttribute("aria-hidden", "true");
  fitHeaderSlogan();
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
phoneHeader.addEventListener("change", onScroll);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    fitHeaderSlogan();
    fitFooterAddress();
  });
}
fitFooterAddress();

let essayOverlayState = null;
let eventOverlayState = null;
let activityState = null;

/** Chiều cao vùng nhìn thấy (lấy min để không tràn dưới khi thanh URL/Edge). */
function viewportHeight() {
  const vv = window.visualViewport;
  const values = [
    vv && vv.height,
    window.innerHeight,
    document.documentElement.clientHeight,
  ].filter((n) => Number.isFinite(n) && n > 0);
  return values.length ? Math.min(...values) : 0;
}

function visibleViewportBottom() {
  const vv = window.visualViewport;
  if (vv && Number.isFinite(vv.height)) {
    return vv.offsetTop + vv.height;
  }
  return viewportHeight();
}

/** Khung overlay chung: từ đáy header tới đáy vùng nhìn thấy (visualViewport). */
function overlayViewportBox() {
  const headerEl = document.querySelector(".site-header");
  const headerBottom = headerEl
    ? Math.max(0, Math.ceil(headerEl.getBoundingClientRect().bottom))
    : 0;
  const viewBottom = Math.floor(visibleViewportBottom());
  const top = headerBottom;
  const height = Math.max(0, viewBottom - top);
  return { top, height };
}

/** Gắn khung viewport lên overlay (essay / ảnh / sự kiện dùng chung). */
function applyOverlayFrame(el, { essayVars = false, eventVars = false } = {}) {
  if (!el) return null;
  const { top, height } = overlayViewportBox();
  el.style.top = `${top}px`;
  el.style.bottom = "auto";
  el.style.height = `${height}px`;
  el.style.maxHeight = `${height}px`;
  if (essayVars) {
    el.style.setProperty("--essay-overlay-top", `${top}px`);
    el.style.setProperty("--essay-overlay-height", `${height}px`);
    el.style.setProperty("--essay-overlay-bottom", "0px");
  }
  if (eventVars) {
    el.style.setProperty("--event-overlay-top", `${top}px`);
    el.style.setProperty("--event-overlay-height", `${height}px`);
  }
  return { top, height };
}

function placeEssayOverlay() {
  const state = essayOverlayState;
  if (!state || !state.overlay || state.overlay.hidden) return;
  applyOverlayFrame(state.overlay, { essayVars: true });
}

/** Tính lại header, slogan, overlay và báo UI khác (bot…) sau resize/xoay. */
function refreshViewportUi() {
  document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight())}px`);
  onScroll();
  fitFooterAddress();
  placeEssayOverlay();
  if (typeof placeEventOverlay === "function") placeEventOverlay();
  if (typeof placeActivityOverlay === "function") placeActivityOverlay();
  if (typeof fitAllEssayExcerpts === "function") {
    window.requestAnimationFrame(fitAllEssayExcerpts);
  }
  window.dispatchEvent(new Event("viewport-refresh"));
}

let viewportRefreshTimer = 0;
function scheduleViewportRefresh() {
  window.clearTimeout(viewportRefreshTimer);
  viewportRefreshTimer = window.setTimeout(() => {
    refreshViewportUi();
    // Lần 2 sau khi trình duyệt ổn định orientation / thanh URL.
    window.setTimeout(refreshViewportUi, 280);
  }, 40);
}

window.addEventListener("resize", scheduleViewportRefresh);
window.addEventListener("orientationchange", scheduleViewportRefresh);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", scheduleViewportRefresh);
  window.visualViewport.addEventListener("scroll", scheduleViewportRefresh);
}
refreshViewportUi();

function bindAccordion(root, restSelector) {
  if (!root) return;
  // Hẹp: cả cột 1 card mở. TB+rộng: lead luôn mở; cột phải chỉ 1 card mở.
  const narrow = narrowLayout;

  function setCard(card, open) {
    card.classList.toggle("is-open", open);
    const button = card.querySelector(".card__toggle");
    const body = card.querySelector(".card__body");
    if (button) button.setAttribute("aria-expanded", String(open));
    if (body) body.hidden = !open;
  }

  function layout() {
    const lead = root.querySelector(".card--lead");
    const rest = [...root.querySelectorAll(restSelector)];
    const leadButton = lead && lead.querySelector(".card__toggle");
    if (!lead || !leadButton) return;
    if (narrow.matches) {
      leadButton.tabIndex = 0;
      const open = [...root.querySelectorAll(".card")].filter((card) => card.classList.contains("is-open"));
      if (open.length > 1) {
        const keep = open.find((card) => !card.classList.contains("card--lead")) || open[0];
        root.querySelectorAll(".card").forEach((card) => setCard(card, card === keep));
      }
      return;
    }
    leadButton.tabIndex = -1;
    setCard(lead, true);
    const openRest = rest.filter((card) => card.classList.contains("is-open"));
    rest.forEach((card) => setCard(card, openRest.length > 0 && card === openRest[0]));
  }

  root.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card || !event.target.closest(".card__toggle")) return;
    if (!narrow.matches && card.classList.contains("card--lead")) return;
    const willOpen = !card.classList.contains("is-open");
    const group = narrow.matches ? [...root.querySelectorAll(".card")] : [...root.querySelectorAll(restSelector)];
    group.forEach((other) => {
      if (other !== card) setCard(other, false);
    });
    setCard(card, willOpen);
  });
  layout();
  narrow.addEventListener("change", layout);
}

const SCHEDULE_FILE = "data/Lịch học.csv";
const TXT_REPO = "linhhvd/MINT-YOGA-COFFEE";
const TXT_VISIBLE = 3;
const ESSAY_VISIBLE = 6;

const NEWS_SECTION = {
  dir: "data/thông báo",
  listFile: "_list.csv",
  rootSelector: "#news-root",
  statusId: "thong-bao-status",
  emptyText: "Chưa có thông báo.",
  failText: "Chưa tải được thông báo.",
  moreText: "Xem thông báo cũ hơn...",
  restClass: "news__rest",
  moreCardClass: "news__card--more",
  moreBtnClass: "news__more",
  idPrefix: "tb",
};

const ESSAY_SECTION = {
  dir: "data/bài viết",
  apiUrl: `https://api.github.com/repos/${TXT_REPO}/contents/data/b%C3%A0i%20vi%E1%BA%BFt?ref=main`,
  rootSelector: "#essays-root",
  statusId: "bai-viet-status",
  emptyText: "Chưa có bài viết.",
  failText: "Chưa tải được bài viết.",
  moreText: "Xem tất cả bài viết...",
  moreCardClass: "essays__card--more",
  moreBtnClass: "essays__more",
  idPrefix: "bv",
  withImages: true,
  layout: "essay-grid",
};

const TXT_IMAGE_EXT = /\.(jpe?g|png|gif)$/i;
const TXT_IMAGE_MAX = 5;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((line) => line.some((value) => value.trim()));
}

function showCell(value) {
  const text = value.trim();
  if (!text || /^off$/i.test(text)) return "Nghỉ";
  return text;
}

function daysForHeader(header) {
  const name = header.toLowerCase();
  const days = [];
  if (name.includes("bảy") || name.includes("bay")) days.push(6);
  if (name.includes("chủ") || name.includes("nhật") || /\bcn\b/.test(name)) days.push(0);
  if (days.length) return days;
  if (name.includes("hai")) return [1];
  if (name.includes("ba")) return [2];
  if (name.includes("tư") || name.includes("tu")) return [3];
  if (name.includes("năm") || name.includes("nam")) return [4];
  if (name.includes("sáu") || name.includes("sau")) return [5];
  return [];
}

function applyToday(cell, days) {
  if (!days.includes(new Date().getDay())) return;
  cell.classList.add("is-today");
  const badge = cell.querySelector(".today-badge");
  if (badge) badge.hidden = false;
}

function isScheduleClassRow(cells) {
  return cells.some((cell) => /^off$/i.test(cell) || /\bms\./i.test(cell));
}

function scheduleNoteLines(label, cells) {
  const parts = [label, ...cells].filter(Boolean);
  const lines = [];
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i + 1]) lines.push(`${parts[i]}: ${parts[i + 1]}`);
    else lines.push(parts[i]);
  }
  return lines;
}

function renderSchedule(rows) {
  const table = document.querySelector("#lich-table");
  const status = document.querySelector("#lich-status");
  const notes = document.querySelector("#lich-notes");
  if (!table || !rows.length) return;

  const headers = rows[0].slice(1).map((cell) => cell.trim());
  const bodyRows = [];
  const noteLines = [];

  rows.slice(1).forEach((line) => {
    const label = (line[0] || "").trim();
    const cells = headers.map((_, index) => (line[index + 1] || "").trim());
    if (!label) return;
    if (!isScheduleClassRow(cells)) {
      noteLines.push(...scheduleNoteLines(label, cells));
      return;
    }
    bodyRows.push({ label, cells });
  });

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(document.createElement("th"));
  headers.forEach((header) => {
    if (!header) return;
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = header;
    const badge = document.createElement("span");
    badge.className = "today-badge";
    badge.hidden = true;
    badge.textContent = "Hôm nay";
    th.append(document.createTextNode(" "), badge);
    applyToday(th, daysForHeader(header));
    headRow.append(th);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  bodyRows.forEach((item) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = item.label;
    tr.append(th);
    item.cells.forEach((value, index) => {
      if (!headers[index]) return;
      const td = document.createElement("td");
      td.dataset.day = headers[index];
      const shown = showCell(value);
      td.textContent = shown;
      if (shown === "Nghỉ") td.className = "off";
      applyToday(td, daysForHeader(headers[index]));
      tr.append(td);
    });
    body.append(tr);
  });

  table.replaceChildren(head, body);
  table.hidden = false;
  if (status) status.hidden = true;
  if (notes) {
    notes.replaceChildren();
    noteLines.forEach((line) => {
      const p = document.createElement("p");
      line.split(/(\d+g\d+)/).forEach((part) => {
        if (!part) return;
        if (/^\d+g\d+$/.test(part)) {
          const time = document.createElement("span");
          time.className = "time";
          time.textContent = part;
          p.append(time);
        } else {
          p.append(document.createTextNode(part));
        }
      });
      notes.append(p);
    });
  }
}

async function loadSchedule() {
  const status = document.querySelector("#lich-status");
  try {
    const response = await fetch(`${encodeURI(SCHEDULE_FILE)}?t=${Date.now()}`);
    if (!response.ok) throw new Error(String(response.status));
    renderSchedule(parseCsv(await response.text()));
  } catch (error) {
    if (status) {
      status.textContent = "Chưa tải được lịch học.";
    }
  }
}

loadSchedule();
loadNewsFromList(NEWS_SECTION);
loadTxtSection(ESSAY_SECTION);

function parseTxtCard(text) {
  const normalized = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const title = (lines[0] || "").trim();
  const body = lines.slice(1).join("\n").trim();
  return { title, body };
}

function appendMarkdownBody(container, body) {
  if (!body) return;
  container.classList.add("news__md");

  const markedLib = window.marked;
  const purify = window.DOMPurify;
  if (markedLib && typeof markedLib.parse === "function" && purify && typeof purify.sanitize === "function") {
    if (typeof markedLib.setOptions === "function") {
      markedLib.setOptions({ breaks: true, gfm: true });
    }
    container.innerHTML = purify.sanitize(markedLib.parse(body), {
      USE_PROFILES: { html: true },
    });
    container.querySelectorAll("a[href]").forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
    return;
  }

  body.split("\n").forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line.trimEnd();
    if (!p.textContent) p.innerHTML = "&nbsp;";
    container.append(p);
  });
}

function txtCardSlug(prefix, name, index) {
  const base = String(name || "")
    .replace(/\.txt$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${base || index}`;
}

async function listDirFileNames(section) {
  try {
    const response = await fetch(section.apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data
          .filter((item) => item && item.type === "file" && typeof item.name === "string")
          .map((item) => item.name)
          .filter((name) => name !== "_list.txt");
      }
    }
  } catch (error) {
    /* fallback */
  }

  const response = await fetch(`${encodeURI(`${section.dir}/_list.txt`)}?t=${Date.now()}`);
  if (!response.ok) throw new Error(String(response.status));
  const texts = (await response.text())
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((name) => name && /\.txt$/i.test(name) && name !== "_list.txt");

  if (!section.withImages) return texts;

  // Fallback: dò ảnh trùng tên với từng file txt (tối đa 5/bài).
  const found = [...texts];
  const exts = ["jpg", "jpeg", "png", "gif"];
  await Promise.all(
    texts.map(async (txtName) => {
      const base = txtName.replace(/\.txt$/i, "");
      const candidates = [];
      exts.forEach((ext) => candidates.push(`${base}.${ext}`));
      for (let i = 1; i <= TXT_IMAGE_MAX; i += 1) {
        exts.forEach((ext) => candidates.push(`${base}_${i}.${ext}`));
      }
      await Promise.all(
        candidates.map(async (name) => {
          try {
            const res = await fetch(`${encodeURI(`${section.dir}/${name}`)}?t=${Date.now()}`, {
              method: "HEAD",
            });
            if (res.ok) found.push(name);
          } catch (error) {
            /* bỏ qua */
          }
        })
      );
    })
  );
  return [...new Set(found)];
}

function listTxtNamesFromDir(fileNames) {
  return fileNames.filter((name) => /\.txt$/i.test(name));
}

function imagesForTxtBase(base, imageFiles) {
  const lowerMap = new Map(imageFiles.map((name) => [name.toLowerCase(), name]));
  const matched = [];
  const pushIf = (candidate) => {
    if (matched.length >= TXT_IMAGE_MAX) return;
    const real = lowerMap.get(candidate.toLowerCase());
    if (real && !matched.includes(real)) matched.push(real);
  };

  ["jpg", "jpeg", "png", "gif"].forEach((ext) => pushIf(`${base}.${ext}`));
  for (let i = 1; i <= TXT_IMAGE_MAX; i += 1) {
    ["jpg", "jpeg", "png", "gif"].forEach((ext) => pushIf(`${base}_${i}.${ext}`));
  }
  return matched.slice(0, TXT_IMAGE_MAX);
}

function assetUrl(dir, name) {
  return `${dir.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(name)}`;
}

function appendCardImages(container, dir, imageNames) {
  if (!imageNames || !imageNames.length) return;
  const wrap = document.createElement("div");
  wrap.className = "essay__photos";
  imageNames.forEach((name) => {
    const figure = document.createElement("figure");
    figure.className = "essay__photo";
    const img = document.createElement("img");
    img.src = `${assetUrl(dir, name)}?t=${Date.now()}`;
    img.alt = "";
    img.loading = "lazy";
    figure.append(img);
    wrap.append(figure);
  });
  container.append(wrap);
}

function sortTxtNames(names) {
  return [...names].sort((a, b) => b.localeCompare(a, "vi", { numeric: true, sensitivity: "base" }));
}

function formatTxtDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/** Parse ngày đăng d/m/y từ _list.csv. */
function parseListDate(raw) {
  const m = String(raw || "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Thông báo `_list.csv`:
 * - Thường: `title;ngày;file.txt`
 * - Sự kiện: `title;ngày;file.txt;ngày hết hạn` (d/m/y)
 * Title có thể chứa `;`.
 */
function parseListCsv(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(";");
      if (parts.length < 3) return null;
      const last = parts[parts.length - 1].trim();
      const secondLast = parts[parts.length - 2].trim();
      let name;
      let dateRaw;
      let title;
      let expiresAt = null;
      if (parts.length >= 4 && /\.txt$/i.test(secondLast) && parseListDate(last)) {
        name = secondLast;
        dateRaw = parts[parts.length - 3].trim();
        title = parts.slice(0, -3).join(";").trim();
        expiresAt = parseListDate(last);
      } else if (/\.txt$/i.test(last)) {
        name = last;
        dateRaw = secondLast;
        title = parts.slice(0, -2).join(";").trim();
      } else {
        return null;
      }
      if (!name) return null;
      return { name, title, createdAt: parseListDate(dateRaw), expiresAt };
    })
    .filter(Boolean);
}

/** Còn hạn nếu hôm nay ≤ hết ngày hết hạn. */
function isEventActive(expiresAt) {
  if (!(expiresAt instanceof Date) || Number.isNaN(expiresAt.getTime())) return false;
  const end = new Date(
    expiresAt.getFullYear(),
    expiresAt.getMonth(),
    expiresAt.getDate(),
    23,
    59,
    59,
    999
  );
  return Date.now() <= end.getTime();
}

function placeEventOverlay() {
  const state = eventOverlayState;
  if (!state || !state.overlay || state.overlay.hidden) return;
  // Cùng khung viewport với popup bài viết / ảnh; cascade đo lại theo chiều cao mới.
  applyOverlayFrame(state.overlay, { essayVars: true, eventVars: true });
  reindexEventCascade();
}

function ensureEventOverlay() {
  if (eventOverlayState) return eventOverlayState;
  const overlay = document.createElement("div");
  overlay.className = "event-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="event-overlay__scrim"></div>
    <div class="event-overlay__stack" data-count="0"></div>
  `;
  document.body.append(overlay);
  // Chỉ đóng bằng nút X trên từng card (không scrim / Escape).
  overlay.addEventListener("click", (event) => {
    const dismiss = event.target.closest("[data-event-dismiss]");
    if (!dismiss) return;
    const panel = dismiss.closest(".event-overlay__panel");
    if (panel) dismissEventPanel(panel);
  });
  eventOverlayState = {
    overlay,
    stack: overlay.querySelector(".event-overlay__stack"),
    returnScroll: 0,
  };
  return eventOverlayState;
}

function reindexEventCascade() {
  const state = eventOverlayState;
  if (!state || !state.stack) return;
  const panels = [...state.stack.querySelectorAll(".event-overlay__panel")];
  state.stack.dataset.count = String(panels.length);
  if (!panels.length) {
    state.stack.style.height = "";
    state.stack.style.minHeight = "";
    state.stack.style.maxHeight = "";
    return;
  }

  const stepToken = getComputedStyle(state.stack).getPropertyValue("--event-cascade-step").trim();
  const remMatch = stepToken.match(/^([\d.]+)rem$/i);
  const pxMatch = stepToken.match(/^([\d.]+)px$/i);
  let step = 8;
  if (remMatch) {
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    step = parseFloat(remMatch[1]) * rootPx;
  } else if (pxMatch) {
    step = parseFloat(pxMatch[1]);
  }
  if (!Number.isFinite(step) || step <= 0) step = 8;

  // Stack fill bằng flex/CSS trong khung overlay (trừ padding), giống panel bài viết.
  state.stack.style.height = "";
  state.stack.style.minHeight = "";
  state.stack.style.maxHeight = "";
  void state.stack.offsetHeight;
  const maxStack = Math.max(
    0,
    Math.floor(state.stack.getBoundingClientRect().height || state.stack.clientHeight || 0)
  );

  const cascadeExtra = (panels.length - 1) * step;
  // Card trên (mới) thấp hơn; đáy ngang nhau; cao nhất = full vùng stack/viewport.
  const baseH = Math.max(0, maxStack - cascadeExtra);

  // Đo nội dung tự nhiên để biết có cần căn giữa (is-fit) không.
  panels.forEach((panel, index) => {
    panel.style.setProperty("--cascade-i", String(index));
    panel.style.setProperty("--event-peek", "0px");
    panel.dataset.tone = String(index % 3);
    panel.classList.remove("is-fit");
    panel.style.height = "auto";
    panel.style.maxHeight = "none";
    panel.style.bottom = "0";
    panel.style.top = "auto";
  });
  const naturals = panels.map((p) => p.scrollHeight);

  panels.forEach((panel, index) => {
    const peek = (panels.length - 1 - index) * step;
    const h = Math.ceil(baseH + peek);
    panel.style.setProperty("--event-peek", `${peek}px`);
    panel.style.height = `${h}px`;
    panel.style.maxHeight = `${h}px`;
    // Không tràn trong chiều cao panel → căn giữa dọc.
    panel.classList.toggle("is-fit", naturals[index] <= h + 1);
  });
}

function buildEventPanel(item, index) {
  const panel = document.createElement("article");
  panel.className = "event-overlay__panel";
  panel.setAttribute("role", index === 0 ? "dialog" : "document");
  panel.setAttribute("aria-modal", index === 0 ? "true" : "false");
  const titleId = `event-overlay-title-${index}`;
  panel.innerHTML = `
    <button class="event-overlay__close" type="button" aria-label="Đóng sự kiện" data-event-dismiss="1"></button>
    <div class="event-overlay__main">
      <p class="event-overlay__kicker">Sự kiện</p>
      <h2 class="event-overlay__title" id="${titleId}"></h2>
      <p class="event-overlay__date"></p>
      <div class="event-overlay__body news__md"></div>
    </div>
  `;
  panel.querySelector(".event-overlay__title").textContent = item.title || item.name;
  const dateEl = panel.querySelector(".event-overlay__date");
  const dateText = formatTxtDate(item.createdAt);
  const expiryText = formatTxtDate(item.expiresAt);
  dateEl.textContent = expiryText
    ? `${dateText ? `${dateText} · ` : ""}Hết hạn ${expiryText}`
    : dateText;
  dateEl.hidden = !dateEl.textContent;
  const bodyEl = panel.querySelector(".event-overlay__body");
  if (item.bodyMissing) bodyEl.textContent = "not found";
  else fillNewsCardBody(bodyEl, item);
  return panel;
}

function dismissEventPanel(panel) {
  const state = eventOverlayState;
  if (!state || !panel) return;
  panel.remove();
  reindexEventCascade();
  if (!state.stack.querySelector(".event-overlay__panel")) closeEventOverlay();
}

function closeEventOverlay() {
  const state = eventOverlayState;
  if (!state) return;
  window.clearTimeout(eventOverlayDelayTimer);
  eventOverlayDelayTimer = 0;
  state.overlay.hidden = true;
  state.overlay.style.height = "";
  state.overlay.style.maxHeight = "";
  state.overlay.style.top = "";
  document.body.classList.remove("is-event-open");
  if (state.stack) {
    state.stack.replaceChildren();
    state.stack.dataset.count = "0";
    state.stack.style.height = "";
    state.stack.style.minHeight = "";
    state.stack.style.maxHeight = "";
  }
  window.scrollTo(0, state.returnScroll || 0);
}

const EVENT_OVERLAY_MAX = 3;
const EVENT_OVERLAY_DELAY_MS = 5000;
let eventOverlayDelayTimer = 0;

/**
 * Sự kiện còn hạn → popup cascade (tối đa 3 mới nhất).
 * Đáy thẳng hàng; cũ hở trên sát header; mới hơn z cao hơn.
 */
function openEventOverlays(items) {
  // items đã newest-first từ loadNewsFromList.
  const newestFirst = (items || []).filter(
    (item) => item && item.expiresAt && isEventActive(item.expiresAt)
  );
  const limited = newestFirst.slice(0, EVENT_OVERLAY_MAX);
  // Đảo: cũ nhất trong nhóm → đầu cascade (hở sát header).
  const active = limited.slice().reverse();
  if (!active.length) return;
  const state = ensureEventOverlay();
  state.returnScroll = window.scrollY || 0;
  state.stack.replaceChildren();
  active.forEach((item, index) => {
    state.stack.append(buildEventPanel(item, index));
  });
  reindexEventCascade();
  state.overlay.hidden = false;
  document.body.classList.add("is-event-open");
  refreshViewportUi();
  window.requestAnimationFrame(() => {
    reindexEventCascade();
    const topClose = state.stack.querySelector(
      ".event-overlay__panel:last-child .event-overlay__close"
    );
    if (topClose) topClose.focus();
  });
}

function scheduleEventOverlays(items) {
  window.clearTimeout(eventOverlayDelayTimer);
  const newestFirst = (items || []).filter(
    (item) => item && item.expiresAt && isEventActive(item.expiresAt)
  );
  if (!newestFirst.length) return;
  eventOverlayDelayTimer = window.setTimeout(() => {
    openEventOverlays(items);
  }, EVENT_OVERLAY_DELAY_MS);
}

/** Thông báo: đọc _list.csv (dòng cuối → đầu), fetch body song song. */
async function loadNewsFromList(section) {
  const status = document.querySelector(`#${section.statusId}`);
  try {
    const listName = section.listFile || "_list.csv";
    const listRes = await fetch(`${encodeURI(`${section.dir}/${listName}`)}?t=${Date.now()}`);
    if (!listRes.ok) throw new Error(String(listRes.status));
    const rows = parseListCsv(await listRes.text());
    // Dòng cuối trong CSV = mới nhất → nạp ngược lên.
    const ordered = rows.slice().reverse();
    const items = await Promise.all(
      ordered.map(async (row) => {
        let body = "";
        let bodyMissing = false;
        try {
          const response = await fetch(`${encodeURI(`${section.dir}/${row.name}`)}?t=${Date.now()}`);
          if (!response.ok) bodyMissing = true;
          else body = String(await response.text()).replace(/^\uFEFF/, "").trim();
        } catch (error) {
          bodyMissing = true;
        }
        return {
          name: row.name,
          title: row.title,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt || null,
          body,
          bodyMissing,
          images: [],
        };
      })
    );
    renderTxtSection(section, items);
    scheduleEventOverlays(items);
  } catch (error) {
    if (status) status.textContent = section.failText;
  }
}

function fillNewsCardBody(el, item) {
  if (!el) return;
  if (item.bodyMissing) {
    el.textContent = "not found";
    return;
  }
  appendMarkdownBody(el, item.body);
}

async function fetchTxtFileCreatedAt(dir, name) {
  const path = `${dir}/${name}`;
  const url =
    `https://api.github.com/repos/${TXT_REPO}/commits?path=${encodeURIComponent(path)}&per_page=100`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return null;
    const commits = await response.json();
    if (!Array.isArray(commits) || !commits.length) return null;
    const oldest = commits[commits.length - 1];
    const commit = oldest && oldest.commit;
    const iso =
      commit &&
      ((commit.author && commit.author.date) || (commit.committer && commit.committer.date));
    return iso ? new Date(iso) : null;
  } catch (error) {
    return null;
  }
}

function addTxtPostedLine(toggle, { newest, createdAt }) {
  if (!toggle) return;
  const line = document.createElement("span");
  if (newest) {
    line.className = "card__posted card__posted--new";
    line.textContent = "Mới nhất";
  } else {
    const text = formatTxtDate(createdAt);
    if (!text) return;
    line.className = "card__posted";
    line.textContent = text;
  }
  const nameEl = toggle.querySelector(".card__name");
  if (nameEl) nameEl.after(line);
  else toggle.append(line);
}

/** Plain text bài viết cho excerpt card — clamp theo ô. */
function essayPlainText(body) {
  return String(body || "")
    .replace(/^>\s?/gm, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[`*_#>[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cắt excerpt theo chiều cao ô text (fill hết phần text; dư mới …). Không đụng phần ảnh. */
function fitEssayExcerptClamp(excerptEl) {
  if (!excerptEl) return;
  excerptEl.style.removeProperty("-webkit-line-clamp");
  excerptEl.style.removeProperty("line-clamp");
  const style = getComputedStyle(excerptEl);
  let lineHeight = parseFloat(style.lineHeight);
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    lineHeight = (parseFloat(style.fontSize) || 16) * 1.45;
  }
  const avail = excerptEl.clientHeight;
  if (avail <= 0) return;
  // round: fill gần hết ô text; overflow:hidden cắt phần dư rất nhỏ.
  const lines = Math.max(1, Math.round(avail / lineHeight));
  excerptEl.style.display = "-webkit-box";
  excerptEl.style.webkitBoxOrient = "vertical";
  excerptEl.style.overflow = "hidden";
  excerptEl.style.webkitLineClamp = String(lines);
  excerptEl.style.lineClamp = String(lines);
}

function fitAllEssayExcerpts() {
  document.querySelectorAll(".essay-card__excerpt").forEach((el) => fitEssayExcerptClamp(el));
}

function applyEssayThumbOrient(card, img) {
  const setOrient = () => {
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    card.classList.remove("essay-card--landscape", "essay-card--portrait");
    if (h > w) card.classList.add("essay-card--portrait");
    else card.classList.add("essay-card--landscape");
    const excerpt = card.querySelector(".essay-card__excerpt");
    if (excerpt) window.requestAnimationFrame(() => fitEssayExcerptClamp(excerpt));
  };
  if (img.complete && img.naturalWidth) setOrient();
  else img.addEventListener("load", setOrient, { once: true });
}

function ensureEssayOverlay() {
  if (essayOverlayState) return essayOverlayState;

  const overlay = document.createElement("div");
  overlay.className = "essay-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="essay-overlay__scrim" data-essay-close="1"></div>
    <div class="essay-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="essay-overlay-title">
      <button class="essay-overlay__close" type="button" aria-label="Đóng bài viết" data-essay-close="1"></button>
      <div class="essay-overlay__layout">
        <div class="essay-overlay__text">
          <h2 class="essay-overlay__title" id="essay-overlay-title"></h2>
          <p class="essay-overlay__date"></p>
          <div class="essay-overlay__body news__md"></div>
        </div>
        <div class="essay-overlay__photos" hidden></div>
      </div>
    </div>
  `;
  document.body.append(overlay);

  const onKey = (event) => {
    if (event.key === "Escape") closeEssayOverlay();
  };

  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-essay-close]")) closeEssayOverlay();
  });

  essayOverlayState = {
    overlay,
    title: overlay.querySelector(".essay-overlay__title"),
    date: overlay.querySelector(".essay-overlay__date"),
    body: overlay.querySelector(".essay-overlay__body"),
    photos: overlay.querySelector(".essay-overlay__photos"),
    onKey,
    returnScroll: 0,
  };
  return essayOverlayState;
}

function openEssayOverlay(item, section) {
  const state = ensureEssayOverlay();
  state.returnScroll = window.scrollY || 0;
  state.title.textContent = item.title || item.name;
  const dateText = formatTxtDate(item.createdAt);
  state.date.textContent = dateText;
  state.date.hidden = !dateText;
  state.body.replaceChildren();
  appendMarkdownBody(state.body, item.body);
  state.photos.replaceChildren();
  const hasImages = !!(item.images && item.images.length);
  state.overlay.classList.toggle("essay-overlay--has-images", hasImages);
  state.overlay.classList.toggle("essay-overlay--text-only", !hasImages);
  state.photos.hidden = !hasImages;
  if (hasImages) {
    appendCardImages(state.photos, section.dir, item.images);
  }
  state.overlay.hidden = false;
  document.body.classList.add("is-essay-open");
  refreshViewportUi();
  document.addEventListener("keydown", state.onKey);
  const closeBtn = state.overlay.querySelector(".essay-overlay__close");
  if (closeBtn) closeBtn.focus();
}

function closeEssayOverlay() {
  const state = essayOverlayState;
  if (!state || state.overlay.hidden) return;
  state.overlay.hidden = true;
  state.overlay.classList.remove("essay-overlay--has-images", "essay-overlay--text-only");
  state.overlay.style.height = "";
  document.body.classList.remove("is-essay-open");
  document.removeEventListener("keydown", state.onKey);
  state.body.replaceChildren();
  state.photos.replaceChildren();
  state.photos.hidden = true;
  window.scrollTo(0, state.returnScroll);
}

// Click/tap header (logo, slogan, menu, nav) cũng đóng overlay.
if (header) {
  header.addEventListener("click", () => {
    if (!essayOverlayState || essayOverlayState.overlay.hidden) return;
    closeEssayOverlay();
  });
}

function renderEssaySection(section, items) {
  const root = document.querySelector(section.rootSelector);
  if (!root) return;

  if (!items.length) {
    root.replaceChildren();
    const status = document.createElement("p");
    status.className = "news-status";
    status.id = section.statusId;
    status.textContent = section.emptyText;
    root.append(status);
    return;
  }

  const fragment = document.createDocumentFragment();
  const hasMore = items.length > ESSAY_VISIBLE;

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "essay-card";
    if (hasMore && index >= ESSAY_VISIBLE) card.classList.add(section.moreCardClass);

    const thumbName = item.images && item.images[0];
    if (thumbName) card.classList.add("essay-card--landscape");
    else card.classList.add("essay-card--text");

    card.innerHTML = `
      <button class="essay-card__hit" type="button">
        <span class="essay-card__head">
          <span class="essay-card__title"></span>
          <span class="essay-card__date"></span>
        </span>
        <span class="essay-card__body">
          ${
            thumbName
              ? `<span class="essay-card__thumb"><img alt="" loading="eager" decoding="async"></span>`
              : ""
          }
          <span class="essay-card__copy">
            <span class="essay-card__excerpt"></span>
          </span>
        </span>
      </button>
    `;
    card.querySelector(".essay-card__title").textContent = item.title || item.name;
    const dateEl = card.querySelector(".essay-card__date");
    const dateText = formatTxtDate(item.createdAt);
    if (dateText) dateEl.textContent = dateText;
    else dateEl.hidden = true;
    const excerptEl = card.querySelector(".essay-card__excerpt");
    excerptEl.textContent = essayPlainText(item.body) || "…";
    if (thumbName) {
      const img = card.querySelector(".essay-card__thumb img");
      img.src = `${assetUrl(section.dir, thumbName)}?t=${Date.now()}`;
      applyEssayThumbOrient(card, img);
      img.addEventListener(
        "load",
        () => {
          window.requestAnimationFrame(() => fitEssayExcerptClamp(excerptEl));
        },
        { once: true }
      );
    }
    card.querySelector(".essay-card__hit").addEventListener("click", () => {
      openEssayOverlay(item, section);
    });
    fragment.append(card);
  });

  if (hasMore) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = section.moreBtnClass;
    more.textContent = section.moreText;
    more.setAttribute("aria-expanded", "false");
    more.addEventListener("click", () => {
      const expanded = !root.classList.contains("is-expanded");
      root.classList.toggle("is-expanded", expanded);
      more.textContent = expanded ? "Thu gọn..." : section.moreText;
      more.setAttribute("aria-expanded", String(expanded));
      window.requestAnimationFrame(() => fitAllEssayExcerpts());
    });
    fragment.append(more);
  }

  root.classList.remove("is-expanded");
  root.className = "essays essays--grid";
  root.replaceChildren(fragment);
  window.requestAnimationFrame(() => {
    fitAllEssayExcerpts();
    window.requestAnimationFrame(fitAllEssayExcerpts);
  });
}

function collapseTxtCard(card) {
  card.classList.remove("is-open");
  const button = card.querySelector(".card__toggle");
  const body = card.querySelector(".card__body");
  if (button) button.setAttribute("aria-expanded", "false");
  if (body) body.hidden = true;
}

function renderTxtSection(section, items) {
  const root = document.querySelector(section.rootSelector);
  if (!root) return;

  if (!items.length) {
    root.replaceChildren();
    const status = document.createElement("p");
    status.className = "news-status";
    status.id = section.statusId;
    status.textContent = section.emptyText;
    root.append(status);
    return;
  }

  const fragment = document.createDocumentFragment();
  const lead = items[0];
  const rest = items.slice(1);
  const hasMore = items.length > TXT_VISIBLE;

  const leadCard = document.createElement("article");
  leadCard.className = "card card--lead is-open";
  const leadId = txtCardSlug(section.idPrefix, lead.name, 0);
  leadCard.innerHTML = `
    <h3>
      <button class="card__toggle" type="button" aria-expanded="true" aria-controls="${leadId}">
        <span class="card__name"></span>
        <span class="card__mark" aria-hidden="true"></span>
      </button>
    </h3>
    <div class="card__body" id="${leadId}"></div>
  `;
  const leadToggle = leadCard.querySelector(".card__toggle");
  leadCard.querySelector(".card__name").textContent = lead.title || lead.name;
  addTxtPostedLine(leadToggle, { newest: true, createdAt: lead.createdAt });
  const leadBody = leadCard.querySelector(".card__body");
  fillNewsCardBody(leadBody, lead);
  if (section.withImages) appendCardImages(leadBody, section.dir, lead.images || []);
  fragment.append(leadCard);

  const restWrap = document.createElement("div");
  restWrap.className = section.restClass;
  rest.forEach((item, index) => {
    const cardIndex = index + 1;
    const card = document.createElement("article");
    card.className = "card";
    if (cardIndex >= TXT_VISIBLE) card.classList.add(section.moreCardClass);
    const id = txtCardSlug(section.idPrefix, item.name, cardIndex);
    card.innerHTML = `
      <h3>
        <button class="card__toggle" type="button" aria-expanded="false" aria-controls="${id}">
          <span class="card__name"></span>
          <span class="card__mark" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="card__body" id="${id}" hidden></div>
    `;
    const toggle = card.querySelector(".card__toggle");
    card.querySelector(".card__name").textContent = item.title || item.name;
    addTxtPostedLine(toggle, { newest: false, createdAt: item.createdAt });
    const bodyEl = card.querySelector(".card__body");
    fillNewsCardBody(bodyEl, item);
    if (section.withImages) appendCardImages(bodyEl, section.dir, item.images || []);
    restWrap.append(card);
  });

  if (hasMore) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = section.moreBtnClass;
    more.textContent = section.moreText;
    more.setAttribute("aria-expanded", "false");
    more.addEventListener("click", () => {
      const expanded = !root.classList.contains("is-expanded");
      root.classList.toggle("is-expanded", expanded);
      more.textContent = expanded ? "Thu gọn..." : section.moreText;
      more.setAttribute("aria-expanded", String(expanded));
      if (!expanded) {
        root.querySelectorAll(`.${section.moreCardClass}`).forEach(collapseTxtCard);
      }
    });
    restWrap.append(more);
  }

  if (rest.length || hasMore) fragment.append(restWrap);

  root.classList.remove("is-expanded");
  root.replaceChildren(fragment);
  bindAccordion(root, `.${section.restClass} .card`);
}

async function loadTxtSection(section) {
  const status = document.querySelector(`#${section.statusId}`);
  try {
    const fileNames = await listDirFileNames(section);
    const names = sortTxtNames(listTxtNamesFromDir(fileNames));
    const imageFiles = section.withImages ? fileNames.filter((name) => TXT_IMAGE_EXT.test(name)) : [];
    const items = [];
    for (const name of names) {
      const response = await fetch(`${encodeURI(`${section.dir}/${name}`)}?t=${Date.now()}`);
      if (!response.ok) continue;
      const parsed = parseTxtCard(await response.text());
      if (!parsed.title && !parsed.body) continue;
      const base = name.replace(/\.txt$/i, "");
      items.push({
        name,
        title: parsed.title,
        body: parsed.body,
        createdAt: null,
        images: section.withImages ? imagesForTxtBase(base, imageFiles) : [],
      });
    }
    await Promise.all(
      items.map(async (item) => {
        item.createdAt = await fetchTxtFileCreatedAt(section.dir, item.name);
      })
    );
    if (section.layout === "essay-grid") renderEssaySection(section, items);
    else renderTxtSection(section, items);
  } catch (error) {
    if (status) status.textContent = section.failText;
  }
}

/* ——— Ảnh hoạt động (trong Về chúng tôi) ——— */

const ACTIVITY_DIR = "data/ảnh hoạt động";
const ACTIVITY_API =
  `https://api.github.com/repos/${TXT_REPO}/contents/data/${encodeURIComponent("ảnh hoạt động")}?ref=main`;
const ACTIVITY_ROTATE_MS = 15000;

function layoutTier() {
  if (narrowLayout.matches) return "narrow";
  if (wideLayout.matches) return "wide";
  return "medium";
}

function activityThumbCount(tier) {
  if (tier === "narrow") return 4;
  if (tier === "wide") return 12;
  return 8;
}

function isPortraitWindow() {
  const vv = window.visualViewport;
  const w = vv && Number.isFinite(vv.width) ? vv.width : window.innerWidth;
  const h = vv && Number.isFinite(vv.height) ? vv.height : window.innerHeight;
  return h > w;
}

function shuffleCopy(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function listActivityImageNames() {
  try {
    const response = await fetch(ACTIVITY_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        const names = data
          .filter((item) => item && item.type === "file" && typeof item.name === "string")
          .map((item) => item.name)
          .filter((name) => TXT_IMAGE_EXT.test(name));
        if (names.length) return names;
      }
    }
  } catch (error) {
    /* fallback */
  }
  const response = await fetch(`${encodeURI(`${ACTIVITY_DIR}/_list.txt`)}?t=${Date.now()}`);
  if (!response.ok) throw new Error(String(response.status));
  return (await response.text())
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((name) => name && name !== "_list.txt" && TXT_IMAGE_EXT.test(name));
}

function paintActivityCard(names) {
  const state = activityState;
  if (!state || !state.grid) return;
  const tier = layoutTier();
  const count = activityThumbCount(tier);
  const picks = names.slice(0, Math.min(count, names.length));
  state.card.dataset.tier = tier;
  state.grid.style.setProperty("--activity-cols", tier === "wide" ? "4" : tier === "medium" ? "4" : "2");
  state.grid.style.setProperty("--activity-rows", tier === "wide" ? "3" : tier === "medium" ? "2" : "2");
  state.grid.replaceChildren();
  picks.forEach((name) => {
    const cell = document.createElement("span");
    cell.className = "activity-card__cell";
    const img = document.createElement("img");
    img.src = `${assetUrl(ACTIVITY_DIR, name)}?t=${Date.now()}`;
    img.alt = "";
    img.loading = "lazy";
    cell.append(img);
    state.grid.append(cell);
  });
}

function rotateActivityThumbs() {
  const state = activityState;
  if (!state || !state.allNames.length) return;
  state.shown = shuffleCopy(state.allNames);
  paintActivityCard(state.shown);
}

function placeActivityOverlay() {
  const state = activityState;
  if (!state || !state.overlay || state.overlay.hidden) return;
  applyOverlayFrame(state.overlay, { essayVars: true });
  state.overlay.classList.toggle("activity-overlay--portrait", isPortraitWindow());
  state.overlay.classList.toggle("activity-overlay--landscape", !isPortraitWindow());
}

function showActivitySlide(index) {
  const state = activityState;
  if (!state || !state.allNames.length) return;
  const total = state.allNames.length;
  state.index = ((index % total) + total) % total;
  const name = state.allNames[state.index];
  state.img.src = `${assetUrl(ACTIVITY_DIR, name)}?t=${Date.now()}`;
  state.img.alt = `Ảnh hoạt động ${state.index + 1} / ${total}`;
  if (state.counter) state.counter.textContent = `${state.index + 1} / ${total}`;
}

/** Quẹt ảnh: đứng = lên/xuống; ngang = trái/phải. */
function bindActivitySwipe(stage) {
  if (!stage) return;
  const THRESH = 48;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let pointerId = null;

  const onDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    tracking = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    try {
      stage.setPointerCapture(event.pointerId);
    } catch (error) {
      /* ignore */
    }
  };

  const onUp = (event) => {
    if (!tracking || (pointerId != null && event.pointerId !== pointerId)) return;
    tracking = false;
    pointerId = null;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < THRESH) return;

    if (isPortraitWindow()) {
      // Ưu tiên trục dọc: quẹt lên = ảnh sau, quẹt xuống = ảnh trước.
      if (absY < absX) return;
      showActivitySlide(activityState.index + (dy < 0 ? 1 : -1));
      return;
    }
    // Ngang: quẹt trái = ảnh sau, quẹt phải = ảnh trước.
    if (absX < absY) return;
    showActivitySlide(activityState.index + (dx < 0 ? 1 : -1));
  };

  const onCancel = (event) => {
    if (pointerId != null && event.pointerId !== pointerId) return;
    tracking = false;
    pointerId = null;
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onCancel);
}

function ensureActivityOverlay() {
  if (activityState && activityState.overlay) return activityState;

  const overlay = document.createElement("div");
  overlay.className = "activity-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="activity-overlay__scrim" data-activity-close="1"></div>
    <div class="activity-overlay__panel" role="dialog" aria-modal="true" aria-label="Ảnh hoạt động">
      <button class="activity-overlay__close" type="button" aria-label="Đóng ảnh hoạt động" data-activity-close="1"></button>
      <button class="activity-overlay__nav activity-overlay__nav--prev" type="button" aria-label="Ảnh trước"></button>
      <div class="activity-overlay__stage">
        <img class="activity-overlay__img" alt="" draggable="false">
      </div>
      <button class="activity-overlay__nav activity-overlay__nav--next" type="button" aria-label="Ảnh sau"></button>
      <p class="activity-overlay__counter" aria-live="polite"></p>
    </div>
  `;
  document.body.append(overlay);

  const onKey = (event) => {
    if (event.key === "Escape") closeActivityOverlay();
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      showActivitySlide(activityState.index - 1);
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      showActivitySlide(activityState.index + 1);
    }
  };

  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-activity-close]")) closeActivityOverlay();
  });
  overlay.querySelector(".activity-overlay__nav--prev").addEventListener("click", () => {
    showActivitySlide(activityState.index - 1);
  });
  overlay.querySelector(".activity-overlay__nav--next").addEventListener("click", () => {
    showActivitySlide(activityState.index + 1);
  });

  const stage = overlay.querySelector(".activity-overlay__stage");
  bindActivitySwipe(stage);

  if (!activityState) activityState = {};
  Object.assign(activityState, {
    overlay,
    img: overlay.querySelector(".activity-overlay__img"),
    counter: overlay.querySelector(".activity-overlay__counter"),
    onKey,
    index: 0,
    returnScroll: 0,
  });
  return activityState;
}

function openActivityOverlay() {
  const state = ensureActivityOverlay();
  if (!state.allNames || !state.allNames.length) return;
  state.returnScroll = window.scrollY || 0;
  state.overlay.hidden = false;
  document.body.classList.add("is-activity-open");
  showActivitySlide(0);
  placeActivityOverlay();
  document.addEventListener("keydown", state.onKey);
  const closeBtn = state.overlay.querySelector(".activity-overlay__close");
  if (closeBtn) closeBtn.focus();
}

function closeActivityOverlay() {
  const state = activityState;
  if (!state || !state.overlay || state.overlay.hidden) return;
  state.overlay.hidden = true;
  document.body.classList.remove("is-activity-open");
  document.removeEventListener("keydown", state.onKey);
  window.scrollTo(0, state.returnScroll || 0);
}

async function initActivityGallery() {
  const card = document.querySelector("#activity-card");
  const grid = document.querySelector("#activity-card-grid");
  if (!card || !grid) return;

  activityState = {
    card,
    grid,
    allNames: [],
    shown: [],
    rotateTimer: 0,
  };

  try {
    activityState.allNames = await listActivityImageNames();
  } catch (error) {
    card.hidden = true;
    return;
  }
  if (!activityState.allNames.length) {
    card.hidden = true;
    return;
  }

  rotateActivityThumbs();
  activityState.rotateTimer = window.setInterval(rotateActivityThumbs, ACTIVITY_ROTATE_MS);

  card.addEventListener("click", () => openActivityOverlay());

  if (header) {
    header.addEventListener("click", () => {
      if (!activityState || !activityState.overlay || activityState.overlay.hidden) return;
      closeActivityOverlay();
    });
  }

  window.addEventListener("viewport-refresh", () => {
    if (!activityState || !activityState.allNames.length) return;
    paintActivityCard(activityState.shown.length ? activityState.shown : activityState.allNames);
    placeActivityOverlay();
  });
}

initActivityGallery();
