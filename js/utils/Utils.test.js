import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Utils from './Utils.js';

describe('Utils', () => {
    describe('qs', () => {
        it('returns the first matching element', () => {
            document.body.innerHTML = '<div id="test"><span class="child">1</span><span class="child">2</span></div>';
            const result = Utils.qs('.child');
            expect(result).not.toBeNull();
            expect(result.textContent).toBe('1');
        });

        it('returns null when no match', () => {
            document.body.innerHTML = '<div id="test"></div>';
            const result = Utils.qs('.nonexistent');
            expect(result).toBeNull();
        });

        it('uses provided scope', () => {
            document.body.innerHTML = '<div id="a"><span class="child">A</span></div><div id="b"><span class="child">B</span></div>';
            const scope = document.getElementById('b');
            const result = Utils.qs('.child', scope);
            expect(result.textContent).toBe('B');
        });
    });

    describe('qsa', () => {
        it('returns all matching elements as array', () => {
            document.body.innerHTML = '<div><span class="child">1</span><span class="child">2</span><span class="child">3</span></div>';
            const result = Utils.qsa('.child');
            expect(result).toHaveLength(3);
            expect(result.map(el => el.textContent)).toEqual(['1', '2', '3']);
        });

        it('returns empty array when no match', () => {
            document.body.innerHTML = '<div></div>';
            const result = Utils.qsa('.nonexistent');
            expect(result).toEqual([]);
        });
    });

    describe('clamp', () => {
        it('returns value within range', () => {
            expect(Utils.clamp(5, 0, 10)).toBe(5);
        });

        it('returns min when value below range', () => {
            expect(Utils.clamp(-5, 0, 10)).toBe(0);
        });

        it('returns max when value above range', () => {
            expect(Utils.clamp(15, 0, 10)).toBe(10);
        });

        it('handles equal bounds', () => {
            expect(Utils.clamp(5, 5, 5)).toBe(5);
        });
    });

    describe('debounce', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('delays execution', () => {
            const callback = vi.fn();
            const debounced = Utils.debounce(callback, 100);
            debounced('arg1');
            expect(callback).not.toHaveBeenCalled();
            vi.advanceTimersByTime(100);
            expect(callback).toHaveBeenCalledWith('arg1');
        });

        it('resets timer on subsequent calls', () => {
            const callback = vi.fn();
            const debounced = Utils.debounce(callback, 100);
            debounced('first');
            vi.advanceTimersByTime(50);
            debounced('second');
            vi.advanceTimersByTime(50);
            expect(callback).not.toHaveBeenCalled();
            vi.advanceTimersByTime(50);
            expect(callback).toHaveBeenCalledWith('second');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('rafThrottle', () => {
        it('queues only one callback per frame', () => {
            const callback = vi.fn();
            const throttled = Utils.rafThrottle(callback);
            throttled(1);
            throttled(2);
            throttled(3);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('readStore', () => {
        it('returns stored value', () => {
            localStorage.setItem('testKey', 'testValue');
            expect(Utils.readStore('testKey')).toBe('testValue');
        });

        it('returns null for missing key', () => {
            expect(Utils.readStore('missing')).toBeNull();
        });

        it('returns null when localStorage throws', () => {
            const original = window.localStorage;
            window.localStorage = { getItem: () => { throw new Error('denied'); } };
            expect(Utils.readStore('key')).toBeNull();
            window.localStorage = original;
        });
    });

    describe('writeStore', () => {
        it('writes value to localStorage', () => {
            Utils.writeStore('key', 'value');
            expect(localStorage.getItem('key')).toBe('value');
        });

        it('ignores errors silently', () => {
            const original = window.localStorage;
            window.localStorage = { setItem: () => { throw new Error('denied'); } };
            expect(() => Utils.writeStore('key', 'value')).not.toThrow();
            window.localStorage = original;
        });
    });

    describe('writeSessionStore', () => {
        it('writes value to sessionStorage', () => {
            Utils.writeSessionStore('key', 'value');
            expect(sessionStorage.getItem('key')).toBe('value');
        });

        it('ignores errors silently', () => {
            const original = window.sessionStorage;
            window.sessionStorage = { setItem: () => { throw new Error('denied'); } };
            expect(() => Utils.writeSessionStore('key', 'value')).not.toThrow();
            window.sessionStorage = original;
        });
    });
});