
const API_URL = 'http://localhost:3001/api/v1';

async function seed() {
  console.log('Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@mjm.com',
      password: process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'adminPassword123'
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed:', loginData);
    return;
  }

  const token = loginData.accessToken;
  console.log('Login successful. Seeding products...');

  const products = [
    {
      name: 'أكياس نفايات بريميوم سوداء',
      description: 'أكياس عالية السماكة ومقاومة للتمزق',
      category: 'bags',
      price: 25.00,
      discountPrice: 19.00,
      sku: 'BAG-001',
      totalSold: 150,
      stockQuantity: 100,
      images: ['/categories/bags.png']
    },
    {
      name: 'مياه معدنية طبيعية 330 مل (كرتون)',
      description: 'مياه نقية من ابار جوفية طبيعية',
      category: 'water',
      price: 18.50,
      sku: 'WAT-001',
      totalSold: 300,
      stockQuantity: 100,
      images: ['/categories/water.png']
    },
    {
      name: 'كرتون شحن مقاس كبير 50x50x50',
      description: 'كراتين قوية جداً للشحن والنقل',
      category: 'carton',
      price: 12.00,
      discountPrice: 9.99,
      sku: 'CRT-001',
      totalSold: 85,
      stockQuantity: 100,
      images: ['/categories/carton.png']
    },
    {
      name: 'طقم أكواب ورقية فاخرة 50 قطعة',
      description: 'أكواب ورقية مزدوجة للقهوة والشاي',
      category: 'hospitality',
      price: 45.00,
      sku: 'HSP-001',
      totalSold: 120,
      stockQuantity: 100,
      images: ['/categories/hospitality.png']
    },
    {
        name: 'منتج جديد جداً 1',
        description: 'وصف المنتج الجديد 1',
        category: 'bags',
        price: 100.00,
        sku: 'NEW-001',
        totalSold: 5,
        stockQuantity: 100,
        images: ['/categories/bags.png']
      },
      {
        name: 'منتج جديد جداً 2',
        description: 'وصف المنتج الجديد 2',
        category: 'water',
        price: 50.00,
        sku: 'NEW-002',
        totalSold: 2,
        stockQuantity: 100,
        images: ['/categories/water.png']
      }
  ];

  for (const p of products) {
    console.log(`Creating product: ${p.name}`);
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(p)
    });

    if (!res.ok) {
      console.error(`Failed to create product ${p.sku}:`, await res.json());
    }
  }

  console.log('Seeding finished!');
}

seed();
