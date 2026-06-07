import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Types } from 'mongoose';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function toPlain(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Date → ISO string
  if (value instanceof Date) {
    return value.toISOString();
  }

  // MongoDB ObjectId → string
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  // Có _bsontype = ObjectId (sau lean())
  if (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>)._bsontype === 'ObjectId' &&
    typeof (value as Record<string, unknown>).toString === 'function'
  ) {
    return (value as { toString(): string }).toString();
  }

  // Mongoose Document → plain object
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).toObject === 'function'
  ) {
    return toPlain((value as { toObject: () => unknown }).toObject());
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(toPlain);
  }

  // Plain object
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      result[key] = toPlain((value as Record<string, unknown>)[key]);
    }
    return result;
  }

  return value;
}

function isPaginated(value: unknown): value is {
  data: unknown;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
} {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    'data' in obj &&
    'total' in obj &&
    'page' in obj &&
    'limit' in obj &&
    'totalPages' in obj
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<unknown>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((raw: unknown) => {
        const converted = toPlain(raw);

        // Paginated response — giữ nguyên cấu trúc { data, total, page, ... }
        if (isPaginated(converted)) {
          return {
            success: true,
            data: converted,
            ...(converted.message ? { message: converted.message } : {}),
          };
        }

        // Response có dạng { data, message }
        if (
          typeof converted === 'object' &&
          converted !== null &&
          'data' in (converted as object)
        ) {
          const obj = converted as Record<string, unknown>;
          return {
            success: true,
            data: obj.data,
            ...(obj.message ? { message: obj.message as string } : {}),
          };
        }

        // Response thông thường
        return {
          success: true,
          data: converted,
        };
      }),
    );
  }
}
