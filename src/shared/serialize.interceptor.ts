import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<T>) {}

  public intercept(_context: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: unknown): T => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

export function Serialize<T>(dto: ClassConstructor<T>): MethodDecorator {
  return UseInterceptors(new SerializeInterceptor(dto));
}
