/** AccessibilityManager manages reduced-motion changes. */
import Utils from '../utils/Utils.js';

export default class AccessibilityManager {
    constructor({ typewriter, cursor, scroll } = {}) {
        this.typewriter = typewriter || null;
        this.cursor = cursor || null;
        this.scroll = scroll || null;
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.handleChange = () => this.onReducedMotion();
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        if (this.motionQuery.addEventListener) {
            this.motionQuery.addEventListener('change', this.handleChange);
        } else if (this.motionQuery.addListener) {
            this.motionQuery.addListener(this.handleChange);
        }
    }

    /** Disables motion effects when reduced motion is enabled. */
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
