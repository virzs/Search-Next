import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

export async function readableToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });
  return Buffer.concat(chunks);
}

export function bufferToReadable(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

export async function ensureDirForFile(filePath: string) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeBufferToFile(filePath: string, buffer: Buffer) {
  await ensureDirForFile(filePath);
  await fs.promises.writeFile(filePath, buffer);
}

export async function readFileToBuffer(filePath: string) {
  return await fs.promises.readFile(filePath);
}
