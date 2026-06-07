import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Nếu response đã được gửi rồi thì bỏ qua
    if (res.headersSent) {
      this.logger.error(
        `Exception after headers sent on ${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? ((exception.getResponse() as Record<string, unknown>)?.message ??
          exception.message)
        : 'Internal server error';

    this.logger.error(
      `Exception caught on ${req.method} ${req.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
