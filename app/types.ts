// types.ts
export type CartItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: any;
};

export type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  Checkout: { cartItems: CartItem[] };
  OrderSuccess: undefined;
};
