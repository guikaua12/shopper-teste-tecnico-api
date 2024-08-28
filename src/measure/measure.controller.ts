import { Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ValidBody, ValidParam, ValidQuery } from '../common/zod/zod.decorator';
import {
    ListMeasuresParam,
    ListMeasuresParamSchema,
    ListMeasuresQuery,
    ListMeasuresQuerySchema,
    MeasureConfirm,
    MeasureConfirmResponse,
    MeasureConfirmSchema,
    MeasureUpload,
    MeasureUploadResponse,
    MeasureUploadSchema,
} from './measure.dto';
import { MeasureService } from './measure.service';
import { MeasuresNotFoundException } from './measure.exception';

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

    @Get(':customer_code/list')
    async listMeasures(
        @ValidParam(ListMeasuresParamSchema) params: ListMeasuresParam,
        @ValidQuery(ListMeasuresQuerySchema) query: ListMeasuresQuery
    ) {
        const list = await this.measureService.listMeasures(params, query);

        if (list.length === 0) {
            throw new MeasuresNotFoundException();
        }

        return {
            customer_code: params.customer_code,
            measures: list.map(({ measure_uuid, measure_datetime, measure_type, has_confirmed, image_url }) => ({
                measure_uuid,
                measure_datetime,
                measure_type,
                has_confirmed,
                image_url,
            })),
        };
    }
}
