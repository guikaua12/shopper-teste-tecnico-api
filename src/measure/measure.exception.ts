import { CustomException } from '../common/error/custom.exception';
import { HttpStatus } from '@nestjs/common';

export class DoubleMeasureReportException extends CustomException {
    constructor() {
        super({ error_code: 'DOUBLE_REPORT', error_description: 'Leitura do mês já realizada' }, HttpStatus.CONFLICT);
    }
}

export class MeasureNotFoundException extends CustomException {
    constructor() {
        super({ error_code: 'MEASURE_NOT_FOUND', error_description: 'Leitura não encontrada' }, HttpStatus.NOT_FOUND);
    }
}

export class MeasureAlreadyConfirmedException extends CustomException {
    constructor() {
        super(
            { error_code: 'CONFIRMATION_DUPLICATE', error_description: 'Leitura do mês já realizada' },
            HttpStatus.CONFLICT
        );
    }
}

export class InvalidMeasureTypeException extends CustomException {
    constructor() {
        super(
            { error_code: 'INVALID_TYPE', error_description: 'Tipo de medição não permitida' },
            HttpStatus.BAD_REQUEST
        );
    }
}

export class MeasuresNotFoundException extends CustomException {
    constructor() {
        super(
            { error_code: 'MEASURES_NOT_FOUND', error_description: 'Nenhuma leitura encontrada' },
            HttpStatus.NOT_FOUND
        );
    }
}
