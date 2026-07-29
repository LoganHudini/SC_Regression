import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BaseApiHelper {
  constructor(protected request: APIRequestContext) {}

  protected async saveResponseToFile(data: unknown, fileName: string): Promise<void> {
    const outputPath = path.resolve(process.cwd(), 'tests', 'api-responses', fileName);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  }
}
