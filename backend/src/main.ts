import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const config = getAppConfig();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Static file serving for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  // helmet (v8) does not emit Permissions-Policy by default — set it
  // explicitly to match the frontend policy (least privilege: no
  // camera/microphone/geolocation for this store).
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    next();
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Disable caching globally to prevent edge CDNs from crossing user sessions
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
  });

  // CORS — strict allowlist in every environment.
  //
  // Sources of truth (no reflection of the incoming Origin, no wildcard
  // together with credentials — ever):
  //   1. ALLOWED_ORIGINS env (comma-separated, e.g. production domains).
  //   2. FRONTEND_URL env (validated URL by app.config).
  //   3. Loopback defaults, development/test ONLY (local dev + tooling).
  //
  // Behavior:
  //   - Listed origin            -> allowed (with credentials).
  //   - Unlisted origin          -> rejected ("Not allowed by CORS").
  //   - No Origin header at all  -> allowed (non-browser clients:
  //                                 curl, mobile apps, server-to-server).
  //   - production               -> loopback defaults are NOT added.
  const parseOrigins = (raw: string | undefined): string[] =>
    (raw ?? '')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter((s) => s.length > 0);

  const DEV_LOOPBACK_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ];

  const configuredOrigins = [
    ...parseOrigins(process.env.ALLOWED_ORIGINS ?? config.ALLOWED_ORIGINS),
    config.FRONTEND_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter((origin): origin is string => !!origin);

  const allowedOrigins =
    config.NODE_ENV === 'production'
      ? [...new Set(configuredOrigins)]
      : [...new Set([...DEV_LOOPBACK_ORIGINS, ...configuredOrigins])];
  logger.log(
    `CORS allowlist (${config.NODE_ENV}): ${allowedOrigins.join(', ') || '(empty)'}`,
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Reject WITHOUT an exception: throwing here would turn the CORS
        // rejection into a 500 (user input must never cause a 5xx). With
        // `false` no ACAO headers are emitted, so browsers block the read
        // while server-side guards (JWT/Roles) keep enforcing access.
        logger.warn(`CORS: rejected origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });

  // Cookie parser (reads HttpOnly session/refresh cookies; Bearer stays primary)
  app.use(cookieParser());

  // NOTE: CSRF (csurf) stays removed: the API authenticates primarily via JWT
  // Bearer tokens, and the HttpOnly cookies we set are SameSite=Strict, which
  // neutralizes cross-site request forgery for cookie-based flows.

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation.
  //
  // POLICY (documented decision): the interactive docs + OpenAPI JSON are a
  // development/test convenience. They are served when NODE_ENV is anything
  // except "production", or when DOCS_ENABLED=true is set explicitly (e.g. a
  // protected staging host). In production they are NOT mounted at all, so
  // /api/docs and /api/docs-json return 404 and cannot be used to enumerate
  // the API or bypass authentication (every route keeps its own guards).
  const docsEnabled =
    process.env.DOCS_ENABLED === 'true' ||
    config.DOCS_ENABLED === 'true' ||
    config.NODE_ENV !== 'production';
  if (!docsEnabled) {
    logger.warn(
      'Swagger docs are disabled (production without DOCS_ENABLED=true)',
    );
  } else {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MJM Store API')
      .setDescription('واجهات برمجة متجر MJM للتغليف والمستلزمات')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('المصادقة - Auth')
      .addTag('المنتجات - Products')
      .addTag('الفئات - Categories')
      .addTag('البكجات - Bundles')
      .addTag('العروض - Offers')
      .addTag('السلة - Cart')
      .addTag('الطلبات - Orders')
      .addTag('العناوين - Addresses')
      .addTag('طلبات الطباعة - Printing Requests')
      .addTag('إدارة المحتوى - CMS')
      .addTag('التحليلات - Analytics')
      .addTag('الشحن - Shipments')
      .addTag('الفواتير - Invoices')
      .addTag('التواصل - Contact')
      .addTag('الدعم - Support')
      .addTag('الوسائط - Media')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(config.PORT);
  logger.log(`MJM Store API running on http://localhost:${config.PORT}`);
  if (docsEnabled) {
    logger.log(`Swagger Docs: http://localhost:${config.PORT}/api/docs`);
  }
}

void bootstrap();
