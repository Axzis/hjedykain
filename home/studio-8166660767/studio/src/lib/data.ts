import type { Product, User, Role, Member } from './types';

// This data is for seeding purposes only.
// It will be overwritten by your own data once you start using the app.
export const products: Omit<Product, 'id'>[] = [
  {
    name: 'Royal Blue Silk Charmeuse',
    price: 350000,
    stock: 120,
    unitId: 'meter', // This should match an ID in the 'units' collection after seeding
    unitName: 'meter',
    description: 'A luxurious silk with a beautiful sheen and fluid drape, perfect for elegant evening wear and bridal gowns. Its smooth finish glides against the skin, offering unparalleled comfort and a touch of glamour.',
    properties: '100% Sutra, berat 19mm, lebar 114 cm, tenun Satin',
    images: [
      'https://i.etsystatic.com/8767142/r/il/925234/5531532530/il_794xN.5531532530_ji8t.jpg',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
  {
    name: 'Classic Indigo Denim',
    price: 180000,
    stock: 500,
    unitId: 'meter',
    unitName: 'meter',
    description: 'Durable and timeless, this 12oz denim is the quintessential fabric for jeans, jackets, and skirts. It will soften and fade beautifully with wear, creating a personalized look over time.',
    properties: '100% Katun, berat 12 oz, lebar 147 cm, tenun Twill 3x1',
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
];

export const users: User[] = [
    { id: 'user-01', name: 'Admin User', email: 'admin@edykain.com', role: 'Admin', password: '12345678' },
    { id: 'user-02', name: 'Cashier User', email: 'cashier@edykain.com', role: 'Cashier', password: '12345678' }
];

export const members: Member[] = [
    { id: 'mem-001', name: 'Alice Johnson', email: 'alice.j@email.com', phone: '6281234567890', joinDate: '2023-01-15T10:00:00Z' },
    { id: 'mem-002', name: 'Bob Williams', email: 'bob.w@email.com', phone: '6281234567891', joinDate: '2023-02-20T11:30:00Z' },
    { id: 'mem-003', name: 'Charlie Brown', email: 'charlie.b@email.com', phone: '6281234567892', joinDate: '2023-03-10T14:00:00Z' },
];

export const units = [
    { id: 'meter', name: 'meter' },
    { id: 'pcs', name: 'pcs' },
    { id: 'roll', name: 'roll' },
]
