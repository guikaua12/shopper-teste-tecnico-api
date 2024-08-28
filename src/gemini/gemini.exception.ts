import { CustomException } from '../common/error/custom.exception';
import { HttpStatus } from '@nestjs/common';

export class NotImageException extends CustomException {
    constructor() {
        super({ error_code: 'INVALID_DATA', error_description: 'File must be image' }, HttpStatus.BAD_REQUEST);
    }
}
