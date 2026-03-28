import axios from 'axios'

const api = axios.create({
	baseURL: 'http://localhost:5001/api',
	headers: {
		'Content-Type': 'application/json',
		"api-key": process.env.NEXT_PUBLIC_API_KEY,
	},
	withCredentials: true
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error.response || error.message);
		return Promise.reject(error);
	}
);

export default api
