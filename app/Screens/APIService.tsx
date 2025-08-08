import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:8080/api";

// Lấy token từ AsyncStorage
async function getToken() {
  return await AsyncStorage.getItem('jwt-token');
}

// Gọi API chung
export async function callApi(endpoint: string, method: string, data: any = null): Promise<AxiosResponse<any>> {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJVc2VyIERldGFpbHMiLCJpc3MiOiJFdmVudCBTY2hlZHVsZXIiLCJpYXQiOjE3NTQ1NzY2NDYsImVtYWlsIjoiYWJAZ21haWwuY29tIn0.pnorLOGZOAvEYH5OtNvPhHUhOyaj4CwrxnYwQMQGVAE";

  return axios({
    method,
    url: `${API_URL}/${endpoint}`,
    data,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
}

// GET tất cả
export function GET_ALL(endpoint: string): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "GET");
}

// GET theo trang
export function GET_PAGE(endpoint: string, page: number = 0, size: number = 10, categoryId: string | null = null): Promise<AxiosResponse<any>> {
  let url = `${endpoint}?page=${page}&size=${size}`;
  if (categoryId !== null) {
    url += `&categoryId=${categoryId}`;
  }
  return callApi(url, "GET");
}

// GET theo ID
export function GET_ID(endpoint: string, id: string | number): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "GET");
}

// POST thêm mới
export function POST_ADD(endpoint: string, data: any): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "POST", data);
}

// PUT chỉnh sửa
export function PUT_EDIT(endpoint: string, data: any): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "PUT", data);
}

// DELETE theo ID
export function DELETE_ID(endpoint: string, id: string | number): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "DELETE");
}

// GET ảnh
export function GET_IMG(endpoint: string, imgName: string): string {
  return `${API_URL}/public/${endpoint}/image/${imgName}`;
}

// Đăng nhập
export async function POST_LOGIN(email: string, password: string): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const token = response.data["jwt-token"];

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("user-email", email);
      console.log("user-email", email);

      const userResponse = await GET_ID(`public/users/email`, encodeURIComponent(email));
      const cartId = userResponse.data.cart.cartId;
      await AsyncStorage.setItem("cart-id", String(cartId));

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}
// Lấy tất cả sản phẩm (public)
export const getAllProducts = async () => {
  try {
    const response = await GET_ALL('public/products');
    console.log('Lấy tất cả sản phẩm thành công:', response);
    return response.data.content;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (productId: number) => {
  try {
    const response = await GET_ID('public/products', productId);
    console.log('Lấy sản phẩm theo ID thành công:', response);
    return response.data;
  } catch (error) {
    throw error;
  }
};
