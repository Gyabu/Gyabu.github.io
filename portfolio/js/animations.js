/* animations.js — reveal-on-scroll via IntersectionObserver */

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

function initializeAnimations() {
  $$(".reveal").forEach(el => observer.observe(el));
}
