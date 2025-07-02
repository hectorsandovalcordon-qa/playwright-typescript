import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '@core/utils/Logger';
import { Config } from '../config/Config';

export class BaseAPI {
  protected request: APIRequestContext;
  protected logger: Logger;
  protected config: Config;
  protected baseURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.logger = Logger.getInstance();
    this.config = Config.getInstance();
    this.baseURL = this.config.getBaseUrl();
  }

  protected async get(endpoint: string, options?: any): Promise<APIResponse> {
    this.logger.info(`GET request to: ${this.baseURL}${endpoint}`);
    return await this.request.get(`${this.baseURL}${endpoint}`, options);
  }

  protected async post(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    this.logger.info(`POST request to: ${this.baseURL}${endpoint}`);
    return await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      ...options
    });
  }

  protected async put(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    this.logger.info(`PUT request to: ${this.baseURL}${endpoint}`);
    return await this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      ...options
    });
  }

  protected async delete(endpoint: string, options?: any): Promise<APIResponse> {
    this.logger.info(`DELETE request to: ${this.baseURL}${endpoint}`);
    return await this.request.delete(`${this.baseURL}${endpoint}`, options);
  }

  protected async validateResponse(response: APIResponse, expectedStatus: number = 200): Promise<void> {
    if (response.status() == expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${response.status()}`);
    }
  }
}
