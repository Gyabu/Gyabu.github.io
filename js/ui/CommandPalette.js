/** CommandPalette manages the searchable command dialog. */
import Utils from '../utils/Utils.js';

export default class CommandPalette {
    constructor({ onNavigate, onToggleTheme, onCopyEmail } = {}) {
        this.element = document.getElementById('palette');
        this.trigger = document.getElementById('palette-trigger');
        this.input = document.getElementById('palette-input');
        this.list = document.getElementById('palette-list');
        this.empty = document.getElementById('palette-empty');
        this.count = document.getElementById('palette-count');
        this.onNavigate = typeof onNavigate === 'function' ? onNavigate : () => {};
        this.onToggleTheme = typeof onToggleTheme === 'function' ? onToggleTheme : () => {};
        this.onCopyEmail = typeof onCopyEmail === 'function' ? onCopyEmail : () => {};
        this.isOpen = false;
        this.commands = [];
        this.matches = [];
        this.activeIndex = 0;
        this.lastFocus = null;
        this.handleInputKeydown = (event) => this.onInputKeydown(event);
        this.handleInput = () => this.renderMatches(this.input.value);
        this.handleListClick = (event) => {
            const option = event.target.closest && event.target.closest('.palette__option');
            if (option) {
                this.run(Number(option.getAttribute('data-index')));
            }
        };
        this.handleScrimClick = (event) => {
            const inDialog = event.target.closest && event.target.closest('.palette__dialog');
            if (!inDialog) {
                this.close(true);
            }
        };
        this.handleGlobalKeydown = (event) => this.onGlobalKeydown(event);
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        if (!this.element || !this.trigger || !this.input || !this.list) {
            return;
        }

        this.commands = this.buildCommands();
        this.renderMatches('');
        this.trigger.addEventListener('click', () => this.open());
        this.input.addEventListener('input', this.handleInput);
        this.input.addEventListener('keydown', this.handleInputKeydown);
        this.list.addEventListener('click', this.handleListClick);
        this.element.addEventListener('click', this.handleScrimClick);
        document.addEventListener('keydown', this.handleGlobalKeydown);
    }

    /** Builds the available palette commands. */
    buildCommands() {
        const nav = [
            { id: 'home', label: 'Go to Home', keywords: 'home hero top' },
            { id: 'about', label: 'Go to About', keywords: 'about profile summary' },
            { id: 'skills', label: 'Go to Skills', keywords: 'skills technologies tools' },
            { id: 'projects', label: 'Go to Projects', keywords: 'projects work portfolio' },
            { id: 'education', label: 'Go to Education', keywords: 'education school degree' },
            { id: 'contact', label: 'Go to Contact', keywords: 'contact email message' }
        ].map((item) => ({
            label: item.label,
            hint: 'Navigate',
            mark: '>',
            keywords: item.keywords,
            run: () => this.onNavigate(item.id)
        }));

        return nav.concat([
            {
                label: 'Toggle Dark Mode',
                hint: 'Theme',
                mark: '*',
                keywords: 'theme dark light mode appearance',
                run: () => this.onToggleTheme()
            },
            {
                label: 'Copy Email',
                hint: 'Clipboard',
                mark: '#',
                keywords: 'email copy clipboard address',
                run: () => this.onCopyEmail()
            }
        ]);
    }

    /** Opens the associated interface. */
    open() {
        if (this.isOpen) {
            return;
        }

        this.lastFocus = document.activeElement;
        this.isOpen = true;
        this.element.hidden = false;
        this.input.value = '';
        this.renderMatches('');
        this.input.focus();
    }

    /** Closes the associated interface. */
    close(returnFocus) {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.element.hidden = true;

        if (returnFocus !== false && this.lastFocus && typeof this.lastFocus.focus === 'function') {
            this.lastFocus.focus();
        }
    }

    /** Toggles the active state. */
    toggle() {
        if (this.isOpen) {
            this.close(true);
        } else {
            this.open();
        }
    }

    /** Updates the active command option. */
    setActive(index) {
        if (!this.matches.length) {
            this.activeIndex = -1;
            this.input.setAttribute('aria-activedescendant', '');
            return;
        }

        this.activeIndex = (index + this.matches.length) % this.matches.length;

        const options = Utils.qsa('.palette__option', this.list);
        options.forEach((option, i) => {
            option.setAttribute('aria-selected', i === this.activeIndex ? 'true' : 'false');
        });

        const active = options[this.activeIndex];

        if (active) {
            this.input.setAttribute('aria-activedescendant', active.id);

            const top = active.offsetTop;
            const bottom = top + active.offsetHeight;
            if (top < this.list.scrollTop) {
                this.list.scrollTop = top;
            } else if (bottom > this.list.scrollTop + this.list.clientHeight) {
                this.list.scrollTop = bottom - this.list.clientHeight;
            }
        }
    }

    /** Renders commands matching the query. */
    renderMatches(query) {
        const term = String(query || '').trim().toLowerCase();
        const self = this;

        this.matches = this.commands.filter((command) => {
            if (!term) {
                return true;
            }
            return (
                command.label.toLowerCase().indexOf(term) !== -1 ||
                command.hint.toLowerCase().indexOf(term) !== -1 ||
                (command.keywords || '').toLowerCase().indexOf(term) !== -1
            );
        });

        this.list.innerHTML = '';

        this.matches.forEach((command, index) => {
            const option = document.createElement('li');
            option.className = 'palette__option';
            option.id = 'palette-option-' + index;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.setAttribute('data-index', String(index));

            const mark = document.createElement('span');
            mark.className = 'palette__option-mark';
            mark.setAttribute('aria-hidden', 'true');
            mark.textContent = command.mark;

            const label = document.createElement('span');
            label.className = 'palette__option-label';
            label.textContent = command.label;

            const hint = document.createElement('span');
            hint.className = 'palette__option-hint';
            hint.textContent = command.hint;

            option.appendChild(mark);
            option.appendChild(label);
            option.appendChild(hint);
            self.list.appendChild(option);
        });

        if (this.empty) {
            this.empty.hidden = this.matches.length > 0;
        }

        if (this.count) {
            this.count.textContent = this.matches.length === 1
                ? '1 command'
                : this.matches.length + ' commands';
        }

        this.setActive(0);
    }

    /** Runs the selected command. */
    run(index) {
        const command = this.matches[index];
        if (!command) {
            return;
        }
        this.close(false);
        command.run();
    }

    /** Handles keyboard navigation within the palette. */
    onInputKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.setActive(this.activeIndex + 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.setActive(this.activeIndex - 1);
                break;
            case 'Home':
                event.preventDefault();
                this.setActive(0);
                break;
            case 'End':
                event.preventDefault();
                this.setActive(this.matches.length - 1);
                break;
            case 'Enter':
                if (this.activeIndex >= 0) {
                    event.preventDefault();
                    this.run(this.activeIndex);
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.close(true);
                break;
            case 'Tab':
                event.preventDefault();
                this.input.focus();
                break;
            default:
                break;
        }
    }

    /** Handles global palette keyboard shortcuts. */
    onGlobalKeydown(event) {
        const key = event.key ? event.key.toLowerCase() : '';

        if ((event.ctrlKey || event.metaKey) && key === 'k') {
            event.preventDefault();
            this.toggle();
            return;
        }

        if (key === 'escape' && this.isOpen) {
            this.close(true);
        }
    }
}
