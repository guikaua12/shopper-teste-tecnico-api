import { Test, TestingModule } from '@nestjs/testing';
import { MeasureController } from './measure.controller';
import { MeasureService } from './measure.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import {
    DoubleMeasureReportException,
    InvalidMeasureTypeException,
    MeasureAlreadyConfirmedException,
    MeasureNotFoundException,
    MeasuresNotFoundException,
} from './measure.exception';
import { Measure } from '@prisma/client';

describe('MeasureController', () => {
    let measureController: MeasureController;
    let measureService: MeasureService;
    let prismaService: PrismaService;
    let geminiService: GeminiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MeasureController],
            providers: [
                MeasureService,
                {
                    provide: PrismaService,
                    useValue: {
                        measure: {
                            findFirst: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: GeminiService,
                    useValue: {
                        upload: jest.fn(),
                        generateContent: jest.fn(),
                    },
                },
            ],
        }).compile();

        measureController = module.get<MeasureController>(MeasureController);
        measureService = module.get<MeasureService>(MeasureService);
        prismaService = module.get<PrismaService>(PrismaService);
        geminiService = module.get<GeminiService>(GeminiService);
    });

    describe('upload', () => {
        it('should not upload a measure if another measure with same month exists', async () => {
            const measureUploadDto = {
                image: 'image_data',
                customer_code: '1',
                measure_datetime: new Date(),
                measure_type: 'WATER',
            };

            jest.spyOn(prismaService.measure, 'findFirst').mockResolvedValue({
                measure_uuid: 'uuid',
                measure_datetime: new Date(),
                measure_type: 'WATER',
                customer_code: '1',
                has_confirmed: false,
                measure_value: 1337,
                image_url: 'image_url',
            });

            await expect(measureController.upload(measureUploadDto)).rejects.toThrow(DoubleMeasureReportException);
        });

        it('should upload', async () => {
            const measureUploadDto = {
                image: 'image_data',
                customer_code: '1',
                measure_datetime: new Date(),
                measure_type: 'WATER',
            };

            jest.spyOn(prismaService.measure, 'findFirst').mockResolvedValue(null);
            jest.spyOn(geminiService, 'upload').mockResolvedValue({ url: 'image_url', mimeType: 'image/png' });
            jest.spyOn(measureService, 'extractMeasureValue').mockResolvedValue(123);
            jest.spyOn(prismaService.measure, 'create').mockResolvedValue({
                measure_uuid: 'uuid',
                measure_datetime: measureUploadDto.measure_datetime,
                measure_type: measureUploadDto.measure_type,
                customer_code: measureUploadDto.customer_code,
                has_confirmed: false,
                measure_value: 123,
                image_url: 'image_url',
            });

            await expect(measureController.upload(measureUploadDto)).resolves.toEqual({
                image_url: 'image_url',
                measure_value: 123,
                measure_uuid: 'uuid',
            });
        });
    });

    describe('confirm', () => {
        it('should throw if no measure found with provided measure_uuid', async () => {
            const confirmDto = { measure_uuid: 'uuid', confirmed_value: 100 };

            jest.spyOn(prismaService.measure, 'findUnique').mockResolvedValue(null);

            await expect(measureController.confirm(confirmDto)).rejects.toThrow(MeasureNotFoundException);
        });

        it('should throw if measure is already confirmed', async () => {
            const confirmDto = { measure_uuid: 'uuid', confirmed_value: 100 };

            jest.spyOn(prismaService.measure, 'findUnique').mockResolvedValue({
                measure_uuid: 'uuid',
                measure_datetime: new Date(),
                measure_type: 'WATER',
                customer_code: '1',
                has_confirmed: true,
                measure_value: 123,
                image_url: 'image_url',
            });

            await expect(measureController.confirm(confirmDto)).rejects.toThrow(MeasureAlreadyConfirmedException);
        });

        it('should confirm', async () => {
            const confirmDto = { measure_uuid: 'uuid', confirmed_value: 100 };

            jest.spyOn(prismaService.measure, 'findUnique').mockResolvedValue({
                measure_uuid: 'uuid',
                measure_datetime: new Date(),
                measure_type: 'WATER',
                customer_code: '1',
                has_confirmed: false,
                measure_value: 123,
                image_url: 'image_url',
            });

            jest.spyOn(prismaService.measure, 'update').mockResolvedValue({
                measure_uuid: 'uuid',
                measure_datetime: new Date(),
                measure_type: 'WATER',
                customer_code: '1',
                has_confirmed: true,
                measure_value: 100,
                image_url: 'image_url',
            });

            await expect(measureController.confirm(confirmDto)).resolves.toEqual({ success: true });
            expect(prismaService.measure.update).toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should throw if invalid measure_type', async () => {
            const params = { customer_code: '1' };
            const query = { measure_type: 'WATERRRRR' };

            await expect(measureController.listMeasures(params, query)).rejects.toThrow(InvalidMeasureTypeException);
        });

        it('should throw if measures list is empty', async () => {
            const params = { customer_code: '1' };
            const query = { measure_type: 'water' };

            jest.spyOn(prismaService.measure, 'findMany').mockResolvedValue([]);

            await expect(measureController.listMeasures(params, query)).rejects.toThrow(MeasuresNotFoundException);
        });

        it('should return measures', async () => {
            const params = { customer_code: '1' };
            const query = { measure_type: 'water' };

            const measures: Measure[] = [
                {
                    measure_uuid: 'uuid1',
                    customer_code: '1',
                    measure_datetime: new Date(),
                    measure_type: 'WATER',
                    has_confirmed: true,
                    image_url: 'image_url1',
                    measure_value: 123,
                },
                {
                    measure_uuid: 'uuid2',
                    customer_code: '1',
                    measure_datetime: new Date(),
                    measure_type: 'GAS',
                    has_confirmed: true,
                    image_url: 'image_url2',
                    measure_value: 456,
                },
            ];

            jest.spyOn(prismaService.measure, 'findMany').mockResolvedValue([measures[0]]);

            await expect(measureController.listMeasures(params, query)).resolves.toEqual({
                customer_code: '1',
                measures: [measures[0]].map(
                    ({ measure_uuid, measure_datetime, measure_type, has_confirmed, image_url }) => ({
                        measure_uuid,
                        measure_datetime,
                        measure_type,
                        has_confirmed,
                        image_url,
                    })
                ),
            });
            expect(prismaService.measure.findMany).toHaveBeenCalledWith({
                where: {
                    customer_code: '1',
                    measure_type: 'water',
                },
            });
        });
    });
});
