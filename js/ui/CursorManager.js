/** CursorManager manages the decorative desktop cursor. */
import Utils from '../utils/Utils.js';

export default class CursorManager {
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

    /** Initializes the feature and registers its event listeners. */
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

    /** Removes the decorative cursor. */
    destroy() {
        this.root.classList.remove('has-custom-cursor');
    }

    /** Updates the decorative cursor position. */
    onPointerMove(event) {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;

        if (this.element.style.opacity !== '1') {
            this.element.style.opacity = '1';
        }

        this.startLoop();
    }

    /** Updates the cursor for the hovered target. */
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

    /** Restores the cursor after leaving a target. */
    onPointerOut(event) {
        if (!event.relatedTarget) {
            this.element.style.opacity = '0';
            this.resetState();
        }
    }

    /** Resets the decorative cursor state. */
    resetState() {
        if (this.element) {
            this.element.classList.remove('is-card', 'is-interactive');
        }
    }

    /** Renders one decorative cursor animation frame. */
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

    /** Starts the decorative cursor animation. */
    startLoop() {
        if (!this.animating) {
            this.animating = true;
            window.requestAnimationFrame(() => this.loop());
        }
    }
}
