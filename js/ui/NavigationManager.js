/** NavigationManager manages section navigation and scroll progress. */
import Utils from '../utils/Utils.js';
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class NavigationManager {
    constructor({ onBeforeNavigate } = {}) {
        this.onBeforeNavigate = typeof onBeforeNavigate === 'function' ? onBeforeNavigate : () => {};
        this.progress = document.getElementById('scroll-progress');
        this.links = Utils.qsa('.nav__link, .mobile-nav__link');
        this.sections = PortfolioConfig.SECTION_IDS
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        this.updateProgress = Utils.rafThrottle(() => this.renderProgress());
        this.handleResize = Utils.debounce(() => this.renderProgress(), 150);
        this.handleDocumentClick = (event) => this.onDocumentClick(event);
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        this.initProgress();
        this.initActiveSection();
    }

    /* Thin reading-progress line inside the sticky header. */
    /** Updates the page scroll progress indicator. */
    renderProgress() {
        if (!this.progress) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Utils.clamp(scrollTop / max, 0, 1) : 0;
        this.progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    /** Registers scroll progress listeners. */
    initProgress() {
        if (!this.progress) {
            return;
        }

        this.renderProgress();
        window.addEventListener('scroll', this.updateProgress, { passive: true });
        window.addEventListener('resize', this.handleResize);
    }

    /** Marks the active navigation section. */
    setActiveSection(id) {
        this.links.forEach((link) => {
            if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /** Tracks the section visible in the viewport. */
    initActiveSection() {
        if (!this.links.length || !('IntersectionObserver' in window) || !this.sections.length) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );

        this.sections.forEach((section) => observer.observe(section));
        document.addEventListener('click', this.handleDocumentClick);
    }

    /** Handles in-page navigation links. */
    onDocumentClick(event) {
        const link = event.target.closest && event.target.closest('a[href^="#"]');
        if (!link) {
            return;
        }

        const id = link.getAttribute('href').slice(1);
        if (!id || PortfolioConfig.SECTION_IDS.indexOf(id) === -1) {
            return;
        }

        this.onBeforeNavigate();

        const target = document.getElementById(id);
        if (!target) {
            return;
        }

        event.preventDefault();
        this.focusSection(target);
        target.scrollIntoView({ behavior: Utils.isReducedMotion() ? 'auto' : 'smooth', block: 'start' });

        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#' + id);
        }
    }

    /* Palette and deep-link navigation: move focus without touching the URL. */
    /** Navigates to the requested section. */
    goToSection(id) {
        const target = document.getElementById(id);
        if (!target) {
            return;
        }

        this.focusSection(target);
        target.scrollIntoView({ behavior: Utils.isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }

    /** Moves keyboard focus to a section. */
    focusSection(target) {
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
        }
        try {
            target.focus({ preventScroll: true });
        } catch (error) {
            target.focus();
        }
    }
}
