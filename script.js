/* ==========================================================================
   J.R. Gabriel Portillo - Portfolio behaviour
   Vanilla JavaScript, class-based (single file, no modules, no libraries).
   --------------------------------------------------------------------------
   One class per responsibility, coordinated by PortfolioApp:

   01. Utilities .............. shared helpers only
   02. Toast manager .......... transient feedback messages
   03. Theme manager .......... dark/light theme + persistence
   04. Navigation manager ..... progress bar, active section, in-page nav
   05. Mobile menu ............ hamburger panel behaviour
   06. Terminal intro ......... first-visit terminal animation
   07. Typewriter ............. hero role rotation
   08. Scroll manager ......... reveal-on-scroll animations
   09. Command palette ........ Ctrl/Cmd+K command runner
   10. Clipboard manager ...... copy-email behaviour
   11. Contact form ........... validation without a backend
   12. Project interactions ... image fallbacks, tilt, link placeholders
   13. Cursor manager ......... decorative desktop cursor
   14. Magnetic buttons ....... subtle CTA pull
   15. Accessibility manager .. reduced-motion preference changes
   16. Portfolio application .. lightweight controller
   17. Bootstrap .............. DOMContentLoaded entry point
   ========================================================================== */

'use strict';

/* ==========================================================================
   01. UTILITIES
   Only genuinely reusable helpers live here. Everything else belongs to the
   class that owns it.
   ========================================================================== */
const Utils = {
    qs(selector, scope) {
        return (scope || document).querySelector(selector);
    },

    qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },

    isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    hasFinePointer() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /* Coalesce rapid calls (scroll, pointermove) into one per animation frame. */
    rafThrottle(callback) {
        let queued = false;
        let lastArgs = null;

        return function throttled(...args) {
            lastArgs = args;
            if (queued) {
                return;
            }
            queued = true;
            window.requestAnimationFrame(() => {
                queued = false;
                callback.apply(null, lastArgs);
            });
        };
    },

    debounce(callback, wait) {
        let timer = null;

        return function debounced(...args) {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    },

    /* Storage can be unavailable in private mode or with cookies blocked,
       so every access is guarded and the feature simply stops persisting. */
    readStore(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },

    writeStore(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            /* ignore */
        }
    },

    writeSessionStore(key, value) {
        try {
            window.sessionStorage.setItem(key, value);
        } catch (error) {
            /* ignore */
        }
    }
};

/* Shared constants. Mutable state always lives inside a class instance. */
const Config = {
    EMAIL: 'gabrielportillo0316@gmail.com',
    THEME_KEY: 'jr-portfolio:theme',
    INTRO_KEY: 'jr-portfolio:intro-seen',
    THEME_COLORS: { dark: '#0a0d12', light: '#f5f7f9' },
    SECTION_IDS: ['home', 'about', 'skills', 'projects', 'education', 'contact'],
    ROLES: ['Full-Stack Developer', 'DevOps Enthusiast', 'AI Integrator'],
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
};

/* ==========================================================================
   02. TOAST MANAGER
   Owns the transient message element: content, visibility, timing and the
   polite live-region announcement (role="status" lives in the markup).
   ========================================================================== */
class ToastManager {
    constructor() {
        this.element = document.getElementById('toast');
        this.hideTimer = 0;
    }

    init() {
        /* Nothing to bind; show() guards on the element every time. */
    }

    show(message) {
        const toast = this.element;

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.hidden = false;
        window.clearTimeout(this.hideTimer);

        window.requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        this.hideTimer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
            window.setTimeout(() => {
                toast.hidden = true;
            }, 320);
        }, 2600);
    }
}

/* ==========================================================================
   03. THEME MANAGER
   Owns only the colour theme: current value, applying it, toggling it,
   persisting the visitor's choice and keeping the toggle button labelled.
   Dark is the default; a saved choice wins over the OS preference, which the
   inline boot script in index.html already applied before first paint.
   ========================================================================== */
class ThemeManager {
    constructor() {
        this.root = document.documentElement;
        this.toggle = document.getElementById('theme-toggle');
        this.metaThemeColor = document.getElementById('meta-theme-color');
        this.systemQuery = window.matchMedia('(prefers-color-scheme: light)');
        this.handleSystemChange = (event) => {
            /* An explicit visitor choice always wins over the OS setting. */
            if (Utils.readStore(Config.THEME_KEY)) {
                return;
            }
            this.apply(event.matches ? 'light' : 'dark', false);
        };
    }

