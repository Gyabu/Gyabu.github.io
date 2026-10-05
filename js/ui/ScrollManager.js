/** ScrollManager manages scroll-triggered reveals. */
import Utils from '../utils/Utils.js';

export default class ScrollManager {
    constructor() {
        this.items = Utils.qsa('.reveal');
    }

    /** Initializes the feature and registers its event listeners. */
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

    /** Reveals all scroll-animated content. */
    revealAll() {
        this.items.forEach((item) => item.classList.add('is-visible'));
    }
}
