import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError, ConfigurationError } from './errors/CustomErrors';

interface TestDataConfig {
  PROPERTY_DETAILS_API_URL?: string;
  USER_BY_ID_API_URL?: string;
  AUTH_BEARER_TOKEN?: string;
}

function loadTestData(): TestDataConfig {
  try {
    const dataPath = path.resolve(__dirname, '../testData.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TestDataConfig;
    }
  } catch (error) {
    console.warn('Unable to load test data from tests/testData.json:', error);
  }

  return {};
}

export interface UserAccessApiData {
  properties: string[];
  modules: string[];
  roles: string[];
}

export class UserAccessValidation extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchPropertyDetails(userId?: string): Promise<string[]> {
    const body = await this.fetchPropertyDetailsRaw();
    return this.extractPropertyNames(body);
  }

  async fetchPropertyDetailsRaw(): Promise<any> {
    const testData = loadTestData();
    const endpoint = testData.PROPERTY_DETAILS_API_URL || '';

    if (!endpoint) {
      throw new ConfigurationError('PROPERTY_DETAILS_API_URL is not configured', 'PROPERTY_DETAILS_API_URL');
    }

    const response = await this.request.post(
      endpoint,
      {
        headers: this.getHeaders(),
        data: this.buildPropertyDetailsPayload(),
      },
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch property details: ${response.status()} - ${errorBody}`,
        response.status(),
        endpoint,
      );
    }

    return await response.json();
  }

  async fetchUserById(userId: string): Promise<UserAccessApiData> {
    const body = await this.fetchUserByIdRaw(userId);
    return {
      properties: this.extractNames(body, ['property', 'properties', 'propertyDetails', 'propertyList']),
      modules: this.extractNames(body, ['module', 'modules', 'moduleAccess', 'moduleList']),
      roles: this.extractNames(body, ['role', 'roles', 'roleAccess', 'roleList']),
    };
  }

  async fetchUserByIdRaw(userId: string): Promise<any> {
    if (!userId) {
      throw new ConfigurationError('userId must be provided', 'userId');
    }

    const testData = loadTestData();
    const endpoint = testData.USER_BY_ID_API_URL || '';

    if (!endpoint) {
      throw new ConfigurationError('USER_BY_ID_API_URL is not configured', 'USER_BY_ID_API_URL');
    }

    const response = await this.request.post(
      endpoint,
      {
        headers: this.getHeaders(),
        data: this.buildGraphQlPayload('getUserById', userId),
      },
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch user details: ${response.status()} - ${errorBody}`,
        response.status(),
        endpoint,
      );
    }

    return await response.json();
  }

  private buildPropertyDetailsPayload(): string {
    const query = `query getPropertyDetailsQuery {
  getPropertyDetails(input: {lang: ""}) {
    brands {
      name
      id
      groupId
    }
    groups {
      name
      id
    }
    hotels {
      brandId
      name
      code
      id
      currency
      informationCustomAttributes {
        key
        value
      }
      location {
        timezone
      }
      checkInTime
      checkOutTime
    }
  }
}`;

    return JSON.stringify({
      operationName: 'getPropertyDetailsQuery',
      variables: {},
      query,
    });
  }

  private buildGraphQlPayload(operationName: string, userId?: string): string {
    const variables = userId ? { id: userId } : {};
    const query = `query ${operationName}${userId ? '($id: String!)' : ''} {\n  ${operationName}${userId ? '(id: $id)' : ''} {\n    groupId\n    roleId\n    roles\n  }\n}`;

    return JSON.stringify({
      operationName,
      variables,
      query,
    });
  }

  private getHeaders(): Record<string, string> {
    const testData = loadTestData();
    const authToken = (testData.AUTH_BEARER_TOKEN || '').trim();
    const normalizedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

    return {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      authorization: normalizedToken,
      channel: 'STAFF_CONNECT',
      'content-type': 'application/json',
      origin: 'https://staff-copilot.hudinielevate-stage.io',
      priority: 'u=1, i',
      referer: 'https://staff-copilot.hudinielevate-stage.io/',
      'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    };
  }

  private extractNames(payload: unknown, targetKeys: string[]): string[] {
    const values = this.collectByKey(payload, targetKeys);
    const names = values
      .map((value) => this.normalizeName(value))
      .filter((value): value is string => Boolean(value));

    return [...new Set(names)];
  }

  private extractPropertyNames(payload: unknown): string[] {
    const names: string[] = [];

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const data = record.data;
      const propertyDetails = data && typeof data === 'object'
        ? (data as Record<string, unknown>).getPropertyDetails
        : undefined;

      if (propertyDetails && typeof propertyDetails === 'object') {
        const propertyDetailsRecord = propertyDetails as Record<string, unknown>;
        const propertyCollections = [
          propertyDetailsRecord.brands,
          propertyDetailsRecord.groups,
          propertyDetailsRecord.hotels,
        ];

        for (const collection of propertyCollections) {
          if (Array.isArray(collection)) {
            for (const item of collection) {
              if (item && typeof item === 'object') {
                const candidate = (item as Record<string, unknown>).name;
                if (typeof candidate === 'string' && candidate.trim()) {
                  names.push(candidate.trim());
                }
              }
            }
          }
        }
      }
    }

    return [...new Set(names)];
  }

  private collectByKey(value: unknown, targetKeys: string[]): unknown[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectByKey(item, targetKeys));
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const matches = Object.entries(record)
        .filter(([key]) => targetKeys.includes(key.toLowerCase()))
        .map(([, nestedValue]) => nestedValue);

      const nested = Object.values(record).flatMap((nestedValue) => this.collectByKey(nestedValue, targetKeys));
      return [...matches, ...nested];
    }

    return [];
  }

  private normalizeName(value: unknown): string | null {
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : null;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeName(item)).filter(Boolean).join(', ') || null;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const candidateKeys = ['name', 'propertyName', 'moduleName', 'roleName', 'title', 'displayName', 'label'];

      for (const key of candidateKeys) {
        const candidate = record[key];
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      }
    }

    return null;
  }
}

export class ValidateUserAccess {
  constructor(private request: APIRequestContext) {}

  async validatePropertyAndModuleAccess(userId: string) {
    const api = new UserAccessValidation(this.request);
    
    // Fetch property details API response
    const propertyDetailsResponse = await api.fetchPropertyDetailsRaw();
    
    // Fetch user by ID API response
    const userByIdResponse = await api.fetchUserByIdRaw(userId);

    // Save responses to JSON files
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.resolve(__dirname, '../api-responses');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'property-details-response.json'),
      JSON.stringify(propertyDetailsResponse, null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, 'user-by-id-response.json'),
      JSON.stringify(userByIdResponse, null, 2)
    );

    console.log('API responses saved to api-responses directory');

    return {
      propertyDetailsResponse,
      userByIdResponse,
    };
  }
}
