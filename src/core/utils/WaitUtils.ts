import { Page } from '@playwright/test';
import { Logger } from '../utils/Logger';

export class WaitUtils{
    private page: Page;
    private logger: Logger;
    private defaultTimeout: number;

    constructor(page: Page, defaultTimeout: number = 30000){
        this.page = page;
        this.logger = Logger.getInstance();
        this.defaultTimeout = defaultTimeout;
    }
        async waitForElement(selector:string, timeout?:number): Promise<void> {
            const waitTime = timeout || this.defaultTimeout;
            try{
                await this.page.waitForSelector(selector, {timeout: waitTime});
            }
            catch(error){
                throw new Error(`Element ${selector} not found within ${waitTime}ms`);
            }
    }
}