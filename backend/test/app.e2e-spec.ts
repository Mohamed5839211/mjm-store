import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Isolated database for end-to-end runs (never touches mjm_store).
process.env.DATABASE_URL = 'mysql://root@localhost:3306/mjm_store_test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'mjm_super_secret_jwt_key_2026';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'mjm_super_secret_jwt_refresh_key_2026';

const API = '/api/v1';

describe('MJM Store API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customerToken = '';
  let customerRefreshCookie = '';
  let orderId = 0;
  const suffix = Date.now().toString(36);
  const customerEmail = `e2e-${suffix}@mjm.test`;
  const customerPhone = `059${suffix.slice(-7).padEnd(7, '0')}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Minimal catalog seed for checkout flows.
    await prisma.product.create({
      data: {
        name: `E2E أكياس اختبار ${suffix}`,
        price: 28,
        stockQuantity: 100,
        sku: `E2E-${suffix}`,
        searchIndex: `e2e اكياس اختبار ${suffix}`,
      },
    });
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('registers a customer and sets session cookies', async () => {
    interface RegisterBody {
      accessToken: string;
      refreshToken: string;
      user: { email: string };
    }
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/register`)
      .send({
        name: 'E2E User',
        email: customerEmail,
        phone: customerPhone,
        password: 'TestPass123',
      })
      .expect(201);

    const body = res.body as RegisterBody;
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(body.user.email).toBe(customerEmail);
    const setCookies = res.headers['set-cookie'] as unknown as string[];
    expect(setCookies.join(';')).toContain('mjm_access=');
    expect(setCookies.join(';')).toContain('mjm_refresh=');
    customerToken = body.accessToken;
    customerRefreshCookie =
      setCookies.find((c) => c.startsWith('mjm_refresh=')) ?? '';
  });

  it('logs the customer in', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({ emailOrPhone: customerEmail, password: 'TestPass123' })
      .expect(201);
    const body = res.body as { accessToken: string };
    expect(body.accessToken).toBeDefined();
    customerToken = body.accessToken;
  });

  it('refreshes tokens from the HttpOnly cookie', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/refresh`)
      .set('Cookie', [customerRefreshCookie])
      .send({})
      .expect(201);
    const body = res.body as { accessToken: string };
    expect(body.accessToken).toBeDefined();
    customerToken = body.accessToken;
  });

  it('serves the public catalog without a token', async () => {
    await request(app.getHttpServer()).get(`${API}/products`).expect(200);
    // Hamza-insensitive search hits the seeded أكياس product.
    const res = await request(app.getHttpServer())
      .get(`${API}/products?search=اكياس`)
      .expect(200);
    const body = res.body as { items: unknown[] };
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('blocks product creation for anonymous and customer callers', async () => {
    await request(app.getHttpServer())
      .post(`${API}/products`)
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'x', price: 1, stockQuantity: 1, sku: `x-${suffix}` })
      .expect(403);
  });

  it('blocks the admin orders list for customers', async () => {
    await request(app.getHttpServer())
      .get(`${API}/admin/orders`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('checks out with client items priced server-side', async () => {
    const product = await prisma.product.findFirst({
      where: { sku: `E2E-${suffix}` },
    });
    expect(product).toBeDefined();

    const addressRes = await request(app.getHttpServer())
      .post(`${API}/addresses`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        city: 'الرياض',
        district: 'النرجس',
        street: 'ش Test',
        buildingNo: '1',
      })
      .expect(201);
    const addressBody = addressRes.body as { id: number };

    const res = await request(app.getHttpServer())
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddressId: addressBody.id,
        paymentMethod: 'cod',
        items: [{ productId: product!.id, quantity: 2 }],
      })
      .expect(201);

    const checkoutBody = res.body as {
      orderId: number;
      totalAmount: number | string;
    };
    expect(checkoutBody.orderId).toBeDefined();
    expect(Number(checkoutBody.totalAmount)).toBeGreaterThan(0);
    orderId = checkoutBody.orderId;

    const stored = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    expect(stored?.items).toHaveLength(1);
    expect(stored?.items[0].quantity).toBe(2);
    expect(Number(stored?.items[0].unitPrice)).toBe(28);
  });

  it('rejects checkout with unknown products', async () => {
    const address = await prisma.address.findFirst();
    await request(app.getHttpServer())
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddressId: address!.id,
        paymentMethod: 'cod',
        items: [{ productId: 999999, quantity: 1 }],
      })
      .expect(404);
  });

  it('cleans up its own data', async () => {
    const customer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    });
    if (customer) {
      const orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        select: { id: true },
      });
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length > 0) {
        await prisma.shipment.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await prisma.invoice.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }
      await prisma.address.deleteMany({ where: { customerId: customer.id } });
      await prisma.cartItem.deleteMany({
        where: { cart: { customerId: customer.id } },
      });
      await prisma.cart.deleteMany({ where: { customerId: customer.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
    }
    await prisma.product.deleteMany({ where: { sku: `E2E-${suffix}` } });
  });
});
