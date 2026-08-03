import { Page, Locator, expect } from "@playwright/test";

type flexibleLocator = string | Locator;

export class ElementActions {

    private page: Page;
    private defaultTimeout: number = 90000;

    constructor(page: Page, timeOut: number) {
        this.page = page;
        this.defaultTimeout = timeOut;

    }

    /**
     * @description This method accepts either a string or a Locator and returns a Locator object. If a string is provided, it is treated as a selector and converted to a Locator using the page.locator() method. If a Locator is provided, it is returned as is.
     * @param locator 
     * @returns 
     */

    private getLocator(locator: flexibleLocator): Locator {
        if (typeof locator === 'string') {
            return this.page.locator(locator);

        }

        return locator;

    }

    /**
     * 
     * @param locator Click on an element
     * @param options 
     */
    async clickElement(locator: flexibleLocator, options?: { force?: boolean; timeout?: number }): Promise<void> {

        await this.getLocator(locator).click({
            force: options?.force || false,
            timeout: options?.timeout || this.defaultTimeout
        });

        console.log(`Clicked on the element: ${locator}`);

    }

    /**
     * Double click on the element
     * @param locator 
     * 
     * @param options 
     */
    async doubleClickElement(locator: flexibleLocator, options?: { force?: boolean; timeout?: number }): Promise<void> {

        await this.getLocator(locator).dblclick({
            force: options?.force || false,
            timeout: options?.timeout || this.defaultTimeout
        });

        console.log(`Double-clicked on the element: ${locator}`);

    }


    /**
     * Perform the right click on the element
     * @param locator 
     * 
     * @param options 
     */
    async rightClickElement(locator: flexibleLocator, options?: { force?: boolean; timeout?: number }): Promise<void> {

        await this.getLocator(locator).click({
            force: options?.force || false,
            button: 'right',
            timeout: options?.timeout || this.defaultTimeout
        });

        console.log(`Right clicked on the element: ${locator}`);

    }


    /**
     * Type the text into the element sequentially with a delay between each keystroke
     * @param locator 
        * @param text The text to be entered
        * @param delay The delay between each keystroke in milliseconds (default is 500ms)
     */
    async enterTextSequentially(locator: flexibleLocator, text: string, delay: number = 500): Promise<void> {

        await this.getLocator(locator).pressSequentially(text, { delay, timeout: this.defaultTimeout });

        console.log(`Entered text sequentially under ${locator}`);

    }

    /**
         * 
         * @param locator Fills the text in the locator
         * @param value 
         * @param options 
         */
    async fillElement(locator: flexibleLocator, value: string, options?: { timeout?: number }): Promise<void> {

        await this.getLocator(locator).fill(value, {
            timeout: options?.timeout || this.defaultTimeout
        });

        console.log(`Filled the element with the text: ${value}`);

    }

    /**
     * 
     * @param locator Fills the text in the locator
     * @param value 
     * @param options 
     */
    async clearText(locator: flexibleLocator): Promise<void> {

        await this.getLocator(locator).clear({ timeout: this.defaultTimeout });

        console.log(`Cleared the element: ${locator}`);

    }

    //============================= Element Visibility & State Check ============================

    /**
     * @description Verifies if the element is visible on the page within the specified timeout
     * @param locator 
     * @param timeout 
     * @returns true if the element is visible; else returns false
     */
    async isElementVisible(locator: flexibleLocator, timeout: number = 50000): Promise<boolean> {

        try {
            await this.getLocator(locator).waitFor({ state: 'visible', timeout });
            console.log(`Element is visible: ${locator}`);
            return true;
        } catch (error) {
            console.error(`Element is not visible: ${locator}`);
            return false;
        }

    }

