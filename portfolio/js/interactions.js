/* interactions.js — scroll progress, back-to-top, copy email, footer year */

function initializeInteractions() {
  const progress = $("#scrollProgress");
  const backTop = $("#backTop");

  function handleScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) {
      progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    }
    if (backTop) {
      backTop.classList.toggle("show", scrollY > 500);
    }
    updateActiveNav();
  }

  addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (backTop) {
    backTop.addEventListener("click", () => {
      scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const copyEmail = $("#copyEmail");
  const copyStatus = $("#copyStatus");

  if (copyEmail) {
    copyEmail.addEventListener("click", async () => {
      const email = "gabrielportillo0316@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        if (copyStatus) copyStatus.textContent = "Email copied to clipboard.";
      } catch {
        if (copyStatus) copyStatus.textContent = email;
      }
      setTimeout(() => {
        if (copyStatus) copyStatus.textContent = "";
      }, 2500);
    });
  }

  const yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
