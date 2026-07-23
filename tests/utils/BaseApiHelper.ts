import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BaseApiHelper {
  constructor(protected request: APIRequestContext) {}

  protected async saveResponseToFile(data: unknown, fileName: string): Promise<void> {
    const outputDir = path.resolve(__dirname, '../api-responses');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.resolve(outputDir, fileName);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  }
}
