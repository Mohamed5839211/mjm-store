import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: puppeteer.Browser | null = null;

  async onModuleInit() {
    this.logger.log('Initializing Puppeteer browser');
    await this.initBrowser();
  }

  async onModuleDestroy() {
    this.logger.log('Closing Puppeteer browser');
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
      this.logger.log('Puppeteer browser launched successfully');
    } catch (error) {
      this.logger.error(
        'Failed to launch Puppeteer browser',
        (error as Error)?.stack,
      );
    }
  }

  async generatePdf(html: string): Promise<Buffer> {
    // Ensure browser is open
    if (!this.browser || !this.browser.connected) {
      this.logger.warn('Browser disconnected. Re-initializing...');
      await this.initBrowser();
    }
    if (!this.browser) {
      throw new Error('PDF engine unavailable');
    }

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      });
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('PDF generation failed', (error as Error)?.stack);
      throw error;
    } finally {
      await page.close();
    }
  }
}
