

async function main() {
    try {
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginId: "superadmin@schooliat.com",
                password: "password123"
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);

        if (!loginData.data?.token) {
            console.log('Could not obtain token:', loginData);
            process.exit(1);
        }

        const token = loginData.data.token;
        console.log('Got token, fetching templates...');

        const templatesRes = await fetch('http://localhost:3001/api/templates', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Templates Response Status:', templatesRes.status);
        const templatesData = await templatesRes.json();
        console.dir(templatesData, { depth: null });

    } catch (e) {
        console.error(e);
    }
}
main();
