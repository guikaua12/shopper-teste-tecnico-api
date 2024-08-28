import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../../common/error/custom.exception';
import { ZodError } from 'zod';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: CustomException | HttpException | Error, host: ArgumentsHost) {
        this.rethrow(exception);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = 500;
        let error_code = 'INTERNAL_ERROR';
        let error_description = exception.message;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            error_description = exception.message;

            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && 'error' in exceptionResponse) {
                error_code = (exceptionResponse as any).error;
            }
        }

        if (exception instanceof CustomException && exception.error) {
            error_code = exception.error.error_code;
            error_description = exception.error.error_description;
        }

        response.status(status).json({
            error_code,
            error_description,
        });
    }

    private rethrow(exception: CustomException | HttpException | Error) {
        if (exception instanceof ZodError) {
            throw exception;
        }
    }
}
