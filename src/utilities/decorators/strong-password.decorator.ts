import { applyDecorators } from '@nestjs/common';
import { IsStrongPassword } from 'class-validator';
import { Transform } from 'class-transformer';

export function StrongPassword() {
  return applyDecorators(
    IsStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    }),
    Transform(({ value }: { value: string }) =>
      typeof value === 'string' ? value.trim() : value,
    ),
  );
}
