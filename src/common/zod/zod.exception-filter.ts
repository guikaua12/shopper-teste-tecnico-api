import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
    catch(exception: ZodError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        const errorDescription = exception.errors.map((error) => error.message).join('; ');

        return response.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: errorDescription,
        });
    }
}
