export class ApiResponseError extends Error {
  constructor(message: string, public statusCode: number, public endpoint: string) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, public fieldName: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}
