/** MagneticButtons manages pointer-responsive magnetic button motion. */
import Utils from '../utils/Utils.js';

export default class MagneticButtons {
    constructor() {
        this.elements = Utils.qsa('[data-magnetic]');
    }

    /** Initializes the feature and registers its event listeners. */
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
