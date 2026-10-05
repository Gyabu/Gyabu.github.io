/** TerminalIntro manages the first-visit terminal introduction. */
import Utils from '../utils/Utils.js';
import PortfolioConfig from '../config/PortfolioConfig.js';

export default class TerminalIntro {
    constructor() {
        this.root = document.documentElement;
        this.body = document.body;
        this.element = document.getElementById('intro');
        this.skipButton = document.getElementById('intro-skip');
        this.output = document.getElementById('intro-output');
        this.main = document.getElementById('main');
        this.sequence = [
            { prompt: true, text: 'whoami' },
            { prompt: false, text: 'J.R. Gabriel Portillo - BSIT Software Development Student' },
            { prompt: true, text: 'cat about.txt' },
            { prompt: false, text: 'Software Development major at Mapúa Malayan Colleges Laguna. 149/161 credits completed. Seeking an IT internship in full-stack, backend, AI or DevOps work.' },
            { prompt: true, text: 'ls projects/' },
            { prompt: false, text: 'nervless/   brainbytes/   cafefind/' }
        ];
        this.sequence.push(
            { prompt: true, text: 'echo $focus' },
            { prompt: false, text: 'full-stack web  |  backend systems  |  ai integration  |  devops' },
            { prompt: true, text: './open portfolio --role="Full-Stack & DevOps"' },
            { prompt: false, text: 'Booting portfolio interface...' }
        );
        this.lineIndex = 0;
        this.charIndex = 0;
        this.currentLine = null;
        this.timer = 0;
        this.isComplete = false;
        this.handleSkip = () => this.complete();
        this.handleKeydown = (event) => {
            if (!this.isComplete && event.key === 'Escape') {
                this.complete();
            }
        };
    }

    /** Initializes the feature and registers its event listeners. */
    init() {
        if (!this.element || !this.skipButton || !this.output) {
            return;
        }

        /* The inline boot script already decided whether this session sees it. */
        if (this.root.getAttribute('data-intro') !== 'play') {
            return;
        }

        this.body.classList.add('has-overlay-open');
        this.skipButton.addEventListener('click', this.handleSkip);
        document.addEventListener('keydown', this.handleKeydown);
        this.timer = window.setTimeout(() => this.typeStep(), 420);
    }

    /** Completes and dismisses the terminal introduction. */
    complete() {
        if (this.isComplete) {
            return;
        }
        this.isComplete = true;
        window.clearTimeout(this.timer);
        Utils.writeSessionStore(PortfolioConfig.INTRO_KEY, 'true');

        const focusWasInside = this.element.contains(document.activeElement);
        this.element.classList.add('is-leaving');
        this.body.classList.remove('has-overlay-open');

        window.setTimeout(() => {
            this.element.hidden = true;
            if (focusWasInside && this.main) {
                this.main.focus({ preventScroll: true });
            }
        }, 460);
    }

    /** Advances the terminal introduction animation. */
    typeStep() {
        if (this.isComplete) {
            return;
        }

        const item = this.sequence[this.lineIndex];

        if (!item) {
            this.timer = window.setTimeout(() => this.complete(), 520);
            return;
        }

        if (this.charIndex === 0) {
            this.currentLine = document.createElement('span');
            if (item.prompt) {
                this.currentLine.className = 'is-prompt';
                this.currentLine.textContent = '$ ';
            }
            this.output.appendChild(this.currentLine);
        }

        if (this.charIndex < item.text.length) {
            this.currentLine.textContent += item.text.charAt(this.charIndex);
            this.charIndex += 1;
            const pace = item.text.length > 60 ? 5 : 16;
            this.timer = window.setTimeout(() => this.typeStep(), pace);
            return;
        }

        this.output.appendChild(document.createTextNode('\n'));
        this.lineIndex += 1;
        this.charIndex = 0;
        const pause = item.prompt ? 230 : 190;
        this.timer = window.setTimeout(() => this.typeStep(), pause);
    }
}
