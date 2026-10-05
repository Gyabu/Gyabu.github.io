/** MobileMenu manages the responsive navigation menu. */
import Utils from '../utils/Utils.js';

export default class MobileMenu {
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

    /** Initializes the feature and registers its event listeners. */
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

    /** Opens the associated interface. */
    open() {
        this.set(true);
    }

    /** Closes the associated interface. */
    close() {
        this.set(false);
    }

    /** Updates the menu state. */
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
