/** Shared DOM, timing, motion and storage helpers. */
const Utils = {
    /** Returns the first matching element. */
    qs(selector, scope) {
        return (scope || document).querySelector(selector);
    },

    /** Returns all matching elements as an array. */
    qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },

    /** Reports whether reduced motion is requested. */
    isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /** Reports whether a fine pointer is available. */
    hasFinePointer() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    },

    /** Constrains a number to a range. */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /** Throttles a callback to one call per animation frame. */
    rafThrottle(callback) {
        let queued = false;
        let lastArgs = null;

        return function throttled(...args) {
            lastArgs = args;
            if (queued) {
                return;
            }
            queued = true;
            window.requestAnimationFrame(() => {
                queued = false;
                callback.apply(null, lastArgs);
            });
        };
    },

    /** Delays a callback until activity pauses. */
    debounce(callback, wait) {
        let timer = null;

        return function debounced(...args) {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    },

    /** Reads a value from local storage safely. */
    readStore(key) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },

    /** Writes a value to local storage safely. */
    writeStore(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            /* ignore */
        }
    },

    /** Writes a value to session storage safely. */
    writeSessionStore(key, value) {
        try {
            window.sessionStorage.setItem(key, value);
        } catch (error) {
            /* ignore */
        }
    }
};

export default Utils;
