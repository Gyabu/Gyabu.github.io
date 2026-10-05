/** Sends validated contact form payloads to the portfolio API. */
export default class ContactService {
    /** Posts a contact payload to the contact API. */
    send(payload) {
        return fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
}
