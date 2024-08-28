import { Injectable } from '@nestjs/common';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { ConfigService } from '@nestjs/config';
import {
    GenerateContentRequest,
    GenerateContentResult,
    GenerativeModel,
    GoogleGenerativeAI,
} from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NotImageException } from '@/gemini/gemini.exception';
import { getMimeType } from '@/common/utils/file.utils';
import { ImageUploadResponse } from '@/gemini/gemini.dto';

@Injectable()
export class GeminiService {
    private readonly fileManager: GoogleAIFileManager;
    private readonly geminiClient: GoogleGenerativeAI;
    private readonly model: GenerativeModel;

    constructor(config: ConfigService) {
        this.fileManager = new GoogleAIFileManager(config.getOrThrow('GEMINI_API_KEY'));
        this.geminiClient = new GoogleGenerativeAI(config.getOrThrow('GEMINI_API_KEY'));
        this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async upload(base64: string): Promise<ImageUploadResponse> {
        const imageBuffer = Buffer.from(base64, 'base64');

        const mimetype = await getMimeType(imageBuffer);
        if (!mimetype.includes('image')) {
            throw new NotImageException();
        }

        const currentDir = process.cwd();

        // temporary directory
        const tempDir = path.join(currentDir, 'tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFilePath = path.join(tempDir, `${uuidv4()}.jpg`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        const uploadResponse = await this.fileManager.uploadFile(tempFilePath, {
            mimeType: mimetype,
        });

        // delete
        fs.unlinkSync(tempFilePath);

        return {
            url: uploadResponse.file.uri,
            mimeType: mimetype,
        };
    }

    async generateContent(request: GenerateContentRequest): Promise<GenerateContentResult> {
        return this.model.generateContent(request);
    }
}
