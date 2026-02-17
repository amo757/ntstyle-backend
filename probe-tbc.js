import axios from 'axios';
import https from 'https';

// შენი გასაღებები
const CLIENT_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const CLIENT_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

// SSL სერტიფიკატის იგნორირება (Sandbox-ისთვის)
const agent = new https.Agent({ rejectUnauthorized: false });

async function tryConnection(envName, url) {
    console.log(`\n--- 🔎 ტესტირება: ${envName} ---`);
    console.log(`URL: ${url}`);

    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('scope', 'tpay'); // ვცადოთ scope-ით

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': CLIENT_ID
            },
            httpsAgent: agent
        });
        console.log(`✅✅✅ წარმატება! (${envName})`);
        console.log(`Token: ${response.data.access_token.substring(0, 15)}...`);
        return true;
    } catch (error) {
        console.log(`❌ ჩავარდა (${envName})`);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Error: ${error.response.data.title || error.response.data.error}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
        return false;
    }
}

async function runTests() {
    // ტესტი 1: Live გარემო (რასაც ახლა ვცდილობთ)
    await tryConnection('LIVE (Production)', 'https://api.tbcbank.ge/v1/tpay/access-token');

    // ტესტი 2: Sandbox გარემო (იქნებ გასაღებები სატესტოა?)
    await tryConnection('SANDBOX (Test)', 'https://sandbox.api.tbcbank.ge/v1/tpay/access-token');
}

runTests();