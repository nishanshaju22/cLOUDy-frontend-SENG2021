import { order_api } from "./axios";

async function loginUser(login, password) {
  try {
    const response = await order_api.post("/v1/auth/login", {
      login,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Something went wrong" };
  }
}

async function registerUser(data) {
  try {
    const response = await order_api.post("/v1/auth/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Something went wrong" };
  }
}

export { loginUser, registerUser };