    init() {
        this.apply(this.current(), false);

        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggle());
        }

        if (this.systemQuery.addEventListener) {
            this.systemQuery.addEventListener('change', this.handleSystemChange);
        } else if (this.systemQuery.addListener) {
            this.systemQuery.addListener(this.handleSystemChange);
        }
    }

    current() {
        return this.root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    apply(theme, persist) {
        const next = theme === 'light' ? 'light' : 'dark';
        this.root.setAttribute('data-theme', next);

        if (this.metaThemeColor) {
            this.metaThemeColor.setAttribute('content', Config.THEME_COLORS[next]);
        }

        if (this.toggle) {
            this.toggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
            this.toggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        }

        this.updateGitHubCards(next);

        if (persist) {
            Utils.writeStore(Config.THEME_KEY, next);
        }

        return next;
    }

    toggle() {
        return this.apply(this.current() === 'light' ? 'dark' : 'light', true);
    }

    /* The stats cards ship with light and dark colour variants so they stay
       readable in both themes. The images themselves come from the service. */
    updateGitHubCards(theme) {
        Utils.qsa('[data-gh-card] img').forEach((img) => {
            const nextSrc = img.getAttribute(theme === 'light' ? 'data-src-light' : 'data-src-dark');
            if (nextSrc && img.getAttribute('src') !== nextSrc) {
                img.setAttribute('src', nextSrc);
            }
        });
    }
}

/* ==========================================================================
   05. MOBILE MENU
   Owns only the hamburger panel: open/close state, toggle labelling, closing
   on selection / outside click / Escape / desktop breakpoint. The Escape
   handler asks (via callback) whether an overlay such as the command palette
   is open, so the two never fight over the same keypress.
   ========================================================================== */
class MobileMenu {
    constructor({ isOverlayOpen } = {}) {
        this.toggle = document.getElementById('nav-toggle');
        this.menu = document.getElementById('mobile-nav');
        this.isOpen = false;
        this.isOverlayOpen = typeof isOverlayOpen === 'function' ? isOverlayOpen : () => false;
        this.desktopQuery = window.matchMedia('(min-width: 1081px)');
        this.handleToggleClick = () => this.set(!this.isOpen);
        this.handleMenuClick = (event) => {
            if (event.target.closest('a')) {
                this.close();
            }
        };
        this.handleDocumentClick = (event) => {
            if (!this.isOpen) {
                return;
            }
            if (!this.menu.contains(event.target) && !this.toggle.contains(event.target)) {
                this.close();
            }
        };
        this.handleKeydown = (event) => {
            if (event.key === 'Escape' && this.isOpen && !this.isOverlayOpen()) {
                this.close();
                this.toggle.focus();
            }
        };
        this.handleDesktop = (event) => {
            if (event.matches) {
                this.close();
            }
        };
    }

    init() {
        if (!this.toggle || !this.menu) {
            return;
        }

        this.toggle.addEventListener('click', this.handleToggleClick);
        this.menu.addEventListener('click', this.handleMenuClick);
        document.addEventListener('click', this.handleDocumentClick);
        document.addEventListener('keydown', this.handleKeydown);

        if (this.desktopQuery.addEventListener) {
            this.desktopQuery.addEventListener('change', this.handleDesktop);
        } else if (this.desktopQuery.addListener) {
            this.desktopQuery.addListener(this.handleDesktop);
        }
    }

    open() {
        this.set(true);
    }

    close() {
        this.set(false);
    }

    set(open) {
        if (!this.toggle || !this.menu) {
            return;
        }

        this.isOpen = open;
        this.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        this.toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        this.menu.classList.toggle('is-open', open);

        if (open) {
            const firstLink = Utils.qs('.mobile-nav__link', this.menu);
            if (firstLink) {
                firstLink.focus({ preventScroll: true });
            }
        }
    }
}

/* ==========================================================================
   04. NAVIGATION MANAGER
   Owns only desktop-side navigation: the reading-progress bar, the
   aria-current section highlight, and accessible in-page link handling
   (focus the target so keyboard and screen-reader users keep their place).
   Before navigating it calls onBeforeNavigate, which the app wires to closing
   the mobile menu, keeping the two classes decoupled.
   ========================================================================== */
class NavigationManager {
    constructor({ onBeforeNavigate } = {}) {
        this.onBeforeNavigate = typeof onBeforeNavigate === 'function' ? onBeforeNavigate : () => {};
        this.progress = document.getElementById('scroll-progress');
        this.links = Utils.qsa('.nav__link, .mobile-nav__link');
        this.sections = Config.SECTION_IDS
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        this.updateProgress = Utils.rafThrottle(() => this.renderProgress());
        this.handleResize = Utils.debounce(() => this.renderProgress(), 150);
        this.handleDocumentClick = (event) => this.onDocumentClick(event);
    }

    init() {
        this.initProgress();
        this.initActiveSection();
    }

