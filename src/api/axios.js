import axios from 'axios'

const order_api = axios.create({
	baseURL: 'http://localhost:5001/api',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_ORDER_API_KEY,
	},
});

//REMOVE FOR PROD
order_api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

const invoice_api = axios.create({
	baseURL: 'https://lbhwkjgtm8.execute-api.us-east-1.amazonaws.com',
	headers: {
		'Content-Type': 'application/json',
		"X-API-KEY": "6a818c652b098f5b854ea5b08d88ffc403ebcd67a14b8754b70ec642744d5fcb",
	},
});

invoice_api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

export { order_api, despatch_api, invoice_api }
