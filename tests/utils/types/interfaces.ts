export interface AppConfiguration {
  [key: string]: any;
}

export interface AppConfigurationApiResponse {
  data?: {
    listAppConfigurations?: Array<{
      configuration?: string;
    }>;
  };
}