    /**
 * @description Verifies if the element is hidden on the page within the specified timeout
 * @param locator 
 * @param timeout 
 * @returns true if the element is hidden; else returns false
 */
    async isElementHidden(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        try {
            await this.getLocator(locator).waitFor({ state: 'hidden', timeout });
            console.log(`Element is hidden: ${locator}`);
            return true;
        } catch (error) {
            console.error(`Element is not hidden: ${locator}`);
            return false;
        }

    }


    /**
 * @description Verifies if the element is enabled on the page within the specified timeout
 * @param locator 
 * @param timeout 
 * @returns true if the element is enabled; else returns false
 */
    async isElementEnabled(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        return await this.getLocator(locator).isEnabled({ timeout });

    }


    /**
 * @description Verifies if the element is disabled on the page within the specified timeout
 * @param locator 
 * @param timeout 
 * @returns true if the element is disabled; else returns false
 */
    async isElementDisabled(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        return !await this.getLocator(locator).isEnabled({ timeout });

    }


    /**
 * @description Verifies if the element is checked or not
 * @param locator 
 * @param timeout 
 * @returns true if the element is checked; else returns false
 */
    async isElementChecked(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        return await this.getLocator(locator).isChecked({ timeout });

    }

    /**
* @description Verifies if the element is editable or not
* @param locator 
* @param timeout 
* @returns true if the element is editable; else returns false
*/
    async isElementEditable(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        return await this.getLocator(locator).isEditable({ timeout });

    }


    //============================= Wait-related utilities ============================

