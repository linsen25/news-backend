import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const { httpAdapter } = this.adapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest<{ body?: Record<string, unknown> }>();
    const mapping = this.map(exception, request.body);
    httpAdapter.reply(
      context.getResponse(),
      {
        statusCode: mapping.status,
        error: mapping.error,
        message: mapping.message,
        code: exception.code,
      },
      mapping.status,
    );
  }

  private map(
    exception: Prisma.PrismaClientKnownRequestError,
    body?: Record<string, unknown>,
  ) {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: this.uniqueMessage(exception.meta?.target, body),
        };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: '关联数据不存在或仍被其他数据使用',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: '请求的数据不存在',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Database Error',
          message: '数据库操作失败',
        };
    }
  }

  private uniqueMessage(
    target: unknown,
    body?: Record<string, unknown>,
  ): string {
    const normalized = JSON.stringify({
      target,
      fields: Object.keys(body ?? {}),
    }).toLowerCase();
    if (normalized.includes('email')) {
      return '该邮箱已经存在';
    }
    if (normalized.includes('slug')) {
      return '文章地址标识已经存在';
    }
    return '数据已存在，请勿重复提交';
  }
}
