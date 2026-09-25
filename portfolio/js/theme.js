/* theme.js — light/dark mode toggle with persistence */

function initializeTheme() {
  const themeToggle = $("#themeToggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("gab-theme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
  }

  if (themeToggle) {
    themeToggle.textContent = body.classList.contains("dark") ? "☾" : "☼";
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark");
      const isDark = body.classList.contains("dark");
      themeToggle.textContent = isDark ? "☾" : "☼";
      localStorage.setItem("gab-theme", isDark ? "dark" : "light");
    });
  }
}
