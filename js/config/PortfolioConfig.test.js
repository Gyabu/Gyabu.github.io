import { describe, it, expect } from 'vitest';
import PortfolioConfig from './PortfolioConfig.js';

describe('PortfolioConfig', () => {
    it('exports correct email', () => {
        expect(PortfolioConfig.EMAIL).toBe('gabrielportillo0316@gmail.com');
    });

    it('exports theme keys', () => {
        expect(PortfolioConfig.THEME_KEY).toBe('jr-portfolio:theme');
        expect(PortfolioConfig.INTRO_KEY).toBe('jr-portfolio:intro-seen');
    });

    it('exports theme colors', () => {
        expect(PortfolioConfig.THEME_COLORS).toEqual({ dark: '#0a0d12', light: '#f5f7f9' });
    });

    it('exports section IDs', () => {
        expect(PortfolioConfig.SECTION_IDS).toEqual([
            'home', 'about', 'skills', 'projects', 'education', 'contact'
        ]);
    });

    it('exports roles', () => {
        expect(PortfolioConfig.ROLES).toEqual([
            'Full-Stack Developer', 'DevOps', 'AI Integrator'
        ]);
    });

    it('exports email pattern regex', () => {
        expect(PortfolioConfig.EMAIL_PATTERN).toBeInstanceOf(RegExp);
        expect(PortfolioConfig.EMAIL_PATTERN.test('test@example.com')).toBe(true);
        expect(PortfolioConfig.EMAIL_PATTERN.test('invalid')).toBe(false);
        expect(PortfolioConfig.EMAIL_PATTERN.test('test@')).toBe(false);
        expect(PortfolioConfig.EMAIL_PATTERN.test('@example.com')).toBe(false);
    });
});