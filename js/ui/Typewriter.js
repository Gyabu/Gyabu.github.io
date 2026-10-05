/** Typewriter manages the rotating hero roles. */
import Utils from '../utils/Utils.js';
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class Typewriter {
    constructor() {
        this.element = document.getElementById('typewriter');
        this.roles = PortfolioConfig.ROLES;
        this.roleIndex = 0;
        this.charIndex = 0;
        this.deleting = false;
        this.timer = 0;
    }

    /** Initializes the feature and registers its event listeners. */
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

    /** Stops the typewriter animation. */
    stop() {
        window.clearTimeout(this.timer);
        if (this.element) {
            this.element.textContent = this.roles[0];
        }
    }

    /** Advances the typewriter animation. */
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
