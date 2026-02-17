import axios from 'axios';

// შენი გასაღებები (ზუსტად ის, რაც სურათზე იყო)
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

const testTbcConnection = async () => {
    console.log("⏳ ვცდილობ TBC-თან დაკავშირებას კომპიუტერიდან...");
    
    try {
        const params = new URLSearchParams();
        params.append('client_id', TBC_ID);
        params.append('client_secret', TBC_SECRET);
        // params.append('scope', 'tpay'); // ეს დროებით გამორთე, რომ მარტივად ვცადოთ

        console.log("აგზავნის ID-ს:", TBC_ID);

        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': TBC_ID // <--- ეს არის მთავარი!
            }
        });

        console.log("✅✅✅ წარმატება! ტოკენი მიღებულია:");
        console.log(response.data.access_token.substring(0, 50) + "...");

    } catch (error) {
        console.error("❌❌❌ შეცდომა:");
        if (error.response) {
            console.error("სტატუსი:", error.response.status);
            console.error("პასუხი:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
};

testTbcConnection();