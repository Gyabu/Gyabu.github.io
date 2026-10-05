import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ContactService from './ContactService.js';

describe('ContactService', () => {
    let service;
    let originalFetch;

    beforeEach(() => {
        service = new ContactService();
        originalFetch = global.fetch;
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('sends POST request to /api/contact', async () => {
        const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
        global.fetch.mockResolvedValue(mockResponse);

        const payload = { name: 'Test', email: 'test@example.com', message: 'Hello' };
        const response = await service.send(payload);

        expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        expect(response).toBe(mockResponse);
    });

    it('stringifies payload as JSON', async () => {
        global.fetch.mockResolvedValue({ ok: true });

        await service.send({ name: 'Test', email: 'test@example.com', message: 'Hello' });

        const call = global.fetch.mock.calls[0];
        expect(call[1].body).toBe(JSON.stringify({ name: 'Test', email: 'test@example.com', message: 'Hello' }));
    });

    it('sets correct headers', async () => {
        global.fetch.mockResolvedValue({ ok: true });

        await service.send({});

        const call = global.fetch.mock.calls[0];
        expect(call[1].headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('uses POST method', async () => {
        global.fetch.mockResolvedValue({ ok: true });

        await service.send({});

        const call = global.fetch.mock.calls[0];
        expect(call[1].method).toBe('POST');
    });

    it('propagates fetch errors', async () => {
        const error = new Error('Network error');
        global.fetch.mockRejectedValue(error);

        await expect(service.send({})).rejects.toThrow('Network error');
    });
});