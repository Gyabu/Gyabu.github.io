import PortfolioApp from './app/PortfolioApp.js';

function bootstrapPortfolio() {
    const app = new PortfolioApp();
    app.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPortfolio);
} else {
    bootstrapPortfolio();
}
