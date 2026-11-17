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
const phoneHeader = window.matchMedia("(max-width: 760px)");

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

  const gap = parseFloat(getComputedStyle(lockup).gap) || 0;
  const avail =
    menu.getBoundingClientRect().left - logo.getBoundingClientRect().right - gap - 10;
  if (avail < 48) return;

  const ref = 12;
  const lineW = measureSloganLines(headerSlogan, ref);
  // Nhỏ hơn nữa so với full-fit; vẫn không xuống thêm hàng.
  const fitted = Math.min(Math.max((avail / lineW) * ref * 0.78, 10), 17.5);
  headerSlogan.style.fontSize = `${fitted.toFixed(2)}px`;
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
window.addEventListener("resize", onScroll);
phoneHeader.addEventListener("change", onScroll);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => fitHeaderSlogan());
}

function bindAccordion(root, restSelector) {
  if (!root) return;
  const narrow = window.matchMedia("(max-width: 920px)");

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

bindAccordion(document.querySelector("#bai-viet .essays"), ".essays__side .card");

const SCHEDULE_FILE = "data/Lịch học.csv";
const NEWS_DIR = "data/thông báo";
const NEWS_API =
  "https://api.github.com/repos/linhhvd/MINT-YOGA-COFFEE/contents/data/th%C3%B4ng%20b%C3%A1o?ref=main";

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
loadNews();

function parseNewsText(text) {
  const normalized = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const title = (lines[0] || "").trim();
  const body = lines.slice(1).join("\n").trim();
  return { title, body };
}

function appendNewsBody(container, body) {
  if (!body) return;
  const lines = body.split("\n").map((line) => line.trimEnd());
  const blocks = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    blocks.push({ type: "p", text: para.join("\n").trim() });
    para = [];
  };
  const flushList = () => {
    if (!list || !list.length) {
      list = null;
      return;
    }
    blocks.push({ type: "ul", items: list });
    list = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-•*]\s+(.+)$/);
    if (bullet) {
      flushPara();
      if (!list) list = [];
      list.push(bullet[1].trim());
      return;
    }
    flushList();
    if (!trimmed) {
      flushPara();
      return;
    }
    para.push(trimmed);
  });
  flushPara();
  flushList();

  if (!blocks.length) {
    const p = document.createElement("p");
    p.textContent = body;
    container.append(p);
    return;
  }

  blocks.forEach((block) => {
    if (block.type === "ul") {
      const ul = document.createElement("ul");
      block.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.append(li);
      });
      container.append(ul);
      return;
    }
    const p = document.createElement("p");
    p.textContent = block.text;
    container.append(p);
  });
}

function newsSlug(name, index) {
  const base = String(name || "")
    .replace(/\.txt$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `tb-${base || index}`;
}

async function listNewsFiles() {
  try {
    const response = await fetch(NEWS_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data
          .filter(
            (item) =>
              item &&
              item.type === "file" &&
              typeof item.name === "string" &&
              /\.txt$/i.test(item.name) &&
              item.name !== "_list.txt"
          )
          .map((item) => item.name);
      }
    }
  } catch (error) {
    /* dùng _list.txt */
  }

  const response = await fetch(`${encodeURI(`${NEWS_DIR}/_list.txt`)}?t=${Date.now()}`);
  if (!response.ok) throw new Error(String(response.status));
  return (await response.text())
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((name) => name && /\.txt$/i.test(name) && name !== "_list.txt");
}

function sortNewsNames(names) {
  return [...names].sort((a, b) => b.localeCompare(a, "vi", { numeric: true, sensitivity: "base" }));
}

function renderNews(items) {
  const root = document.querySelector("#news-root");
  if (!root) return;

  if (!items.length) {
    root.replaceChildren();
    const status = document.createElement("p");
    status.className = "news-status";
    status.id = "thong-bao-status";
    status.textContent = "Chưa có thông báo.";
    root.append(status);
    return;
  }

  const fragment = document.createDocumentFragment();
  const lead = items[0];
  const rest = items.slice(1);

  const leadCard = document.createElement("article");
  leadCard.className = "card card--lead is-open";
  const leadId = newsSlug(lead.name, 0);
  leadCard.innerHTML = `
    <h3>
      <button class="card__toggle" type="button" aria-expanded="true" aria-controls="${leadId}">
        <span class="card__name"></span>
        <span class="card__mark" aria-hidden="true"></span>
      </button>
    </h3>
    <div class="card__body" id="${leadId}"></div>
  `;
  leadCard.querySelector(".card__name").textContent = lead.title || lead.name;
  appendNewsBody(leadCard.querySelector(".card__body"), lead.body);
  fragment.append(leadCard);

  if (rest.length) {
    const restWrap = document.createElement("div");
    restWrap.className = "news__rest";
    rest.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "card";
      const id = newsSlug(item.name, index + 1);
      card.innerHTML = `
        <h3>
          <button class="card__toggle" type="button" aria-expanded="false" aria-controls="${id}">
            <span class="card__name"></span>
            <span class="card__mark" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="card__body" id="${id}" hidden></div>
      `;
      card.querySelector(".card__name").textContent = item.title || item.name;
      appendNewsBody(card.querySelector(".card__body"), item.body);
      restWrap.append(card);
    });
    fragment.append(restWrap);
  }

  root.replaceChildren(fragment);
  bindAccordion(root, ".news__rest .card");
}

async function loadNews() {
  const status = document.querySelector("#thong-bao-status");
  try {
    const names = sortNewsNames(await listNewsFiles());
    const items = [];
    for (const name of names) {
      const response = await fetch(`${encodeURI(`${NEWS_DIR}/${name}`)}?t=${Date.now()}`);
      if (!response.ok) continue;
      const parsed = parseNewsText(await response.text());
      if (!parsed.title && !parsed.body) continue;
      items.push({ name, title: parsed.title, body: parsed.body });
    }
    renderNews(items);
  } catch (error) {
    if (status) status.textContent = "Chưa tải được thông báo.";
  }
}
