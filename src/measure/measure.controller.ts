import { Controller, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ValidBody } from '@/common/zod/zod.decorator';
import {
    MeasureConfirm,
    MeasureConfirmResponse,
    MeasureConfirmSchema,
    MeasureUpload,
    MeasureUploadResponse,
    MeasureUploadSchema,
} from '@/measure/measure.dto';
import { MeasureService } from '@/measure/measure.service';

@Controller()
export class MeasureController {
    constructor(private measureService: MeasureService) {}

    @HttpCode(HttpStatus.OK)
    @Post('upload')
    async upload(@ValidBody(MeasureUploadSchema) body: MeasureUpload): Promise<MeasureUploadResponse> {
        return this.measureService.upload(body);
    }

    @Patch('confirm')
    async confirm(@ValidBody(MeasureConfirmSchema) body: MeasureConfirm): Promise<MeasureConfirmResponse> {
        return this.measureService.confirm(body);
    }
}
