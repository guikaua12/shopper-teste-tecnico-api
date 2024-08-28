import { CustomException } from '@/common/error/custom.exception';
import { HttpStatus } from '@nestjs/common';

export class DoubleMeasureReportException extends CustomException {
    constructor() {
        super({ error_code: 'DOUBLE_REPORT', error_description: 'Leitura do mês já realizada' }, HttpStatus.CONFLICT);
    }
}
