export interface ClientConfig {
  name: string;
  baseUrl: string;
  timeout?: number;
  credentials?: {
    username: string;
    password: string;
  };
  customSelectors?: Record<string, string>;
  apiEndpoints?: Record<string, string>;
  testData?: Record<string, any>;
}
