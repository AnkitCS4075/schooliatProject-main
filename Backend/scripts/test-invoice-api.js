const API_URL = "http://localhost:4000";
const credentials = {
    request: {
        email: "admin@schooliat.com",
        password: "Admin@123",
    }
};

async function testInvoiceAPI() {
    try {
        console.log("1. Authenticating as Super Admin...");
        const loginRes = await fetch(`${API_URL}/auth/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-platform": "web"
            },
            body: JSON.stringify(credentials),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.log("Login Response Data:", JSON.stringify(loginData, null, 2));
            throw new Error(`Authentication failed with status ${loginRes.status}`);
        }

        const token = loginData.token;
        if (!token) {
            throw new Error("Token not found in authentication response");
        }
        console.log("Authenticated successfully!\n");

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        // Get a school and a vendor for testing
        const schoolsRes = await fetch(`${API_URL}/schools`, { headers });
        const schoolsData = await schoolsRes.json();
        if (!schoolsData.data || schoolsData.data.length === 0) {
            throw new Error("No schools found for testing");
        }
        const schoolId = schoolsData.data[0].id;
        console.log(`Using School ID: ${schoolId}`);

        const vendorsRes = await fetch(`${API_URL}/vendors`, { headers });
        const vendorsData = await vendorsRes.json();
        if (!vendorsData.data || vendorsData.data.length === 0) {
            throw new Error("No vendors found for testing");
        }
        const vendorId = vendorsData.data[0].id;
        console.log(`Using Vendor ID: ${vendorId}\n`);

        // 2. Create Invoice for School
        console.log("2. Creating Invoice for School...");
        const schoolInvoiceRes = await fetch(`${API_URL}/invoices`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                request: {
                    schoolId,
                    baseAmount: "1000.00",
                    sgstPercent: "9",
                    cgstPercent: "9",
                    description: "Test School Invoice",
                    dueDate: new Date(Date.now() + 86400000).toISOString(),
                }
            }),
        });
        const schoolInvoiceData = await schoolInvoiceRes.json();
        if (!schoolInvoiceRes.ok) throw new Error(`Create school invoice failed: ${JSON.stringify(schoolInvoiceData)}`);
        const schoolInvoiceId = schoolInvoiceData.data.id;
        console.log(`Created School Invoice ID: ${schoolInvoiceId}\n`);

        // 3. Create Invoice for Vendor
        console.log("3. Creating Invoice for Vendor...");
        const vendorInvoiceRes = await fetch(`${API_URL}/invoices`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                request: {
                    vendorId,
                    baseAmount: "5000.00",
                    igstPercent: "18",
                    description: "Test Vendor Invoice",
                }
            }),
        });
        const vendorInvoiceData = await vendorInvoiceRes.json();
        if (!vendorInvoiceRes.ok) throw new Error(`Create vendor invoice failed: ${JSON.stringify(vendorInvoiceData)}`);
        const vendorInvoiceId = vendorInvoiceData.data.id;
        console.log(`Created Vendor Invoice ID: ${vendorInvoiceId}\n`);

        // 4. Fetch Invoices
        console.log("4. Fetching Invoices...");
        const invoicesRes = await fetch(`${API_URL}/invoices`, { headers });
        const invoicesData = await invoicesRes.json();
        if (!invoicesData.data) {
            console.log("Invoices Response Data:", JSON.stringify(invoicesData, null, 2));
            throw new Error("No data field in invoices response");
        }
        console.log(`Fetched ${invoicesData.data.length} invoices.\n`);

        // 5. Generate Invoice HTML
        console.log("5. Generating Invoice HTML...");
        const genRes = await fetch(`${API_URL}/invoices/${schoolInvoiceId}/generate`, {
            method: "POST",
            headers,
            body: JSON.stringify({ notes: "Please pay within 7 days." }),
        });
        const genData = await genRes.json();
        if (!genRes.ok) throw new Error(`Generate invoice failed: ${JSON.stringify(genData)}`);
        if (genData.data?.html) {
            console.log("Generated HTML successfully! Length:", genData.data.html.length);
        }

        console.log("\nAll API tests passed!");
    } catch (error) {
        console.error("Test failed:", error.message);
        process.exit(1);
    }
}

testInvoiceAPI();
