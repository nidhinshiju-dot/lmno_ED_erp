const fs = require('fs');
const token = fs.readFileSync('src/lib/api.ts').toString(); // no wait, localStorage is in browser.

fetch('http://127.0.0.1:8090/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'password' })
}).then(r => r.json()).then(d => {
    const payload = JSON.parse(Buffer.from(d.token.split('.')[1], 'base64').toString());
    console.log("Token payload:", payload);
});
