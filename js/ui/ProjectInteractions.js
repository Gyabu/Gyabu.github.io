/** ProjectInteractions manages project image, tilt and placeholder-link behavior. */
import Utils from '../utils/Utils.js';

export default class ProjectInteractions {
    constructor({ toast } = {}) {
        this.toast = toast || null;
        this.handleImageError = (event) => {
            const target = event.target;
            if (target && target.tagName === 'IMG') {
                this.markImageAsMissing(target);
            }
        };
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        this.initImageFallbacks();
        this.initTilt();
        this.initPlaceholderLinks();
    }

    /** Marks a failed image container for fallback styling. */
    markImageAsMissing(img) {
        const mediaWrapper = img.closest('.media');

        if (mediaWrapper) {
            mediaWrapper.classList.add('is-missing');
            return;
        }

    }

    /** Detects failed images and registers error handling. */
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

    /** Registers reduced-motion-aware project tilt interactions. */
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


    /** Provides feedback for unpublished repository links. */
    initPlaceholderLinks() {
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
    }
}
