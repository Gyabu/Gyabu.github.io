/** ToastManager manages transient accessible feedback. */

export default class ToastManager {
    constructor() {
        this.element = document.getElementById('toast');
        this.hideTimer = 0;
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        /* Nothing to bind; show() guards on the element every time. */
    }

    /** Displays an accessible toast message. */
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
