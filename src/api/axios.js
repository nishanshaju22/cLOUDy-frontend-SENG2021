import axios from 'axios'

const order_api = axios.create({
	baseURL: 'http://localhost:5001/api',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_ORDER_API_KEY,
	},
});

order_api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

const despatch_api = axios.create({
	baseURL: 'https://devex.cloud.tcore.network/api',
	headers: {
		'Content-Type': 'application/json',
		"Api-Key": "9cfa8204f71f09d4bc45001e1cf14417f02be7718d142231e8e880add4492b70",
	},
	withCredentials: true
});

despatch_api.interceptors.response.use(
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
