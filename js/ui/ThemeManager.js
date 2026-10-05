/** ThemeManager manages theme changes and persistence. */
import Utils from '../utils/Utils.js';
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class ThemeManager {
    constructor() {
        this.root = document.documentElement;
        this.toggleButton = document.getElementById('theme-toggle');
        this.metaThemeColor = document.getElementById('meta-theme-color');
        this.systemQuery = window.matchMedia('(prefers-color-scheme: light)');
        this.handleSystemChange = (event) => {
            /* An explicit visitor choice always wins over the OS setting. */
            if (Utils.readStore(PortfolioConfig.THEME_KEY)) {
                return;
            }
            this.apply(event.matches ? 'light' : 'dark', false);
        };
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        this.apply(this.current(), false);

        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }

        if (this.systemQuery.addEventListener) {
            this.systemQuery.addEventListener('change', this.handleSystemChange);
        } else if (this.systemQuery.addListener) {
            this.systemQuery.addListener(this.handleSystemChange);
        }
    }

    /** Returns the active theme. */
    current() {
        return this.root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    /** Applies a theme and optionally persists it. */
    apply(theme, persist) {
        const next = theme === 'light' ? 'light' : 'dark';
        this.root.setAttribute('data-theme', next);

        if (this.metaThemeColor) {
            this.metaThemeColor.setAttribute('content', PortfolioConfig.THEME_COLORS[next]);
        }

        if (this.toggleButton) {
            this.toggleButton.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
            this.toggleButton.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        }

        if (persist) {
            Utils.writeStore(PortfolioConfig.THEME_KEY, next);
        }

        return next;
    }

    /** Toggles the active state. */
    toggle() {
        return this.apply(this.current() === 'light' ? 'dark' : 'light', true);
    }

}
