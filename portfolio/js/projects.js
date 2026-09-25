/* projects.js — project data, filtering, and modal details */

const projects = {
  nervless: {
    eyebrow: "CAPSTONE PROJECT • AI / WEB",
    title: "NervLess",
    description: "An AI-powered mock thesis-defense simulator designed to help students practice research defense sessions.",
    overview: "NervLess is a capstone project that simulates thesis defense sessions using AI. Students can practice their research presentations and receive feedback from an AI evaluator, helping them prepare for actual defense sessions.",
    image: "assets/images/nervless.png",
    work: [
      "Led 50%+ of frontend development by translating approved Figma wireframes into responsive Next.js interfaces.",
      "Designed system architecture and entity-relationship diagrams using Lucidchart and Eraser.io.",
      "Built a browser-based speech recognition widget for interactive mock-defense sessions."
    ],
    tags: ["TypeScript", "Next.js", "Supabase", "pgvector", "Google Gemini Multimodal API", "CSS"],
    links: [
      { label: "GitHub", url: "https://github.com/Gyabu/NervLess", external: true }
    ]
  },
  brainbytes: {
    eyebrow: "DEVOPS TERMINAL ASSESSMENT • AI / DEVOPS",
    title: "BrainBytes AI Tutor",
    description: "An AI tutoring platform project focused on backend services, automated testing, CI/CD hardening, and monitoring.",
    overview: "BrainBytes is an AI-powered tutoring platform built as a DevOps assessment project. It demonstrates production-ready backend services, comprehensive testing strategies, CI/CD pipeline hardening, and full monitoring stack implementation.",
    image: "assets/images/brainbytes.png",
    work: [
      "Hardened the CI/CD pipeline by removing unsafe error-suppression flags, adding TruffleHog secret scanning, and enforcing npm audit checks.",
      "Implemented backend API tests with MongoMemoryServer and environment-variable fail-fast guards.",
      "Built Mongoose schemas and REST endpoints and configured Prometheus, Grafana, and Alertmanager monitoring."
    ],
    tags: ["HTML", "JavaScript", "Node.js", "Express", "Next.js", "MongoDB Atlas", "Docker", "GitHub Actions", "Prometheus", "Grafana"],
    links: [
      { label: "GitHub", url: "https://github.com/Gyabu/BrainBytes", external: true }
    ]
  },
  cafefind: {
    eyebrow: "WEB SYSTEMS & TECHNOLOGY • FULL-STACK",
    title: "CaféFind",
    description: "A responsive café discovery web application built around search, filtering, favorites, profiles, API communication, and data persistence.",
    overview: "CaféFind is a full-stack web application for discovering cafés with search, filtering, favorites, and user profiles. Built with vanilla JavaScript, Node.js, and Express.js, it demonstrates API-based communication and data persistence patterns.",
    image: "assets/images/cafefind.png",
    work: [
      "Developed responsive café discovery workflows with search, filtering, favorites, and profiles.",
      "Built frontend and backend functionality with JavaScript, Node.js, and Express.js using API-based communication.",
      "Implemented data persistence, validation, functional testing, and iterative development."
    ],
    tags: ["HTML5", "CSS3", "JavaScript", "Node.js", "Express.js", "REST APIs", "Data Persistence"],
    links: [
      { label: "GitHub", url: "https://github.com/Gyabu/CafeFind", external: true }
    ]
  }
};

function initializeProjects() {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const filters = $$(".filter");
  const cards = $$(".project-card");

  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      cards.forEach(card => {
        card.classList.toggle(
          "hidden",
          filter !== "all" && !card.dataset.category.split(" ").includes(filter)
        );
      });
    });
  });

  const modal = $("#projectModal");
  const modalEyebrow = $("#modalEyebrow");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalOverview = $("#modalOverview");
  const modalWork = $("#modalWork");
  const modalTags = $("#modalTags");
  const modalLinks = $("#modalLinks");
  const modalImage = $("#modalImage");
  const modalClose = $("#modalClose");

  $$(".open-project").forEach(button => {
    button.addEventListener("click", () => {
      const data = projects[button.closest(".project-card").dataset.project];
      modalEyebrow.textContent = data.eyebrow;
      modalTitle.textContent = data.title;
      modalDescription.textContent = data.description;
      modalOverview.textContent = data.overview;
      modalWork.innerHTML = data.work.map(item => `<li>${item}</li>`).join("");
      modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join("");
      
      // Populate project image
      if (data.image && modalImage) {
        modalImage.innerHTML = `<img src="${data.image}" alt="${data.title} project preview" loading="lazy">`;
      }
      
      // Populate project links (only GitHub if real URL exists)
      if (data.links && modalLinks) {
        modalLinks.innerHTML = data.links.map(link => {
          const targetAttr = link.external ? ' target="_blank" rel="noreferrer"' : '';
          return `<a class="button-link" href="${link.url}"${targetAttr}>${link.label} ↗</a>`;
        }).join("");
      }
      
      modal.showModal();
    });
  });

  // Close handlers - use direct reference to modal
  function closeModal() {
    if (modal && modal.open) {
      modal.close();
    }
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }
  
  // Close modal on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && modal.open) {
      closeModal();
    }
  });
}
