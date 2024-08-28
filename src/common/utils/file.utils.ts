import { parse } from 'file-type-mime';

export async function getMimeType(buffer: Buffer): Promise<string | undefined> {
    if (!buffer) return undefined;

    const { mime } = parse(buffer);
    return mime;
}
