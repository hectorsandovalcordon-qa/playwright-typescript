import { BasePage } from "@core/base/BasePage";
import { LoginSelectors } from "../selectors/LoginSelectors";

class LoginPage extends BasePage{
    async isLoaded(): Promise<boolean> {
        return await this.page.isVisible(LoginSelectors.userName);
    }
    
    async Login(userName:string, password:string){
        await this.click(LoginSelectors.userName);
        await this.fill(LoginSelectors.userName, userName);
        await this.click(LoginSelectors.password);
        await this.fill(LoginSelectors.password, password);
        await this.click(LoginSelectors.loginButton);
    }
}