    /* Thin reading-progress line inside the sticky header. */
    renderProgress() {
        if (!this.progress) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Utils.clamp(scrollTop / max, 0, 1) : 0;
        this.progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    initProgress() {
        if (!this.progress) {
            return;
        }

        this.renderProgress();
        window.addEventListener('scroll', this.updateProgress, { passive: true });
        window.addEventListener('resize', this.handleResize);
    }

    setActiveSection(id) {
        this.links.forEach((link) => {
            if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

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

    onDocumentClick(event) {
        const link = event.target.closest && event.target.closest('a[href^="#"]');
        if (!link) {
            return;
        }

        const id = link.getAttribute('href').slice(1);
        if (!id || Config.SECTION_IDS.indexOf(id) === -1) {
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
    goToSection(id) {
        const target = document.getElementById(id);
        if (!target) {
            return;
        }

        this.focusSection(target);
        target.scrollIntoView({ behavior: Utils.isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }

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

/* ==========================================================================
   06. TERMINAL INTRO
   Owns only the first-visit terminal animation: session check, typing
   simulation, Skip/Escape handling and revealing the page. It never runs
   without JavaScript or with reduced motion, never traps focus, and a pure
   CSS failsafe fades it out if this file never loads.
   ========================================================================== */
class TerminalIntro {
    constructor() {
        this.root = document.documentElement;
        this.body = document.body;
        this.element = document.getElementById('intro');
        this.skipButton = document.getElementById('intro-skip');
        this.output = document.getElementById('intro-output');
        this.main = document.getElementById('main');
        this.sequence = [
            { prompt: true, text: 'whoami' },
            { prompt: false, text: 'J.R. Gabriel Portillo - BSIT Software Development Student' },
            { prompt: true, text: 'cat about.txt' },
            { prompt: false, text: 'Software Development major at Mapúa Malayan Colleges Laguna. 149/161 credits completed. Seeking an IT internship in full-stack, backend, AI or DevOps work.' },
            { prompt: true, text: 'ls projects/' },
            { prompt: false, text: 'nervless/   brainbytes/   cafefind/' }
        ];
        this.sequence.push(
            { prompt: true, text: 'echo $focus' },
            { prompt: false, text: 'full-stack web  |  backend systems  |  ai integration  |  devops' },
            { prompt: true, text: './open portfolio --role="Full-Stack & DevOps"' },
            { prompt: false, text: 'Booting portfolio interface...' }
        );
        this.lineIndex = 0;
        this.charIndex = 0;
        this.currentLine = null;
        this.timer = 0;
        this.isComplete = false;
        this.handleSkip = () => this.complete();
        this.handleKeydown = (event) => {
            if (!this.isComplete && event.key === 'Escape') {
                this.complete();
            }
        };
    }

    init() {
        if (!this.element || !this.skipButton || !this.output) {
            return;
        }

        /* The inline boot script already decided whether this session sees it. */
        if (this.root.getAttribute('data-intro') !== 'play') {
            return;
        }

        this.body.classList.add('has-overlay-open');
        this.skipButton.addEventListener('click', this.handleSkip);
        document.addEventListener('keydown', this.handleKeydown);
        this.timer = window.setTimeout(() => this.typeStep(), 420);
    }

    complete() {
        if (this.isComplete) {
            return;
        }
        this.isComplete = true;
        window.clearTimeout(this.timer);
        Utils.writeSessionStore(Config.INTRO_KEY, 'true');

        const focusWasInside = this.element.contains(document.activeElement);
        this.element.classList.add('is-leaving');
        this.body.classList.remove('has-overlay-open');

        window.setTimeout(() => {
            this.element.hidden = true;
            if (focusWasInside && this.main) {
                this.main.focus({ preventScroll: true });
            }
        }, 460);
    }

    typeStep() {
        if (this.isComplete) {
            return;
        }

        const item = this.sequence[this.lineIndex];

        if (!item) {
            this.timer = window.setTimeout(() => this.complete(), 520);
            return;
        }

        if (this.charIndex === 0) {
            this.currentLine = document.createElement('span');
            if (item.prompt) {
                this.currentLine.className = 'is-prompt';
                this.currentLine.textContent = '$ ';
            }
            this.output.appendChild(this.currentLine);
        }

        if (this.charIndex < item.text.length) {
            this.currentLine.textContent += item.text.charAt(this.charIndex);
            this.charIndex += 1;
            const pace = item.text.length > 60 ? 5 : 16;
            this.timer = window.setTimeout(() => this.typeStep(), pace);
            return;
        }

        this.output.appendChild(document.createTextNode('\n'));
        this.lineIndex += 1;
        this.charIndex = 0;
        const pause = item.prompt ? 230 : 190;
        this.timer = window.setTimeout(() => this.typeStep(), pause);
    }
}

/* ==========================================================================
   07. TYPEWRITER
   Owns only the hero role rotation: typing, deleting, cycling. The animated
   span is aria-hidden; a static text alternative lives in the markup for
   assistive technology. Reduced-motion visitors get the first role as text.
   ========================================================================== */
class Typewriter {
    constructor() {
        this.element = document.getElementById('typewriter');
        this.roles = Config.ROLES;
        this.roleIndex = 0;
        this.charIndex = 0;
        this.deleting = false;
        this.timer = 0;
    }

    init() {
        if (!this.element) {
            return;
        }

        if (Utils.isReducedMotion()) {
            this.element.textContent = this.roles[0];
            return;
        }

        this.timer = window.setTimeout(() => this.tick(), 700);
    }

    stop() {
        window.clearTimeout(this.timer);
        if (this.element) {
            this.element.textContent = this.roles[0];
        }
    }

    tick() {
        if (document.hidden) {
            this.timer = window.setTimeout(() => this.tick(), 700);
            return;
        }

        const role = this.roles[this.roleIndex];
        this.charIndex += this.deleting ? -1 : 1;
        this.element.textContent = role.slice(0, this.charIndex);

        let delay = this.deleting ? 36 : 76;

        if (!this.deleting && this.charIndex >= role.length) {
            this.deleting = true;
            delay = 1700;
        } else if (this.deleting && this.charIndex <= 0) {
            this.deleting = false;
            this.roleIndex = (this.roleIndex + 1) % this.roles.length;
            delay = 320;
        }

        this.timer = window.setTimeout(() => this.tick(), delay);
    }
}

/* ==========================================================================
   08. SCROLL MANAGER
   Owns only reveal-on-scroll: IntersectionObserver plus a safety net so
   content can never stay hidden. The CSS hides .reveal only under html.js,
   so the page is fully readable with no JavaScript at all.
   ========================================================================== */
class ScrollManager {
    constructor() {
        this.items = Utils.qsa('.reveal');
    }

    init() {
        if (!this.items.length) {
            return;
        }

        if (!('IntersectionObserver' in window) || Utils.isReducedMotion()) {
            this.revealAll();
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
        );

        this.items.forEach((item) => observer.observe(item));

        window.setTimeout(() => this.revealAll(), 6000);
    }

    revealAll() {
        this.items.forEach((item) => item.classList.add('is-visible'));
    }
}

/* ==========================================================================
   09. COMMAND PALETTE
   Owns only the Ctrl/Cmd+K dialog: open/close, search/filter, keyboard
   navigation, selection, empty state and focus restoration. Navigation items
   delegate to onNavigate, and Toggle/Copy delegate to the injected theme and
   clipboard managers - this class holds no theme or clipboard logic itself.
   ========================================================================== */
class CommandPalette {
    constructor({ onNavigate, onToggleTheme, onCopyEmail } = {}) {
        this.element = document.getElementById('palette');
        this.trigger = document.getElementById('palette-trigger');
        this.input = document.getElementById('palette-input');
        this.list = document.getElementById('palette-list');
        this.empty = document.getElementById('palette-empty');
        this.count = document.getElementById('palette-count');
        this.onNavigate = typeof onNavigate === 'function' ? onNavigate : () => {};
        this.onToggleTheme = typeof onToggleTheme === 'function' ? onToggleTheme : () => {};
        this.onCopyEmail = typeof onCopyEmail === 'function' ? onCopyEmail : () => {};
        this.isOpen = false;
        this.commands = [];
        this.matches = [];
        this.activeIndex = 0;
        this.lastFocus = null;
        this.handleInputKeydown = (event) => this.onInputKeydown(event);
        this.handleInput = () => this.renderMatches(this.input.value);
        this.handleListClick = (event) => {
            const option = event.target.closest && event.target.closest('.palette__option');
            if (option) {
                this.run(Number(option.getAttribute('data-index')));
            }
        };
        this.handleScrimClick = (event) => {
            const inDialog = event.target.closest && event.target.closest('.palette__dialog');
            if (!inDialog) {
                this.close(true);
            }
        };
        this.handleGlobalKeydown = (event) => this.onGlobalKeydown(event);
    }

    init() {
        if (!this.element || !this.trigger || !this.input || !this.list) {
            return;
        }

        this.commands = this.buildCommands();
        this.renderMatches('');
        this.trigger.addEventListener('click', () => this.open());
        this.input.addEventListener('input', this.handleInput);
        this.input.addEventListener('keydown', this.handleInputKeydown);
        this.list.addEventListener('click', this.handleListClick);
        this.element.addEventListener('click', this.handleScrimClick);
        document.addEventListener('keydown', this.handleGlobalKeydown);
    }

    buildCommands() {
        const nav = [
            { id: 'home', label: 'Go to Home', keywords: 'home hero top' },
            { id: 'about', label: 'Go to About', keywords: 'about profile summary' },
            { id: 'skills', label: 'Go to Skills', keywords: 'skills technologies tools' },
            { id: 'projects', label: 'Go to Projects', keywords: 'projects work portfolio' },
            { id: 'education', label: 'Go to Education', keywords: 'education school degree' },
            { id: 'contact', label: 'Go to Contact', keywords: 'contact email message' }
        ].map((item) => ({
            label: item.label,
            hint: 'Navigate',
            mark: '>',
            keywords: item.keywords,
            run: () => this.onNavigate(item.id)
        }));

        return nav.concat([
            {
                label: 'Toggle Dark Mode',
                hint: 'Theme',
                mark: '*',
                keywords: 'theme dark light mode appearance',
                run: () => this.onToggleTheme()
            },
            {
                label: 'Copy Email',
                hint: 'Clipboard',
                mark: '#',
                keywords: 'email copy clipboard address',
                run: () => this.onCopyEmail()
            }
        ]);
    }

    open() {
        if (this.isOpen) {
            return;
        }

        this.lastFocus = document.activeElement;
        this.isOpen = true;
        this.element.hidden = false;
        this.input.value = '';
        this.renderMatches('');
        this.input.focus();
    }

    close(returnFocus) {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.element.hidden = true;

        if (returnFocus !== false && this.lastFocus && typeof this.lastFocus.focus === 'function') {
            this.lastFocus.focus();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close(true);
        } else {
            this.open();
        }
    }
}

/* CommandPalette rendering, selection and keyboard handling. */
CommandPalette.prototype.setActive = function (index) {
    if (!this.matches.length) {
        this.activeIndex = -1;
        this.input.setAttribute('aria-activedescendant', '');
        return;
    }

    this.activeIndex = (index + this.matches.length) % this.matches.length;

    const options = Utils.qsa('.palette__option', this.list);
    options.forEach((option, i) => {
        option.setAttribute('aria-selected', i === this.activeIndex ? 'true' : 'false');
    });

    const active = options[this.activeIndex];

    /* Keep the highlighted option scrolled into view inside the list. */
    if (active) {
        this.input.setAttribute('aria-activedescendant', active.id);

        const top = active.offsetTop;
        const bottom = top + active.offsetHeight;
        if (top < this.list.scrollTop) {
            this.list.scrollTop = top;
        } else if (bottom > this.list.scrollTop + this.list.clientHeight) {
            this.list.scrollTop = bottom - this.list.clientHeight;
        }
    }
};

CommandPalette.prototype.renderMatches = function (query) {
    const term = String(query || '').trim().toLowerCase();
    const self = this;

    this.matches = this.commands.filter((command) => {
        if (!term) {
            return true;
        }
        return (
            command.label.toLowerCase().indexOf(term) !== -1 ||
            command.hint.toLowerCase().indexOf(term) !== -1 ||
            (command.keywords || '').toLowerCase().indexOf(term) !== -1
        );
    });

    this.list.innerHTML = '';

    this.matches.forEach((command, index) => {
        const option = document.createElement('li');
        option.className = 'palette__option';
        option.id = 'palette-option-' + index;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.setAttribute('data-index', String(index));

        const mark = document.createElement('span');
        mark.className = 'palette__option-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = command.mark;

        const label = document.createElement('span');
        label.className = 'palette__option-label';
        label.textContent = command.label;

        const hint = document.createElement('span');
        hint.className = 'palette__option-hint';
        hint.textContent = command.hint;

        option.appendChild(mark);
        option.appendChild(label);
        option.appendChild(hint);
        self.list.appendChild(option);
    });

    if (this.empty) {
        this.empty.hidden = this.matches.length > 0;
    }

    if (this.count) {
        this.count.textContent = this.matches.length === 1
            ? '1 command'
            : this.matches.length + ' commands';
    }

    this.setActive(0);
};

CommandPalette.prototype.run = function (index) {
    const command = this.matches[index];
    if (!command) {
        return;
    }
    this.close(false);
    command.run();
};

CommandPalette.prototype.onInputKeydown = function (event) {
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            this.setActive(this.activeIndex + 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            this.setActive(this.activeIndex - 1);
            break;
        case 'Home':
            event.preventDefault();
            this.setActive(0);
            break;
        case 'End':
            event.preventDefault();
            this.setActive(this.matches.length - 1);
            break;
        case 'Enter':
            if (this.activeIndex >= 0) {
                event.preventDefault();
                this.run(this.activeIndex);
            }
            break;
        case 'Escape':
            event.preventDefault();
            this.close(true);
            break;
        case 'Tab':
            /* Only the search field is focusable, so focus stays in the dialog. */
            event.preventDefault();
            this.input.focus();
            break;
        default:
            break;
    }
};

CommandPalette.prototype.onGlobalKeydown = function (event) {
    const key = event.key ? event.key.toLowerCase() : '';

    if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        this.toggle();
        return;
    }

    if (key === 'escape' && this.isOpen) {
        this.close(true);
    }
};

/* ==========================================================================
   10. CLIPBOARD MANAGER
   Owns only copying the email address: async Clipboard API with a hidden
   textarea + execCommand fallback. Every outcome is announced through the
   injected toast, and copy buttons flash a "Copied" state.
   ========================================================================== */
class ClipboardManager {
    constructor({ toast } = {}) {
        this.toast = toast || null;
        this.email = Config.EMAIL;
        this.handleButtonClick = (event) => {
            event.preventDefault();
            this.copyEmail();
        };
    }

    init() {
        Utils.qsa('[data-copy-email-button]').forEach((button) => {
            button.addEventListener('click', this.handleButtonClick);
        });

        /* Clicking the address itself copies it. Mailto links stay available
           in the footer and mobile menu for visitors who prefer a client. */
        Utils.qsa('[data-copy-email]').forEach((link) => {
            link.addEventListener('click', this.handleButtonClick);
        });
    }

    copyEmail() {
        const done = () => {
            if (this.toast) {
                this.toast.show('Email copied to clipboard');
            }
            this.flashButtons();
        };

        const failed = () => {
            if (this.toast) {
                this.toast.show('Clipboard blocked - email: ' + this.email);
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.email).then(done, () => {
                if (this.legacyCopy(this.email)) {
                    done();
                } else {
                    failed();
                }
            });
            return;
        }

        if (this.legacyCopy(this.email)) {
            done();
        } else {
            failed();
        }
    }

    legacyCopy(text) {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', 'readonly');
        helper.style.position = 'fixed';
        helper.style.top = '-1000px';
        helper.style.left = '-1000px';
        helper.style.opacity = '0';
        document.body.appendChild(helper);

        let copied = false;
        try {
            helper.select();
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }

        document.body.removeChild(helper);
        return copied;
    }

    flashButtons() {
        Utils.qsa('[data-copy-email-button]').forEach((button) => {
            const label = Utils.qs('[data-copy-label]', button);
            button.classList.add('is-copied');
            if (label) {
                label.textContent = 'Copied';
            }
            window.setTimeout(() => {
                button.classList.remove('is-copied');
                if (label) {
                    label.textContent = 'Copy';
                }
            }, 2200);
        });
    }
}

/* ==========================================================================
   11. CONTACT FORM
   Owns only form validation. There is no backend: submit is intercepted,
   fields are validated with per-field messages, and success states clearly
   that nothing was sent.
   ========================================================================== */
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.status = document.getElementById('contact-status');
        this.fields = [];
        this.handleSubmit = (event) => this.onSubmit(event);
    }

    init() {
        if (!this.form) {
            return;
        }

        this.fields = this.buildFields().filter((field) => field.input && field.error);

        this.fields.forEach((field) => {
            /* Re-validate while typing once a field has been flagged. */
            field.input.addEventListener('input', () => {
                if (field.input.getAttribute('aria-invalid') === 'true') {
                    this.validateField(field);
                }
            });

            field.input.addEventListener('blur', () => {
                if (field.input.value.trim()) {
                    this.validateField(field);
                }
            });
        });

        this.form.addEventListener('submit', this.handleSubmit);
    }

    buildFields() {
        return [
            {
                input: document.getElementById('contact-name'),
                error: document.getElementById('contact-name-error'),
                validate: (value) => (value.trim() ? '' : 'Please enter your name.')
            },
            {
                input: document.getElementById('contact-email'),
                error: document.getElementById('contact-email-error'),
                validate: (value) => {
                    const trimmed = value.trim();
                    if (!trimmed) {
                        return 'Please enter your email address.';
                    }
                    if (!Config.EMAIL_PATTERN.test(trimmed)) {
                        return 'Please enter a valid email address, for example name@example.com.';
                    }
                    return '';
                }
            },
            {
                input: document.getElementById('contact-message'),
                error: document.getElementById('contact-message-error'),
                validate: (value) => {
                    const trimmed = value.trim();
                    if (!trimmed) {
                        return 'Please write a short message.';
                    }
                    if (trimmed.length < 10) {
                        return 'Please add a little more detail (at least 10 characters).';
                    }
                    return '';
                }
            }
        ];
    }

    setFieldMessage(field, message) {
        field.error.textContent = message;
        field.error.hidden = !message;
        field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    validateField(field) {
        const message = field.validate(field.input.value);
        this.setFieldMessage(field, message);
        return message === '';
    }

    onSubmit(event) {
        event.preventDefault();

        let firstInvalid = null;

        this.fields.forEach((field) => {
            if (!this.validateField(field) && !firstInvalid) {
                firstInvalid = field.input;
            }
        });

        if (firstInvalid) {
            if (this.status) {
                this.status.className = 'field__status is-error';
                this.status.textContent = 'Please fix the highlighted fields and try again.';
            }
            firstInvalid.focus();
            return;
        }

        if (this.status) {
            this.status.className = 'field__status is-success';
            this.status.textContent =
                'Thanks! Your message form is ready to connect once a backend is configured. ' +
                'Nothing was sent yet - please use email or LinkedIn if you would like a reply.';
        }

        this.form.reset();
        this.fields.forEach((field) => this.setFieldMessage(field, ''));
    }
}

/* ==========================================================================
   12. PROJECT INTERACTIONS
   Three small jobs: (1) swap failed images for the styled placeholder so a
   broken-image icon never appears, (2) a subtle pointer tilt on project
   media for fine-pointer visitors, and (3) intercept "href=#" repository
   placeholders with an explanation instead of jumping to the top of the
   page. Real URLs behave normally with no other edit needed.
   ========================================================================== */
class ProjectInteractions {
    constructor({ toast } = {}) {
        this.toast = toast || null;
        this.handleImageError = (event) => {
            const target = event.target;
            if (target && target.tagName === 'IMG') {
                this.markImageAsMissing(target);
            }
        };
    }

    init() {
        this.initImageFallbacks();
        this.initTilt();
        this.initPlaceholderLinks();
    }

    markImageAsMissing(img) {
        const mediaWrapper = img.closest('.media');

        if (mediaWrapper) {
            mediaWrapper.classList.add('is-missing');
            return;
        }

        const card = img.closest('[data-gh-card]');

        if (card) {
            card.classList.add('is-missing');
            const fallback = Utils.qs('.gh-card__fallback', card);
            if (fallback) {
                fallback.hidden = false;
            }
        }
    }

    initImageFallbacks() {
        /* Images that already failed before this script ran. Lazy-loaded
           images that have not started loading also report complete, so they
           are skipped here and handled by the error listener instead. */
        Utils.qsa('img').forEach((img) => {
            if (img.getAttribute('loading') === 'lazy') {
                return;
            }
            if (img.complete && img.naturalWidth === 0) {
                this.markImageAsMissing(img);
            }
        });

        /* Errors do not bubble, so capture them at the window. */
        window.addEventListener('error', this.handleImageError, true);
    }

    initTilt() {
        if (!Utils.hasFinePointer() || Utils.isReducedMotion()) {
            return;
        }

        Utils.qsa('[data-tilt]').forEach((frame) => {
            const card = frame.closest('.project') || frame;
            let pending = null;

            const applyTilt = Utils.rafThrottle(() => {
                if (!pending) {
                    return;
                }
                frame.style.setProperty('--tilt-x', pending.x.toFixed(2) + 'deg');
                frame.style.setProperty('--tilt-y', pending.y.toFixed(2) + 'deg');
            });

            card.addEventListener('pointermove', (event) => {
                const rect = frame.getBoundingClientRect();
                if (!rect.width || !rect.height) {
                    return;
                }
                const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
                const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
                pending = {
                    x: Utils.clamp(-relativeY * 5, -3, 3),
                    y: Utils.clamp(relativeX * 5, -3, 3)
                };
                applyTilt();
            });

            card.addEventListener('pointerleave', () => {
                pending = null;
                frame.style.setProperty('--tilt-x', '0deg');
                frame.style.setProperty('--tilt-y', '0deg');
            });
        });
    }
}

/* Project placeholder links continued: kept separate so this part stays
   small enough to assemble safely. */
ProjectInteractions.prototype.initPlaceholderLinks = function () {
    const self = this;

    Utils.qsa('[data-project-link]').forEach((link) => {
        const href = (link.getAttribute('href') || '').trim();

        if (href && href !== '#') {
            return;
        }

        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (self.toast) {
                self.toast.show('Repository link not published yet - public work is at github.com/Gyabu');
            }
        });
    });
};

/* ==========================================================================
   13. CURSOR MANAGER
   Owns only the decorative desktop cursor: a ring that follows the pointer
   and reacts to interactive elements and project cards. The native cursor
   is never hidden. Disabled for touch devices and reduced motion.
   ========================================================================== */
class CursorManager {
    constructor() {
        this.root = document.documentElement;
        this.element = document.getElementById('cursor');
        this.dot = null;
        this.ring = null;
        this.pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.ringPos = { x: this.pointer.x, y: this.pointer.y };
        this.animating = false;
        this.handlePointerMove = (event) => this.onPointerMove(event);
        this.handlePointerOver = (event) => this.onPointerOver(event);
        this.handlePointerOut = (event) => this.onPointerOut(event);
        this.handleBlur = () => this.resetState();
    }

    init() {
        if (!this.element || !Utils.hasFinePointer() || Utils.isReducedMotion()) {
            return;
        }

        this.dot = Utils.qs('.cursor__dot', this.element);
        this.ring = Utils.qs('.cursor__ring', this.element);

        if (!this.dot || !this.ring) {
            return;
        }

        this.root.classList.add('has-custom-cursor');
        document.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        document.addEventListener('pointerover', this.handlePointerOver);
        document.addEventListener('mouseout', this.handlePointerOut);
        window.addEventListener('blur', this.handleBlur);
    }

    destroy() {
        this.root.classList.remove('has-custom-cursor');
    }

    onPointerMove(event) {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;

        if (this.element.style.opacity !== '1') {
            this.element.style.opacity = '1';
        }

        this.startLoop();
    }

    onPointerOver(event) {
        const target = event.target;

        if (!target || !target.closest) {
            return;
        }

        const isCard = Boolean(target.closest('[data-project], .skill-card'));
        const isInteractive = Boolean(target.closest('a, button, input, textarea, select, .chip, [role="option"]'));

        this.element.classList.toggle('is-card', isCard);
        this.element.classList.toggle('is-interactive', isInteractive && !isCard);
    }

    onPointerOut(event) {
        if (!event.relatedTarget) {
            this.element.style.opacity = '0';
            this.resetState();
        }
    }

    resetState() {
        if (this.element) {
            this.element.classList.remove('is-card', 'is-interactive');
        }
    }

    loop() {
        this.ringPos.x += (this.pointer.x - this.ringPos.x) * 0.18;
        this.ringPos.y += (this.pointer.y - this.ringPos.y) * 0.18;

        this.dot.style.transform = 'translate3d(' + this.pointer.x + 'px,' + this.pointer.y + 'px,0)';
        this.ring.style.transform =
            'translate3d(' + this.ringPos.x.toFixed(2) + 'px,' + this.ringPos.y.toFixed(2) + 'px,0)';

        if (Math.abs(this.pointer.x - this.ringPos.x) < 0.4 && Math.abs(this.pointer.y - this.ringPos.y) < 0.4) {
            this.animating = false;
            return;
        }

        window.requestAnimationFrame(() => this.loop());
    }

    startLoop() {
        if (!this.animating) {
            this.animating = true;
            window.requestAnimationFrame(() => this.loop());
        }
    }
}

/* ==========================================================================
   14. MAGNETIC BUTTONS
   Owns only the subtle pull (max 7px) on [data-magnetic] calls to action.
   Disabled for touch devices and reduced-motion visitors.
   ========================================================================== */
class MagneticButtons {
    constructor() {
        this.elements = Utils.qsa('[data-magnetic]');
    }

    init() {
        if (Utils.isReducedMotion() || !Utils.hasFinePointer()) {
            return;
        }

        this.elements.forEach((element) => {
            let pending = null;

            const applyPull = Utils.rafThrottle(() => {
                if (!pending) {
                    return;
                }
                element.style.setProperty('--mx', pending.x.toFixed(2) + 'px');
                element.style.setProperty('--my', pending.y.toFixed(2) + 'px');
            });

            element.addEventListener('pointermove', (event) => {
                const rect = element.getBoundingClientRect();
                const offsetX = (event.clientX - (rect.left + rect.width / 2)) * 0.16;
                const offsetY = (event.clientY - (rect.top + rect.height / 2)) * 0.16;

                pending = { x: Utils.clamp(offsetX, -7, 7), y: Utils.clamp(offsetY, -7, 7) };
                applyPull();
            });

            element.addEventListener('pointerleave', () => {
                pending = null;
                element.style.setProperty('--mx', '0px');
                element.style.setProperty('--my', '0px');
            });
        });
    }
}

/* ==========================================================================
   15. ACCESSIBILITY MANAGER
   Owns only the response to a mid-session reduced-motion change: the hero
   typewriter stops, the decorative cursor is removed and everything hidden
   for reveal becomes visible. Needs references to the typewriter, cursor and
   scroll managers, which PortfolioApp provides.
   ========================================================================== */
class AccessibilityManager {
    constructor({ typewriter, cursor, scroll } = {}) {
        this.typewriter = typewriter || null;
        this.cursor = cursor || null;
        this.scroll = scroll || null;
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.handleChange = () => this.onReducedMotion();
    }

    init() {
        if (this.motionQuery.addEventListener) {
            this.motionQuery.addEventListener('change', this.handleChange);
        } else if (this.motionQuery.addListener) {
            this.motionQuery.addListener(this.handleChange);
        }
    }

    onReducedMotion() {
        if (!this.motionQuery.matches) {
            return;
        }

        if (this.typewriter) {
            this.typewriter.stop();
        }

        if (this.cursor) {
            this.cursor.destroy();
        }

        if (this.scroll) {
            this.scroll.revealAll();
        } else {
            Utils.qsa('.reveal').forEach((item) => item.classList.add('is-visible'));
        }
    }
}

/* ==========================================================================
   16. PORTFOLIO APPLICATION
   Lightweight controller: constructs each feature class, wires the few
   cross-feature callbacks explicitly (palette actions, menu closing), then
   initialises everything. Missing optional sections never break the rest.
   ========================================================================== */
class PortfolioApp {
    constructor() {
        this.toast = new ToastManager();
        this.theme = new ThemeManager();
        this.mobileMenu = null;
        this.navigation = null;
        this.intro = new TerminalIntro();
        this.typewriter = new Typewriter();
        this.scroll = new ScrollManager();
        this.palette = null;
        this.clipboard = null;
        this.contactForm = new ContactForm();
        this.projects = null;
        this.cursor = new CursorManager();
        this.magnetic = new MagneticButtons();
        this.accessibility = null;
    }

    init() {
        this.toast.init();
        this.theme.init();

        this.clipboard = new ClipboardManager({ toast: this.toast });
        this.clipboard.init();

        /* Palette callbacks stay explicit so CommandPalette never reaches
           into other classes' internals. */
        this.mobileMenu = new MobileMenu({
            isOverlayOpen: () => Boolean(this.palette && this.palette.isOpen)
        });
        this.mobileMenu.init();

        this.navigation = new NavigationManager({
            onBeforeNavigate: () => this.mobileMenu.close()
        });
        this.navigation.init();

        this.intro.init();
        this.typewriter.init();
        this.scroll.init();

        this.palette = new CommandPalette({
            onNavigate: (id) => this.navigation.goToSection(id),
            onToggleTheme: () => {
                const next = this.theme.toggle();
                this.toast.show(next === 'light' ? 'Light theme enabled' : 'Dark theme enabled');
            },
            onCopyEmail: () => this.clipboard.copyEmail()
        });
        this.palette.init();

        this.contactForm.init();

        this.projects = new ProjectInteractions({ toast: this.toast });
        this.projects.init();

        this.magnetic.init();
        this.cursor.init();

        this.accessibility = new AccessibilityManager({
            typewriter: this.typewriter,
            cursor: this.cursor,
            scroll: this.scroll
        });
        this.accessibility.init();
    }
}

/* ==========================================================================
   17. BOOTSTRAP
   Single entry point. DOMContentLoaded covers the deferred script; the
   readyState check covers the case where parsing already finished.
   ========================================================================== */
function bootstrapPortfolio() {
    const app = new PortfolioApp();
    app.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPortfolio);
} else {
    bootstrapPortfolio();
}
