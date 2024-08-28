import { HttpException } from '@nestjs/common';
import { Error } from '../../common/error/error.type';

export class CustomException extends HttpException {
    public readonly error: Error;

    constructor({ error_code, error_description }: Error, status: number) {
        super(error_description, status);
        this.error = { error_code, error_description };
    }
}
