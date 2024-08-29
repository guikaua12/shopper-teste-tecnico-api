import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import {
    ListMeasuresParam,
    ListMeasuresQuery,
    MeasureConfirm,
    MeasureConfirmResponse,
    MeasureUpload,
    MeasureUploadResponse,
    verifyMeasureType,
} from './measure.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
    DoubleMeasureReportException,
    InvalidMeasureTypeException,
    MeasureAlreadyConfirmedException,
    MeasureNotFoundException,
} from './measure.exception';
import { generationConfig, systemInstruction } from './measure.constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MeasureService {
    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService
    ) {}

    async upload({
        image,
        customer_code,
        measure_datetime,
        measure_type,
    }: MeasureUpload): Promise<MeasureUploadResponse> {
        const month = measure_datetime.getMonth();

        const hasMeasureWithType = await this.prisma.measure.findFirst({
            where: {
                AND: [
                    {
                        measure_datetime: {
                            gte: new Date(measure_datetime.getFullYear(), month, 1),
                        },
                    },
                    {
                        measure_datetime: {
                            lt: new Date(measure_datetime.getFullYear(), month + 1, 1),
                        },
                    },
                    {
                        measure_type,
                    },
                    {
                        customer_code,
                    },
                ],
            },
        });

        if (hasMeasureWithType) {
            throw new DoubleMeasureReportException();
        }

        const { url, mimeType } = await this.geminiService.upload(image);

        const measure_value = await this.extractMeasureValue(url, mimeType);

        const measure = await this.prisma.measure.create({
            data: {
                measure_uuid: uuid(),
                measure_datetime,
                measure_type,
                has_confirmed: false,
                measure_value,
                image_url: url,
                customer_code,
            },
        });

        return {
            image_url: url,
            measure_value,
            measure_uuid: measure.measure_uuid,
        };
    }

    async extractMeasureValue(imageUrl: string, mimeType: string): Promise<number> {
        const result = await this.geminiService.generateContent({
            systemInstruction,
            generationConfig,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                mimeType,
                                fileUri: imageUrl,
                            },
                        },
                    ],
                },
            ],
        });

        const { consumption } = JSON.parse(result.response.text());

        return this.removeDecimalDot(consumption);
    }

    private removeDecimalDot(num: number) {
        const numStr = num.toString();

        const parts = numStr.split(/[.,]/);

        if (parts.length === 1) {
            return num;
        }

        return parseInt(parts.join(''), 10);
    }

    async confirm({ measure_uuid, confirmed_value }: MeasureConfirm): Promise<MeasureConfirmResponse> {
        const measure = await this.prisma.measure.findUnique({
            where: {
                measure_uuid,
            },
        });

        if (!measure) {
            throw new MeasureNotFoundException();
        }

        if (measure.has_confirmed) {
            throw new MeasureAlreadyConfirmedException();
        }

        await this.prisma.measure.update({
            data: { measure_value: confirmed_value, has_confirmed: true },
            where: { measure_uuid },
        });

        return { success: true };
    }

    async listMeasures({ customer_code }: ListMeasuresParam, { measure_type }: ListMeasuresQuery) {
        if (measure_type && !verifyMeasureType(measure_type.toUpperCase())) {
            throw new InvalidMeasureTypeException();
        }

        return this.prisma.measure.findMany({
            where: {
                customer_code,
                ...(measure_type && { measure_type }),
            },
        });
    }
}
