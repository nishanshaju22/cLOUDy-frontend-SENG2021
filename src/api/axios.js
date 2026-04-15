import axios from 'axios'

const order_api = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_ORDER_API_KEY,
	},
});

order_api.interceptors.response.use(response => {
	console.log(`✅ [Response] ${response.status} ${response.config.url}`);
	return response;
}, error => {
	console.error(`❌ [API Error] ${error.response?.status}:`, error.message);
	return Promise.reject(error);
});

export { order_api }