    /**
     * @description Verifies if the element is attached to the DOM
     * @param locator 
     * @param timeout 
     * @returns true if the element is attached to the DOM; else returns false
     */
    async isElementAttachedtoDOM(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {

        try {
            await this.getLocator(locator).waitFor({ state: 'visible', timeout });
            console.log(`Element is attached to DOM: ${locator}`);
            return true;
        } catch (error) {
            console.error(`Element is not attached to DOM: ${locator}`);
            return false;
        }

    }


    /**
     * @description Verifies if the element is attached to the DOM
     * @param locator 
     * @param timeout 
     * @returns true if the element is attached to the DOM; else returns false
     */
    async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {

        await this.page.waitForLoadState(state);
        console.log(`Waited for the page load state: ${state}`);

    }

    /**
         * @description Waits for the page to load based on the specified state
         * @param state 
         * @returns Promise resolving when the page load state is reached
         */
    async waitForTimeout(timeOut: number): Promise<void> {

        await this.page.waitForTimeout(timeOut);
        console.log(`Waited for the timeout: ${timeOut} ms`);

    }

    /**
     * @description Get the text context of the element
     * @param locator 
     * @returns 
     */
    async getTextContent(locator: flexibleLocator): Promise<string | null> {
        const text = await this.getLocator(locator).textContent({ timeout: this.defaultTimeout });
        return text;
    }


    /**
 * @description Get the inner text of the element
 * @param locator 
 * @returns 
 */
    async getInnerText(locator: flexibleLocator): Promise<string> {
        const text = await this.getLocator(locator).innerText({ timeout: this.defaultTimeout });
        return text.trim();
    }


    /**Get the attribute of the element
* @param locator 
* @returns 
*/
    async getAttribute(locator: flexibleLocator, attributeName: string): Promise<string | null> {
        const text = await this.getLocator(locator).getAttribute(attributeName, { timeout: this.defaultTimeout });
        return text;
    }

    /**Get the entered value of the element
* @param locator 
* @returns 
*/
    async getEnteredValue(locator: flexibleLocator): Promise<string> {
        const value = await this.getLocator(locator).inputValue({ timeout: this.defaultTimeout });
        return value;

    }


    /** 
     * Get all the text content from multiple elements
     * 
     */
    async getAllInnerTexts(locator: flexibleLocator): Promise<string[]> {

        let innerTexts = await this.getLocator(locator).allInnerTexts();
        return innerTexts;

    }

    //========================= Dropdown related Utilities =========================

    /**
     * @description Selects an option from a dropdown based on the visible text
     * @param locator 
     * @param optionText 
     */
    async selectByVisibleText(locator: flexibleLocator, optionText: string): Promise<void> {

        await this.getLocator(locator).selectOption({ label: optionText }, { timeout: this.defaultTimeout });
        console.log(`Selected the dropdown option ${optionText}`);

    }

    /**
 * @description Selects an option from a dropdown based on the value
 * @param locator 
 * @param value 
 */
    async selectByValue(locator: flexibleLocator, value: string): Promise<void> {

        await this.getLocator(locator).selectOption({ value: value }, { timeout: this.defaultTimeout });
        console.log(`Selected the dropdown option ${value}`);

    }


    /**
* @description Selects an option from a dropdown based on the index
* @param locator 
* @param value 
*/
    async selectByIndex(locator: flexibleLocator, index: number): Promise<void> {

        await this.getLocator(locator).selectOption({ index: index }, { timeout: this.defaultTimeout });
        console.log(`Selected the dropdown option at index ${index}`);

    }


    /**
     * @description Presses a specific key on the element
     * @param locator 
     * 
     * @param key 
     */
    async pressKey(locator: string | Locator, key: string): Promise<void> {
        await this.getLocator(locator).press(key, { timeout: this.defaultTimeout });
        console.log(`Pressed the key ${key}`);
    }


    async clearAndFill(locator: flexibleLocator, value: string, options?: { timeout?: number }): Promise<void> {

        await this.clearText(locator);
        await this.fillElement(locator, value, options);

    }


    /**
     * @description Clicks on the checkbox if not already checked
     * @param locator 
     * @param value 
     * @param options 
     */
    async clickCheckbox(locator: flexibleLocator, value: string, options?: { timeout?: number }): Promise<void> {

        await this.getLocator(locator).check();
        console.log(`Checked the checkbox: ${locator}`);
    }

    /**
 * @description Unchecks the checkbox if it is already checked
 * @param locator 
 * @param value 
 * @param options 
 */
    async uncheckCheckbox(locator: flexibleLocator, value: string, options?: { timeout?: number }): Promise<void> {

        await this.getLocator(locator).uncheck();
        console.log(`Unchecked the checkbox: ${locator}`);
    }


    /**
     * @description Get all the text content from multiple elements
     * @param locator 
     * @returns 
     */
    async getAllText(locator: string | Locator): Promise<string[]> {
        return await this.getLocator(locator).allTextContents();

    }


    /**
     * @description Checks if an element has a specific attribute
     * @param locator 
     * 
     * @param attribute 
     * @returns 
     */
    async hasAttribute(locator: string | Locator, attribute: string): Promise<boolean> {
        const value = await this.getAttribute(locator, attribute);
        return value !== null;
    }


    /**
 * @description Checks if an element has a specific class
 * @param locator 
 * 
 * @param attribute 
 * @returns 
 */
    async hasClass(locator: string | Locator, className: string): Promise<boolean> {
        const element = await this.getLocator(locator);
        const classValue = await element.getAttribute('class');
        return classValue?.split(' ').includes(className) ?? false;
    }


    /**
     * @description Get the count of elements matching the locator
     * @param locator 
     * @returns 
     */
    async getCount(locator: string | Locator): Promise<number> {

        const element = this.getLocator(locator);
        await element.waitFor({ timeout: this.defaultTimeout });
        return await element.count();

    }


    /**
     * 
     * @param locator 
     * @description Returns the index of the nth element
     * @param index 
     * @returns 
     */
    async getNthElement(locator: string | Locator, index: number): Promise<Locator> {

        const element = this.getLocator(locator);
        return element.nth(index);
    }



    /**
     * @description Returns the first element matching the locator
     * @param locator 
     * @returns 
     */
    async getFirstElement(locator: string | Locator): Promise<Locator> {
        const element = this.getLocator(locator);
        return element.first();
    }

    /**
 * @description Returns the last element matching the locator
 * @param locator 
 * @returns 
 */
    async getLastElement(locator: string | Locator): Promise<Locator> {
        const element = this.getLocator(locator);
        return element.last();
    }


    /**
 * @description Hovers over the element specified by the locator
 * @param locator 
 * @returns 
 */
    async hover(locator: string | Locator): Promise<void> {
        const element = this.getLocator(locator);
        await element.hover();
    }

    /**
* @description Focuses on the element specified by the locator
* @param locator 
* @returns 
*/
    async focus(locator: string | Locator): Promise<void> {
        const element = this.getLocator(locator);
        await element.focus();
    }


    /**
* @description Scrolls the element specified by the locator into view
* @param locator 
* @returns 
*/
    async scrollIntoView(locator: string | Locator): Promise<void> {
        const element = this.getLocator(locator);
        await element.scrollIntoViewIfNeeded();
    }

    /**
     * @description Scrolls the page to the top by a specific amount
     */
    async scrollToTop(): Promise<void> {
        await this.page.evaluate(() => window.scrollTo(0, 0));
    }

    /**
 * @description Scrolls the page to the bottom by a specific amount
 */
    async scrollToBottom(): Promise<void> {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }


    /**
* @description Scrolls the page to the based on the specified x and y coordinates
*/
    async scrollByAmount(x: number, y: number): Promise<void> {
        await this.page.evaluate(({ x, y }) => window.scrollBy(x, y), { x, y });
    }



    /**
     * @description Drags an element from the source locator and drops it onto the target locator
     * @param source 
     * @param target 
     */
    async dragAndDrop(source: string | Locator, target: string | Locator): Promise<void> {
        const sourceElement = await this.getLocator(source);
        const targetElement = await this.getLocator(target);
        await sourceElement.dragTo(targetElement);
    }


    /**
     * @description Takes a screenshot of the element specified by the locator and saves it to the specified path
     * @param locator 
     * @param path 
     */
    async takeElementScreenshot(locator: string | Locator, path: string): Promise<void> {
        const element = this.getLocator(locator);
        await element.screenshot({ path });
    }

    /**
     * @description Switches the context to a specific frame based on the provided frame locator
     * @param frameLocator 
     * 
     */
    async switchToFrame(frameLocator: string): Promise<void> {
        await this.page.frameLocator(frameLocator);
    }


    /**
     * @description Uploads a file to the element specified by the locator. The filePath can be a single string or an array of strings for multiple file uploads.
     * @param locator 
     * @param filePath 
     */
    async uploadFile(locator: string | Locator, filePath: string | string[]): Promise<void> {
        const element = await this.getLocator(locator);
        await element.setInputFiles(filePath);
    }


    /**
     * @description Clicks on an element containing the specified text. The exact parameter determines whether to match the text exactly or partially.
     * @param text 
     * * @param exact 
     */
    async clickByText(text: string, exact: boolean = false): Promise<void> {
        await this.page.getByText(text, { exact }).click();
    }



    /**
     * @description Clicks on an element with the specified role and name. The role parameter specifies the type of element (e.g., button, link, checkbox), and the name parameter specifies the accessible name of the element.
     * @param role 
     * @param name 
     */
    async clickByRole(role: 'button' | 'link' | 'checkbox' | 'radio' | 'textbox', name?: string): Promise<void> {
        await this.page.getByRole(role, { name }).click();
        //Test comment
    }


    /**
     * @description Fills an input element with the specified placeholder text. The method locates the input element based on its placeholder attribute and fills it with the provided text.
     * @param placeholder 
     * @param text 
     */
    async fillByPlaceholder(placeholder: string, text: string): Promise<void> {
        await this.page.getByPlaceholder(placeholder).fill(text);
    }


    /**
     * @description Clicks on an element with the specified label text. The method locates the element based on its associated label and clicks on it.
     * @param label 
     * 
     */
    async clickByLabel(label: string): Promise<void> {
        await this.page.getByLabel(label).click();
    }

}