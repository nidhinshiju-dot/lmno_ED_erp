async function verify() {
    const gateway = 'https://api-gateway-249177610154.asia-south1.run.app/api/v1';
    
    console.log("1. Logging in as super admin...");
    const loginRes = await fetch(`${gateway}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin1@schoolerp.app', password: 'SuperAdmin@2026' })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
        console.error("Login failed!", loginRes.status, loginData);
        return;
    }
    const token = loginData.token;
    console.log("   - Logged in successfully.");
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log("\n2. Fetching all staff...");
    const staffRes = await fetch(`${gateway}/staff`, { method: 'GET', headers });
    const staffData = await staffRes.json();
    
    if (!staffRes.ok || !Array.isArray(staffData)) {
        console.error("Failed to fetch staff!", staffRes.status, staffData);
        return;
    }
    const targetStaff = staffData.find(s => s.email === 'sujav@aupschool.com');
    if (!targetStaff) {
        console.error("Could not find staff: sujav@aupschool.com");
        return;
    }
    console.log(`   - Found staff: ${targetStaff.name} (ID: ${targetStaff.id})`);
    console.log(`   - Current userId: ${targetStaff.userId || 'null'}`);

    console.log(`\n3. Calling POST /staff/${targetStaff.id}/provision-login ...`);
    const provRes = await fetch(`${gateway}/staff/${targetStaff.id}/provision-login`, { method: 'POST', headers });
    console.log(`   - Provision response status: ${provRes.status}`);
    const provText = await provRes.text();
    console.log(`   - Provision response data:`, provText);

    // Wait 1.5 seconds for sync
    await new Promise(r => setTimeout(r, 1500));

    console.log("\n4. Verifying updated staff record...");
    const staffFetch = await fetch(`${gateway}/staff/${targetStaff.id}`, { method: 'GET', headers });
    const staffDetails = await staffFetch.json();
    console.log(`   - Updated userId: ${staffDetails.userId || 'null'}`);

    console.log("\n5. Retrying generate-reset-token...");
    const resetRes = await fetch(`${gateway}/auth/generate-reset-token`, { 
        method: 'POST', 
        headers,
        body: JSON.stringify({ email: 'sujav@aupschool.com' })
    });
    console.log(`   - Reset Token API status: ${resetRes.status}`);
    const resetText = await resetRes.text();
    console.log(`   - Reset Token API response:`, resetText);
}

verify().catch(console.error);
