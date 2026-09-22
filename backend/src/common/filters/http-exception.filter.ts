import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Global error filter. Preserves Nest's classic shape
 * ({ statusCode, message, error }) so existing clients keep working,
 * and appends stable `code` + `timestamp` + `path` for observability.
 * Unexpected errors are logged server-side and returned as plain 500s
 * (no internal details leak, unlike the old manual 500 builders).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let payload: { statusCode?: number; message?: unknown; error?: string } =
      {};

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique-constraint violations (duplicate email/sku/slug/...) become
      // 409 Conflict everywhere instead of leaking 500s.
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const meta = exception.meta as { target?: unknown } | undefined;
        const fields = Array.isArray(meta?.target)
          ? meta.target.join(', ')
          : undefined;
        payload = {
          message: fields
            ? `القيمة مسجلة مسبقاً (${fields})`
            : 'القيمة مسجلة مسبقاً',
        };
      } else if (exception.code === 'P2025') {
        // Record-not-found races that slipped past existence checks.
        status = HttpStatus.NOT_FOUND;
        payload = { message: 'السجل غير موجود' };
      }
    }

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      exception instanceof HttpException
    ) {
      status = exception.getStatus();
      const body = exception.getResponse();
      payload =
        typeof body === 'string' ? { message: body } : (body as typeof payload);
    } else if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const message =
      payload.message ??
      (status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'حدث خطأ داخلي في الخادم'
        : 'فشل الطلب');

    response.status(status).json({
      statusCode: status,
      message,
      error: payload.error ?? statusText(status),
      code: errorCode(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

function statusText(status: number): string {
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    default:
      return status >= 500 ? 'Internal Server Error' : 'Error';
  }
}

function errorCode(status: number): string {
  if (status === 400) return 'BAD_REQUEST';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  return 'REQUEST_FAILED';
}
