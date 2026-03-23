const baseUrl = 'http://127.0.0.1:8090/api/v1';

async function run() {
    try {
        const authRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@tella.com', password: 'password' })
        });
        const data = await authRes.json();
        const payload = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64').toString());
        console.log("Token payload for admin@tella.com:", payload);
    } catch (err) {
        console.error("Error:", err);
    }
}
run();
