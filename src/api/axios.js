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

export { order_api }
