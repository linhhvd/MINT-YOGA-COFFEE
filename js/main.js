const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

if (toggle && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    toggle.textContent = open ? "Đóng" : "Menu";
  };

  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

const header = document.querySelector(".site-header");
const onScroll = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const today = new Date().getDay();
const card = document.querySelector(`.day[data-day="${today}"]`);
if (card) {
  card.classList.add("is-today");
  const badge = card.querySelector(".today-badge");
  if (badge) badge.hidden = false;
}
