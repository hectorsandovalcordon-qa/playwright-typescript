import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';

export class DataUtils {
  static loadTestData(filePath: string): any {
    try {
      const fullPath = path.resolve(filePath);
      const data = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error loading test data from ${filePath}: ${error}`);
    }
  }

  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test_${this.generateRandomString(8)}@example.com`;
  }

  static getCurrentTimestamp(): string {
    return moment().format('YYYY-MM-DD_HH-mm-ss');
  }

  static formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}
