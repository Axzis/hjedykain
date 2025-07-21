
import type { Product, User, Role, Member } from './types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Royal Blue Silk Charmeuse',
    price: 350000,
    stock: 120,
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
    id: 'prod-002',
    name: 'Heather Grey Merino Wool Jersey',
    price: 285000,
    stock: 250,
    description: 'A soft, breathable, and temperature-regulating knit fabric. Ideal for comfortable yet stylish base layers, t-shirts, and loungewear. Naturally moisture-wicking and odor-resistant.',
    properties: '100% Wol Merino, 150 GSM, lebar 152 cm, rajut Jersey',
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'prod-003',
    name: 'Classic Indigo Denim',
    price: 180000,
    stock: 500,
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
  {
    id: 'prod-004',
    name: 'Oatmeal Linen Blend',
    price: 220000,
    stock: 300,
    description: 'A breezy and lightweight blend of linen and rayon, offering the classic texture of linen with improved wrinkle resistance and a softer hand. Perfect for summer dresses, blouses, and trousers.',
    properties: '55% Linen / 45% Rayon, berat 5.3 oz, lebar 137 cm, tenun Polos',
    images: [
      'https://i.etsystatic.com/8767142/r/il/925234/5531532530/il_794xN.5531532530_ji8t.jpg',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
   {
    id: 'prod-005',
    name: 'Scarlet Red Ponte de Roma',
    price: 167500,
    stock: 180,
    description: 'A stable, medium-weight double-knit fabric with a slight horizontal stretch. Its firm structure makes it excellent for creating structured yet comfortable garments like blazers, pencil skirts, and fitted dresses.',
    properties: 'Campuran Rayon/Nilon/Spandeks, 320 GSM, lebar 150 cm, rajut Ganda',
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'prod-006',
    name: 'Black Floral Cotton Lawn',
    price: 150000,
    stock: 220,
    description: 'A lightweight, finely woven cotton fabric with a crisp, smooth hand. The delicate floral print on a black background makes it a beautiful choice for shirts, dresses, and linings.',
    properties: '100% Katun, 70 GSM, lebar 142 cm, tenun Polos',
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'prod-007',
    name: 'Khaki Cotton Twill',
    price: 142500,
    stock: 400,
    description: 'A versatile and sturdy fabric known for its diagonal weave. This medium-weight twill is a go-to for casual trousers, shorts, and light jackets, offering both durability and comfort.',
    properties: '97% Katun / 3% Spandeks, berat 8 oz, lebar 145 cm, tenun Twill',
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'prod-008',
    name: 'Emerald Green Velvet',
    price: 420000,
    stock: 90,
    description: 'Plush, opulent, and incredibly soft, this stretch velvet catches the light beautifully. Its rich emerald hue is perfect for show-stopping holiday dresses, formal wear, and luxurious decorative pillows.',
    properties: '90% Poliester / 10% Spandeks, 350 GSM, lebar 152 cm, tumpukan Rajutan',
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
    { id: 'mem-004', name: 'Diana Miller', email: 'diana.m@email.com', phone: '6281234567893', joinDate: '2023-04-05T16:45:00Z' },
    { id: 'mem-005', name: 'Ethan Davis', email: 'ethan.d@email.com', phone: '6281234567894', joinDate: '2023-05-22T09:15:00Z' }
];
