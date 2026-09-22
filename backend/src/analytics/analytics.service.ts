import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesStats(range: string, from?: string, to?: string) {
    const startDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    // Revenue counts every non-cancelled order: no payment-completion flow
    // exists yet (mock gateway), so `paid`-only stats would stay at zero.
    const orders = await this.prisma.order.findMany({
      where: {
        status: { not: 'cancelled' },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by calendar day (groupBy on a timestamp would split same-day rows).
    const byDay = new Map<string, number>();
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) ?? 0) + Number(order.totalAmount || 0));
    }
    const formattedData = [...byDay.entries()]
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const totalSales = formattedData.reduce((sum, item) => sum + item.sales, 0);

    return {
      range,
      data: formattedData,
      totalSales,
    };
  }

  async getTopProducts(limit: number) {
    return this.prisma.product.findMany({
      take: limit,
      orderBy: { totalSold: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        totalSold: true,
        category: true,
      },
    });
  }

  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Helper for counts
    const getCount = async <W>(
      model: { count: (args: { where: W }) => Promise<number> },
      where: W,
    ) => await model.count({ where });

    // Helper for revenue (non-cancelled; see getSalesStats rationale)
    const getRevenue = async (where: object) => {
      const result = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { ...where, status: { not: 'cancelled' } },
      });
      return Number(result._sum.totalAmount || 0);
    };

    // Current period stats (last 30 days)
    const [currOrders, currCustomers, currB2B, currRevenue] = await Promise.all(
      [
        getCount(this.prisma.order, { createdAt: { gte: thirtyDaysAgo } }),
        getCount(this.prisma.customer, { createdAt: { gte: thirtyDaysAgo } }),
        getCount(this.prisma.printingRequest, {
          createdAt: { gte: thirtyDaysAgo },
        }),
        getRevenue({ createdAt: { gte: thirtyDaysAgo } }),
      ],
    );

    // Previous period stats (30-60 days ago)
    const [prevOrders, prevCustomers, prevB2B, prevRevenue] = await Promise.all(
      [
        getCount(this.prisma.order, {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        }),
        getCount(this.prisma.customer, {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        }),
        getCount(this.prisma.printingRequest, {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        }),
        getRevenue({ createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }),
      ],
    );

    // Total stats for display
    const totalRevenueResult = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'cancelled' } },
    });
    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);
    const totalOrders = await this.prisma.order.count();
    const totalCustomers = await this.prisma.customer.count();
    const totalB2B = await this.prisma.printingRequest.count();

    // Calculate trends
    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0)
        return { trend: curr > 0 ? `+100%` : `0%`, positive: curr > 0 };
      const percent = ((curr - prev) / prev) * 100;
      return {
        trend: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
        positive: percent >= 0,
      };
    };

    const revenueTrend = calculateTrend(currRevenue, prevRevenue);
    const ordersTrend = calculateTrend(currOrders, prevOrders);
    const customersTrend = calculateTrend(currCustomers, prevCustomers);
    const b2bTrend = calculateTrend(currB2B, prevB2B);

    // Recent activity
    const [recentOrders, recentUsers, recentB2B] = await Promise.all([
      this.prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        // Never leak customer secrets (passwordHash) to dashboard payloads.
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.customer.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.printingRequest.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const recentActivity = [
      ...recentOrders.map((o) => ({
        id: `ord-${o.id}`,
        type: 'order',
        message: `طلب جديد #${o.id} - ${o.customer?.name || 'عميل'}`,
        time: o.createdAt,
      })),
      ...recentUsers.map((u) => ({
        id: `usr-${u.id}`,
        type: 'user',
        message: `تسجيل عميل جديد: ${u.name}`,
        time: u.createdAt,
      })),
      ...recentB2B.map((b) => ({
        id: `b2b-${b.id}`,
        type: 'b2b',
        message: `طلب طباعة جديد من ${b.businessName}`,
        time: b.createdAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);

    return {
      stats: [
        {
          label: 'إجمالي المبيعات',
          value: `${totalRevenue.toLocaleString()} ر.س`,
          ...revenueTrend,
        },
        {
          label: 'الطلبات',
          value: totalOrders.toLocaleString(),
          ...ordersTrend,
        },
        {
          label: 'العملاء',
          value: totalCustomers.toLocaleString(),
          ...customersTrend,
        },
        { label: 'طلبات B2B', value: totalB2B.toLocaleString(), ...b2bTrend },
      ],
      recentActivity,
    };
  }
}
