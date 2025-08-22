import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
export const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJVc2VyIERldGFpbHMiLCJpc3MiOiJFdmVudCBTY2hlZHVsZXIiLCJpYXQiOjE3NTUxMzk0NzYsImVtYWlsIjoiYWJAZ21haWwuY29tIn0.Whhf_Db0a3WQ6NJiRhMQQIR9JcOouwXr5Ly0_TNUkYE"
const API_URL = "http://10.18.12.179:8080/api";
const BASE_URL = "http://10.18.12.179:8080/api";
const NODE_SERVER_URL = "http://10.18.12.179:3000/api"; // URL Node server chạy

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

  
  // if ((method === "POST" || method === "PUT") && data) {
  //   config.data = data;
  //   console.log('ok3');
  // }
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
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log("Login response:", response.data);

    const token = response.data["jwt-token"] || response.data["token"];
    if (!token) {
      console.warn("⚠️ Không nhận được token từ server");
      return false;
    }

    await AsyncStorage.setItem("jwt-token", token);
    await AsyncStorage.setItem("user-email", email);

    // gọi API lấy info user
    const userResponse = await axios.get(
      `${API_URL}/public/users/email/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("User info:", userResponse.data);

    const cartId = userResponse.data.cart?.cartId || 0;
    await AsyncStorage.setItem("cart-id", String(cartId));
    await AsyncStorage.setItem("user-id", String(userResponse.data.userId));
    await AsyncStorage.setItem("role-id", String(userResponse.data.role?.roleId || 2));

    return true;
  } catch (error: any) {
    console.error("❌ Login error:", error.response?.data || error.message);
    return false;
  }
}


export async function registerUser(name: string, email: string, password: string): Promise<boolean> {
  try {
    const userData = {
      userId: 0,
      firstName: name,
      lastName: "DefaultLast",
      mobileNumber: "0123456789",
      email,
      password,
      roles: [{ roleId: 2, roleName: "USER" }],
      address: {
        addressId: 0,
        street: "Default Street",
        buildingName: "Building A",
        city: "Hanoi",
        state: "HN",
        country: "VN",
        pincode: "100000"
      },
      cart: { cartId: 0, totalPrice: 0, products: [] }
    };

    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.status === 201 || response.status === 200;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
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
    const response = await callApi(`public/carts/${cartId}/product/${productId}`, 'DELETE');
    console.log("Xóa sản phẩm khỏi giỏ thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ:", error);
    throw error;
  }
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
// Trong APIService.ts
export async function verifyOTPAndResetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/verify-otp-reset-password`, {
      email,
      otp,
      newPassword,
    });
    return response.data.success === true;
  } catch (error) {
    console.error("Lỗi xác thực OTP và reset mật khẩu:", error);
    return false;
  }
}
// Trong APIService.ts
export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  try {
    const res = await axios.post(`${NODE_SERVER_URL}/forgot-password`, { email });
    console.log("Forgot password response:", res.data);
    return res.data?.message?.includes("Đã gửi");
  } catch (err) {
    console.error("Lỗi gửi email reset mật khẩu:", err);
    return false;
  }
}

// Gửi OTP đến email để reset mật khẩu
export async function sendResetOTP(email: string): Promise<boolean> {
  try {
    // POST tới backend, không kèm token
    const response = await axios.post(`${API_URL}/send-reset-otp`, { email });

    // Backend trả về { success: true } nếu gửi thành công
    return response.data?.success === true;
  } catch (error: any) {
    console.error("Lỗi gửi OTP reset mật khẩu:", error.response?.data || error.message);
    return false;
  }
}


// Lưu sản phẩm vào giỏ hàng local + server
export const SAVE_TO_CART = async (product: any) => {
  try {
    const cartStr = await AsyncStorage.getItem('cart');
    const cartItems = cartStr ? JSON.parse(cartStr) : [];

    if (!cartItems.find((p: any) => p.productId === product.productId)) {
      const newCart = [...cartItems, { ...product, quantity: 1 }];
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    }

    const cartid = await AsyncStorage.getItem("cart-id");

    if (!cartid || cartid === "0") {
      throw new Error("Cart ID invalid. Please login again.");
    }

    return callApi(`public/carts/${cartid}/products/${product.productId}/quantity/${product.quantity}`, "POST", {
      productId: product.productId,
      quantity: 1
    });

  } catch (error) {
    console.error('Lỗi SAVE_TO_CART:', error);
    throw error;
  }
};
// ======= APIService.ts =======
// ...các import & hàm sẵn có...

