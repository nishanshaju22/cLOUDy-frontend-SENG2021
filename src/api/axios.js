import axios from 'axios'

const order_api = axios.create({
	baseURL: '/api-proxy',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_ORDER_API_KEY,
	}
});

export { order_api }
