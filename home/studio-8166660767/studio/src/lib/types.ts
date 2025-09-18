export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  unitName: string;
  category?: string;
  description: string;
  properties: string;
  images: string[];
};

export type Role = 'Admin' | 'Cashier';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string; // Stored as ISO string
};

export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unitName: string;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number | null;
  total: number;
  date: string; // Stored as ISO string
  cashierId: string;
  memberId?: string | null;
  memberName?: string | null;
  memberName_lowercase?: string | null;
  remark?: string | null;
};

export type Unit = {
    id: string;
    name: string;
    createdAt: string;
}
