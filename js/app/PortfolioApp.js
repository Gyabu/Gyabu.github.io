/** Composes portfolio features and wires their cross-feature callbacks. */
import ContactService from '../services/ContactService.js';
import AccessibilityManager from '../ui/AccessibilityManager.js';
import ClipboardManager from '../ui/ClipboardManager.js';
import CommandPalette from '../ui/CommandPalette.js';
import ContactForm from '../ui/ContactForm.js';
import CursorManager from '../ui/CursorManager.js';
import MagneticButtons from '../ui/MagneticButtons.js';
import MobileMenu from '../ui/MobileMenu.js';
import NavigationManager from '../ui/NavigationManager.js';
import ProjectInteractions from '../ui/ProjectInteractions.js';
import ScrollManager from '../ui/ScrollManager.js';
import TerminalIntro from '../ui/TerminalIntro.js';
import ThemeManager from '../ui/ThemeManager.js';
import ToastManager from '../ui/ToastManager.js';
import Typewriter from '../ui/Typewriter.js';

export default class PortfolioApp {
    /** Creates feature instances and their shared dependencies. */
    constructor() {
        this.toast = new ToastManager();
        this.theme = new ThemeManager();
        this.mobileMenu = null;
        this.navigation = null;
        this.intro = new TerminalIntro();
        this.typewriter = new Typewriter();
        this.scroll = new ScrollManager();
        this.palette = null;
        this.clipboard = null;
        this.contactService = new ContactService();
        this.contactForm = new ContactForm({ contactService: this.contactService });
        this.projects = null;
        this.cursor = new CursorManager();
        this.magnetic = new MagneticButtons();
        this.accessibility = null;
    }

    /** Initializes features in their established order. */
    /** Initializes the feature and registers its event listeners. */
    init() {
        this.toast.init();
        this.theme.init();

        this.clipboard = new ClipboardManager({ toast: this.toast });
        this.clipboard.init();

        this.mobileMenu = new MobileMenu({
            isOverlayOpen: () => Boolean(this.palette && this.palette.isOpen)
        });
        this.mobileMenu.init();

        this.navigation = new NavigationManager({
            onBeforeNavigate: () => this.mobileMenu.close()
        });
        this.navigation.init();

        this.intro.init();
        this.typewriter.init();
        this.scroll.init();

        this.palette = new CommandPalette({
            onNavigate: (id) => this.navigation.goToSection(id),
            onToggleTheme: () => {
                const next = this.theme.toggle();
                this.toast.show(next === 'light' ? 'Light theme enabled' : 'Dark theme enabled');
            },
            onCopyEmail: () => this.clipboard.copyEmail()
        });
        this.palette.init();

        this.contactForm.init();

        this.projects = new ProjectInteractions({ toast: this.toast });
        this.projects.init();

        this.magnetic.init();
        this.cursor.init();

        this.accessibility = new AccessibilityManager({
            typewriter: this.typewriter,
            cursor: this.cursor,
            scroll: this.scroll
        });
        this.accessibility.init();
    }
}
