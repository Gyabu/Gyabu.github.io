/* navigation.js — mobile menu toggle and active nav state */

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const body = document.body;
const menuToggle = $("#menuToggle");
const siteNav = $("#siteNav");

function toggleMenu() {
  const expanded = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(expanded));
}

function closeMenu() {
  siteNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function updateActiveNav() {
  const sections = $$("main section[id]");
  let current = "home";
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 180) current = section.id;
  });
  $$(".site-nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
}

function initializeNavigation() {
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }
  $$(".site-nav a").forEach(a => a.addEventListener("click", closeMenu));
}
