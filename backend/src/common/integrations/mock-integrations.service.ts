import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockIntegrationsService {
  private readonly logger = new Logger('MockIntegrations');

  /**
   * Mock WhatsApp notification
   */
  async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    this.logger.log(`[WhatsApp Mock] Sending to ${phone}: ${message}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }

  /**
   * Mock Payment Session creation (Moyasar/Tap style)
   */
  async createPaymentSession(amount: number, orderId: string): Promise<string> {
    this.logger.log(
      `[Payment Mock] Creating session for Order ${orderId} - Amount: ${amount} SAR`,
    );
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `https://mock-payment-gateway.com/checkout/${orderId}?amount=${amount}`;
  }

  /**
   * Mock Shipping Label generation (Aramex/Saee style)
   */
  async generateShippingLabel(
    orderId: string,
    address: { city?: string } | null,
  ): Promise<{ trackingNumber: string; labelUrl: string }> {
    this.logger.log(
      `[Shipping Mock] Generating label for Order ${orderId} to ${address?.city ?? 'unknown'}`,
    );
    const trackingNumber = `MJM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      trackingNumber,
      labelUrl: `https://mock-shipping.com/labels/${trackingNumber}.pdf`,
    };
  }
}
