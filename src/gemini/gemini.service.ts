import { Injectable } from '@nestjs/common';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NotImageException } from '@/gemini/gemini.exception';
import { parse } from 'file-type-mime';

@Injectable()
export class GeminiService {
    private readonly fileManager: GoogleAIFileManager;
    private readonly geminiClient: GoogleGenerativeAI;

    constructor(config: ConfigService) {
        this.fileManager = new GoogleAIFileManager(config.getOrThrow('GEMINI_API_KEY'));
        this.geminiClient = new GoogleGenerativeAI(config.getOrThrow('GEMINI_API_KEY'));
    }

    async upload(base64: string): Promise<string> {
        const imageBuffer = Buffer.from(base64, 'base64');

        const mimetype = await this.getMimeType(imageBuffer);
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

        return uploadResponse.file.uri;
    }

    private async getMimeType(buffer: Buffer): Promise<string | undefined> {
        if (!buffer) return undefined;

        const { mime } = parse(buffer);
        return mime;
    }
}
