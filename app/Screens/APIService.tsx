import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Alert } from 'react-native';

const API_URL = "http://localhost:8080/api";
export interface Role {
  roleId: number;
  roleName: string;
}

export interface Address {
  addressId: number;
  street: string;
  buildingName: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface RegisterUserData {
  userId: number;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  roles: Role[];
  address: Address;
}
// Lấy token từ AsyncStorage
async function getToken() {
  return await AsyncStorage.getItem('jwt-token');
}

// Gọi API chung
export async function callApi(endpoint: string, method: string, data: any = null): Promise<AxiosResponse<any>> {
  // Lấy token thật sự từ AsyncStorage để dùng
  const token = await getToken();

  const config: any = {
    method,
    url: `${API_URL}/${endpoint}`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };

  if ((method === "POST" || method === "PUT") && data) {
    config.data = data;
  }

  // Gửi data với DELETE nếu có
  if (method === "DELETE" && data) {
    config.data = data;
  }

  return axios(config);
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
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email: email.trim(),
        password: password,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const token = response.data["jwt-token"] || response.data["token"];
    const cartId = response.data["cartId"] || response.data["cart"]?.cartId;

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("user-email", email);
      if (cartId) {
        await AsyncStorage.setItem("cart-id", cartId.toString());
      }
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Login error:", error);
    return false;
  }
}


// Đăng ký
export async function registerUser(userData: RegisterUserData): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    const token = response.data["jwt-token"];

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("user-email", userData.email);
      return true;
    }
    return false;
  } catch (error: any) {
    if (error.response) {
      console.error("Signup error response data:", error.response.data);
      console.error("Signup error response status:", error.response.status);
    } else {
      console.error("Signup error:", error.message);
    }
    return false;
  }
}

export async function logout() {
  try {
    await AsyncStorage.removeItem('jwt-token');
    await AsyncStorage.removeItem('user-email');
    await AsyncStorage.removeItem('cart-id'); // Xóa luôn cart-id khi logout
    return true;
  } catch (error) {
    console.error('Lỗi khi logout:', error);
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
// Thêm sản phẩm vào giỏ hàng
export async function ADD_TO_CART(cartId: number, productId: number, quantity: number = 1) {
  try {
    const data = { productId, quantity };
    const response = await POST_ADD(`cart/${cartId}/items`, data);
    console.log("Thêm sản phẩm vào giỏ thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ:", error);
    throw error;
  }
}

// Cập nhật số lượng sản phẩm trong giỏ
export async function UPDATE_CART_ITEM(cartId: number, productId: number, quantity: number) {
  try {
    const data = { productId, quantity };
    const response = await PUT_EDIT(`cart/${cartId}/items`, data);
    console.log("Cập nhật số lượng sản phẩm trong giỏ thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    throw error;
  }
}
// Lấy giỏ hàng của người dùng
export async function GET_CART(cartId: number) {
  try {
    const response = await GET_ID("cart", cartId);
    console.log("Lấy giỏ hàng thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    throw error;
  }
}
// Cập nhật giỏ hàng lên server
export async function UPDATE_CART(cartId: number, cartData: any) {
  try {
    const response = await PUT_EDIT(`cart/${cartId}`, cartData);
    console.log("Cập nhật giỏ hàng thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    throw error;
  }
}

export async function REMOVE_FROM_CART(cartId: number, productId: number) {
  try {
    // Gửi DELETE request với productId trong URL (không gửi body)
    const response = await callApi(`cart/${cartId}/items/${productId}`, 'DELETE');
    console.log("Xóa sản phẩm khỏi giỏ thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ:", error);
    throw error;
  }
}

async function addToCartAndUpdate(cartId: number, productId: number, quantity: number = 1) {
  await ADD_TO_CART(cartId, productId, quantity);
  const updatedCart = await GET_CART(cartId);
  return updatedCart;
}

async function removeFromCartAndUpdate(cartId: number, productId: number) {
  await REMOVE_FROM_CART(cartId, productId);
  const updatedCart = await GET_CART(cartId);
  return updatedCart;
}

// Cập nhật giỏ hàng
async function updateCartAndRefresh(cartId: number, productId: number, quantity: number) {
  await UPDATE_CART_ITEM(cartId, productId, quantity);
  const updatedCart = await GET_CART(cartId);
  return updatedCart;
}


export async function addProductToCart(productId: number, quantity: number = 1) {
  try {
    const cartIdStr = await AsyncStorage.getItem('cart-id');
    if (!cartIdStr) {
      alert('Bạn chưa đăng nhập hoặc chưa có giỏ hàng');
      return;
    }
    const cartId = parseInt(cartIdStr);

    // Gọi API thêm sản phẩm
    await ADD_TO_CART(cartId, productId, quantity);

    // Lấy giỏ hàng mới nhất và lưu local
    const updatedCart = await GET_CART(cartId);
    if (updatedCart?.items) {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart.items));
    }

    alert('Đã thêm sản phẩm vào giỏ hàng');
  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào giỏ:', error);
    alert('Thêm sản phẩm thất bại');
  }
}