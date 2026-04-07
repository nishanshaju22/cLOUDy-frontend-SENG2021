import axios from 'axios'

const order_api = axios.create({
	baseURL: 'http://cLOUDy-1831309437.us-east-1.elb.amazonaws.com/api',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_ORDER_API_KEY,
	},
});

export { order_api }
