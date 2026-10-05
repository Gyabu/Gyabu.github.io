/** ContactForm manages contact validation and submission. */
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class ContactForm {
    constructor({ contactService } = {}) {
        this.contactService = contactService;
        this.form = document.getElementById('contact-form');
        this.status = document.getElementById('contact-status');
        this.submitButton = this.form && this.form.querySelector('button[type="submit"]');
        this.submitLabel = this.submitButton ? this.submitButton.textContent : '';
        this.fields = [];
        this.handleSubmit = (event) => this.onSubmit(event);
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        if (!this.form) {
            return;
        }

        this.fields = this.buildFields().filter((field) => field.input && field.error);

        this.fields.forEach((field) => {
            /* Re-validate while typing once a field has been flagged. */
            field.input.addEventListener('input', () => {
                if (field.input.getAttribute('aria-invalid') === 'true') {
                    this.validateField(field);
                }
            });

            field.input.addEventListener('blur', () => {
                if (field.input.value.trim()) {
                    this.validateField(field);
                }
            });
        });

        this.form.addEventListener('submit', this.handleSubmit);
    }

    /** Builds the contact form field validators. */
    buildFields() {
        return [
            {
                input: document.getElementById('contact-name'),
                error: document.getElementById('contact-name-error'),
                validate: (value) => (value.trim() ? '' : 'Please enter your name.')
            },
            {
                input: document.getElementById('contact-email'),
                error: document.getElementById('contact-email-error'),
                validate: (value) => {
                    const trimmed = value.trim();
                    if (!trimmed) {
                        return 'Please enter your email address.';
                    }
                    if (!PortfolioConfig.EMAIL_PATTERN.test(trimmed)) {
                        return 'Please enter a valid email address, for example name@example.com.';
                    }
                    return '';
                }
            },
            {
                input: document.getElementById('contact-message'),
                error: document.getElementById('contact-message-error'),
                validate: (value) => {
                    const trimmed = value.trim();
                    if (!trimmed) {
                        return 'Please write a short message.';
                    }
                    if (trimmed.length < 10) {
                        return 'Please add a little more detail (at least 10 characters).';
                    }
                    return '';
                }
            }
        ];
    }

    /** Updates a field error and its accessibility state. */
    setFieldMessage(field, message) {
        field.error.textContent = message;
        field.error.hidden = !message;
        field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    /** Validates a contact field and displays its error. */
    validateField(field) {
        const message = field.validate(field.input.value);
        this.setFieldMessage(field, message);
        return message === '';
    }

    async onSubmit(event) {
        event.preventDefault();

        if (this.submitButton && this.submitButton.disabled) {
            return;
        }

        let firstInvalid = null;

        this.fields.forEach((field) => {
            if (!this.validateField(field) && !firstInvalid) {
                firstInvalid = field.input;
            }
        });

        if (firstInvalid) {
            if (this.status) {
                this.status.className = 'field__status is-error';
                this.status.textContent = 'Please fix the highlighted fields and try again.';
            }
            firstInvalid.focus();
            return;
        }

        if (this.status) {
            this.status.className = 'field__status';
            this.status.textContent = 'Sending...';
        }

        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Sending...';
        }

        try {
            const response = await this.contactService.send({
                name: this.form.elements.namedItem('name').value,
                email: this.form.elements.namedItem('email').value,
                message: this.form.elements.namedItem('message').value,
                website: this.form.elements.namedItem('website').value
            });

            if (!response.ok) {
                if (this.status) {
                    this.status.className = 'field__status is-error';
                    if (response.status === 404) {
                        this.status.textContent = 'Contact API not available here. It only works on the deployed site.';
                    } else {
                        const result = await response.json().catch(() => ({}));
                        this.status.textContent = result.error
                            ? 'Could not send: ' + result.error
                            : 'Could not send (HTTP ' + response.status + '). Please email me directly.';
                    }
                }
                return;
            }

            this.form.reset();
            this.fields.forEach((field) => this.setFieldMessage(field, ''));
            if (this.status) {
                this.status.className = 'field__status is-success';
                this.status.textContent = 'Thanks! Your message was sent.';
            }
        } catch (error) {
            if (this.status) {
                this.status.className = 'field__status is-error';
                this.status.textContent = 'Could not send. Please email me directly.';
            }
        } finally {
            if (this.submitButton) {
                this.submitButton.disabled = false;
                this.submitButton.textContent = this.submitLabel;
            }
        }
    }
}
