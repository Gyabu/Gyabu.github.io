/** ClipboardManager manages email copying and feedback. */
import Utils from '../utils/Utils.js';
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class ClipboardManager {
    constructor({ toast } = {}) {
        this.toast = toast || null;
        this.email = PortfolioConfig.EMAIL;
        this.handleButtonClick = (event) => {
            event.preventDefault();
            this.copyEmail();
        };
    }

    /** Initializes the feature and registers its event listeners. */
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

    /** Copies the configured email address. */
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

    /** Copies text using the legacy browser API. */
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

    /** Shows the temporary copied state on buttons. */
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
