# J.R. Gabriel Portillo — Interactive Developer Portfolio

A professional, interactive portfolio website built with HTML5, CSS3, and vanilla JavaScript. No frameworks, no build tools — just clean, maintainable code that works as a static website.

## Features

- **Responsive Design** — Works on mobile (320px+), tablet, laptop, and desktop
- **Dark/Light Theme** — Persisted in localStorage, respects system preference
- **Sticky Navigation** — Smooth scroll, active section highlighting, mobile hamburger menu
- **Scroll Progress Indicator** — Visual scroll position at top of viewport
- **Reveal-on-Scroll Animations** — IntersectionObserver-based entrance animations
- **Project Filtering** — Filter projects by category (AI, Web, DevOps)
- **Project Detail Modal** — Accessible dialog with project specifics
- **Copy Email** — One-click email copy with feedback
- **Back-to-Top Button** — Appears after scrolling
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation, focus states, reduced motion support

## Project Structure

```
portfolio/
├── index.html
├── css/
│   ├── style.css         # Main entry point (imports all modules)
│   ├── base.css          # Reset, CSS variables, base styles
│   ├── layout.css        # Header, nav, sections, scroll progress, back-to-top
│   ├── components.css    # Hero, stats, about, skills, projects, timeline, contact, footer, modal, reveal
│   └── responsive.css    # Mobile/tablet breakpoints (850px, 560px)
├── js/
│   ├── main.js           # Initialization entry point
│   ├── navigation.js     # Mobile menu, active nav state
│   ├── theme.js          # Dark/light toggle with persistence
│   ├── animations.js     # IntersectionObserver reveal animations
│   ├── projects.js       # Project data, filtering, modal
│   └── interactions.js   # Scroll progress, back-to-top, copy email, year
├── assets/
│   ├── images/
│   ├── icons/
│   └── documents/
└── README.md
```

## Getting Started

Simply open `index.html` in any modern browser. No server required.

```bash
# Option 1: Double-click index.html
# Option 2: Serve locally (if needed for external assets)
npx serve .
# or
python -m http.server 8000
```

## Content Sources

All portfolio content is based on the provided documentation for **J.R. Gabriel Portillo**:

- **Education**: BSIT Software Development, Mapúa Malayan Colleges Laguna (MCL) — 149/161 credits completed
- **Location**: Las Piñas, Metro Manila, Philippines
- **Contact**: gabrielportillo0316@gmail.com, GitHub: @Gyabu, LinkedIn: gabriel-portillo-2b6ab9298
- **Skills**: Languages (JS, Python, Java, SQL), Frontend (React, Next.js, HTML5, CSS3), Backend (Node.js, Express.js, REST APIs), Databases (MongoDB, PostgreSQL, Supabase, MySQL), Testing (Jest, Supertest, MongoMemoryServer), DevOps (Git, GitHub Actions, Docker, Nginx, Prometheus, Grafana)
- **Projects**: NervLess (Capstone), BrainBytes AI Tutor (DevOps Assessment), CaféFind (Web Systems)

## Missing Information (Placeholders)

The following items are structured but need real content before deployment:

- [ ] Project screenshots/visuals (currently using placeholder backgrounds)
- [ ] GitHub repository links for each project
- [ ] Live demo links (only add when actually deployed)
- [ ] Architecture diagrams for projects
- [ ] Additional project details (challenges, metrics, outcomes)
- [ ] Certification information
- [ ] Work experience (if any)

**Do not fabricate content** — leave placeholders or add real information only.

## Browser Support

Modern browsers (last 2 versions):
- Chrome/Edge
- Firefox
- Safari
- Mobile Safari/Chrome

## Development Notes

- **No OOP** — Functional/procedural JavaScript only (no classes)
- **CSS Variables** — Used for theming and consistency
- **Modular CSS/JS** — Separated by concern for maintainability
- **Performance** — Lightweight, no external dependencies beyond Google Fonts

## License

Personal portfolio — all rights reserved.