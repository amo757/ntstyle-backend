// test-key.js
import axios from 'axios';

// 👇 აქ ჩაწერე შენი გასაღებები
const CLIENT_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy'; 
const CLIENT_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

async function testToken() {
    console.log("🚀 ვტესტავთ კავშირს...");

    try {
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);

        // ვცადოთ LIVE მისამართი
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': CLIENT_ID
            }
        });

        console.log("✅✅✅ წარმატება! ტოკენი აღებულია:");
        console.log(response.data);

    } catch (error) {
        console.log("❌ შეცდომა:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

testToken();