// Kiểu dữ liệu gửi lên tạo đơn (tuỳ backend có thể khác, bạn chỉnh tên field nếu cần)
export type OrderItemPayload = {
  productId: number;
  quantity: number;
  price: number;
};

export type OrderPayload = {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderItemPayload[];
  totalAmount: number;
  paymentMethod: "COD" | "VNPAY" | "OTHER";
  status: "PENDING" | "PAID";
};


export const createOrder = async (
  emailId: string,
  cartId: string,
  paymentMethod: string,
  payload: OrderPayload
) => {
  const res = await callApi(`public/users/${emailId}/carts/${cartId}/payments/${paymentMethod}/order`, 'POST');
  console.log("res: ", res);
  
  return res.data;
};

// Tạo order từ cart và gửi lên admin
export async function CREATE_ORDER_FROM_CART(email: string, cartId: number, paymentMethod: string) {
  try {
    // Gọi API POST không cần body (nếu backend chỉ cần params trên URL)
    const res = await POST_ADD(
      `public/users/${encodeURIComponent(email)}/carts/${cartId}/payments/${paymentMethod}/order`,
      {}
    );

    console.log("Tạo đơn hàng thành công:", res.data);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
}
// Thay đổi mật khẩu
export const CHANGE_PASSWORD = async (oldPassword: string, newPassword: string) => {
  try {
    // 1. Lấy userId + token từ AsyncStorage
    const userIdStr = await AsyncStorage.getItem("user-id");
    const token = await AsyncStorage.getItem("jwt-token");

    if (!userIdStr || !token) {
      throw new Error("Bạn chưa đăng nhập hoặc token không hợp lệ.");
    }

    const userId = Number(userIdStr);
    const body = { 'password' : newPassword };

    console.log("=== DEBUG CHANGE_PASSWORD ===");
    console.log("UserId:", userId);
    console.log("Token:", token);
    console.log("Body gửi đi:", body);

    // 2. Gọi API PUT thông qua callApi (giống SAVE_TO_CART)
    const res = await callApi(
      `public/users/${userId}`,
      "PUT",
      body
    );

    console.log("Đổi mật khẩu thành công:", res.data);
    return res.data; // trả về dữ liệu backend
  } catch (error: any) {
    console.error("Lỗi CHANGE_PASSWORD:", error.response?.data || error.message);
    throw error; // để màn hình gọi hàm handle
  }
};



const handleCheckout = async () => {
  try {
    const email = await AsyncStorage.getItem("user-email");
    const cartId = await AsyncStorage.getItem("cart-id");
    if (!email || !cartId) {
      alert("Bạn chưa đăng nhập");
      return;
    }

    const order = await CREATE_ORDER_FROM_CART(email, Number(cartId), "COD"); 
    // "COD" hoặc "VNPAY" tuỳ người dùng chọn

    console.log("Order tạo thành công:", order);

    // 🔥 Lưu order vào AsyncStorage để theo dõi (local)
    const existingOrders = await AsyncStorage.getItem("orders");
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(order);
    await AsyncStorage.setItem("orders", JSON.stringify(orders));

    alert("Đặt hàng thành công!");
  } catch (err) {
    console.error("Lỗi khi thanh toán:", err);
    alert("Thanh toán thất bại");
  }
};
// Xóa sản phẩm khỏi giỏ hàng và đồng bộ UI + AsyncStorage
export async function removeProductFromCartAndRefresh(cartId: number, productId: number) {
  try {
    // 1. Xóa sản phẩm trên server
    await REMOVE_FROM_CART(cartId, productId);

    // 2. Lấy lại giỏ hàng mới từ server
    const updatedCart = await GET_CART(cartId);

    // 3. Lưu giỏ hàng vào AsyncStorage
    if (updatedCart?.items) {
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart.items));
    }

    console.log("Giỏ hàng đã được cập nhật:", updatedCart.items);
    return updatedCart.items;
  } catch (error) {
    console.error("Lỗi khi xóa và cập nhật giỏ hàng:", error);
    throw error;
  }
}

