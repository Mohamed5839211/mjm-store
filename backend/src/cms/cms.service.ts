import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  async getHomepage() {
    const content = await this.prisma.cmsContent.findMany({
      where: {
        key: {
          in: [
            'hero_banner',
            'homepage_slider',
            'maintenance_mode',
            'seasonal_offer',
          ],
        },
      },
    });
    const result: Record<string, unknown> = {};
    content.forEach((c) => {
      result[c.key] = c.value;
    });
    return result;
  }

  async updateHomepage(data: Record<string, unknown>) {
    const updates = Object.entries(data);
    for (const [key, value] of updates) {
      await this.prisma.cmsContent.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue },
      });
    }
    return this.getHomepage();
  }

  async getPage(slug: string) {
    const page = await this.prisma.cmsContent.findUnique({
      where: { key: `page_${slug}` },
    });
    return page?.value || { title: '', content: '' };
  }

  async updatePage(slug: string, data: Record<string, unknown>) {
    return this.prisma.cmsContent.upsert({
      where: { key: `page_${slug}` },
      update: { value: data as Prisma.InputJsonValue },
      create: { key: `page_${slug}`, value: data as Prisma.InputJsonValue },
    });
  }

  async getSettings() {
    const settings = await this.prisma.cmsContent.findUnique({
      where: { key: 'global_settings' },
    });
    const defaults = {
      storeName: 'MJM Store',
      maintenanceMode: false,
      orderEmails: true,
      vatRate: 15,
      currency: 'SAR',
      lowStockThreshold: 10,
      freeShippingEnabled: true,
      freeShippingThreshold: 299,
      announcements: [
        'شحن مجاني لجميع الطلبات فوق 299 ريال داخل المملكة',
        'خصومات تصل إلى 30% على منتجات الطباعة المخصصة',
        'توصيل سريع خلال 24 ساعة في مدينة الرياض',
      ],
      announcementSpeed: 20,
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      socialLinks: {
        snapchat: '',
        instagram: '',
        twitter: '',
        facebook: '',
        whatsapp: '',
        tiktok: '',
        linkedin: '',
      },
    };

    if (!settings) return defaults;

    // Merge stored values with defaults to handle new fields
    return {
      ...defaults,
      ...(settings.value as object),
    };
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.prisma.cmsContent.upsert({
      where: { key: 'global_settings' },
      update: { value: data as Prisma.InputJsonValue },
      create: { key: 'global_settings', value: data as Prisma.InputJsonValue },
    });
  }
}
