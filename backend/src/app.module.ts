import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OffersModule } from './offers/offers.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { PrintingRequestsModule } from './printing-requests/printing-requests.module';
import { CmsModule } from './cms/cms.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WaterSubscriptionsModule } from './water-subscriptions/water-subscriptions.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { CommonModule } from './common/common.module';
import { AdminCustomersController } from './admin/admin-customers.controller';
import { AdminStaffController } from './admin/admin-staff.controller';
import { CategoriesModule } from './categories/categories.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ContactModule } from './contact/contact.module';
import { BundlesModule } from './bundles/bundles.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    ProductsModule,
    OffersModule,
    CartModule,
    OrdersModule,
    PrintingRequestsModule,
    AnalyticsModule,
    CmsModule,
    AddressesModule,
    WaterSubscriptionsModule,
    SupportTicketsModule,
    CategoriesModule,
    ShipmentsModule,
    InvoicesModule,
    ContactModule,
    BundlesModule,
  ],
  controllers: [AdminCustomersController, AdminStaffController],
  providers: [
    // Global pipeline: shed floods first (throttle), then authenticate
    // everything (unless @Public()), then authorize @Roles(), and normalize
    // every error response.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
