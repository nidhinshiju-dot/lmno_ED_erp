const fs = require('fs');

const data = { email: "superadmin1@schoolerp.app", password: "password" };
let out = "";

async function testApi() {
  try {
    const resAuth = await fetch("http://localhost:8081/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    out += `Direct Auth-Service: ${resAuth.status} ${resAuth.statusText}\n`;
    out += `Body: ${await resAuth.text()}\n\n`;
  } catch(e) { out += `Direct Error: ${e.message}\n\n`; }

  try {
    const resGw = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    out += `Gateway: ${resGw.status} ${resGw.statusText}\n`;
    out += `Body: ${await resGw.text()}\n\n`;
  } catch(e) { out += `Gateway Error: ${e.message}\n\n`; }
  
  fs.writeFileSync("test.out", out);
  console.log("Written to test.out");
}
testApi();
