import { Page, expect, Locator } from '@playwright/test';
import { StaffConnectPage } from './StaffConnect.page';
import { SidecarPage } from './ScSidecar.page';
import { ElementActions } from '../../utils/ElementActions';

export class LoginPage {
  private staffConnectPage: StaffConnectPage;
  private sidecarPage: SidecarPage;
  private elementActions: ElementActions;

  //  Delete icon locator
  deleteDeviceIcon: Locator;

  // Confirm button locator for delete confirmation popup
  confirmButton: Locator;

  // Activities module locator
  activitiesModule: Locator;

  constructor(private page: Page, private request?: any) {
    this.staffConnectPage = new StaffConnectPage(page, request || undefined);
    this.sidecarPage = new SidecarPage(page);
    this.elementActions = new ElementActions(page, 90000);
    this.deleteDeviceIcon = page.locator('//div[@class="ms-5 cursor-pointer"]//*[@xmlns="http://www.w3.org/2000/svg"]');
    this.confirmButton = page.locator("//button[@type='button' and @name='confirm']");
    this.activitiesModule = page.locator('//div[@class="flex justify-center"]');
  }

  // Staff Connect Login Methods
  async launchStaffConnectAndLogin(url: string, email: string) {
    await this.staffConnectPage.launchAndLogin(url, email);
  }

  async enterStaffConnectPassword(password: string) {
    await this.staffConnectPage.enterPassword(password);
  }

  async selectStaffConnectProperty(property: string) {
    await this.staffConnectPage.selectProperty(property);
  }

  async verifyStaffConnectLogin() {
    await this.staffConnectPage.verifySuccessfulLogin();
  }

  // Sidecar Login Methods
  async launchSidecarAndLogin(url: string, email: string) {
    await this.sidecarPage.launchAndLogin(url, email);
  }

  async enterSidecarPassword(password: string) {
    await this.sidecarPage.enterPassword(password);
  }

  async selectSidecarProperty(property: string) {
    await this.sidecarPage.selectProperty(property);
  }

  // Device Management Methods
  async navigateToDeviceModule() {
    await expect(this.staffConnectPage.deviceModule).toBeVisible();
    await this.elementActions.clickElement(this.staffConnectPage.deviceModule);
    console.log('Navigated to Devices section');
  }

  // Guests Section Methods
  async verifyGuestsSectionAccessible() {
    await expect(this.staffConnectPage.guestsModule).toBeVisible();
    await this.elementActions.waitForTimeout(1000);
    await this.elementActions.clickElement(this.staffConnectPage.guestsModule);
    console.log('Verified guests section is displayed and clickable');
  }

  // Activities Section Methods
  async verifyActivitiesModuleAccessible() {
    await expect(this.activitiesModule).toBeVisible();
    await this.elementActions.waitForTimeout(10000);
    await this.elementActions.clickElement(this.activitiesModule);
    console.log('Verified activities section is displayed and clickable');
  }

  // Devices Section Methods
  async verifyDevicesSectionAccessible() {
    await expect(this.staffConnectPage.deviceModule).toBeVisible();
    await this.elementActions.waitForTimeout(1000);
    await this.elementActions.clickElement(this.staffConnectPage.deviceModule);
    console.log('Verified devices section is displayed and clickable');
  }

  async searchDevice(deviceId: string) {
    // Reuse the existing flow from StaffConnect.page.ts
    await expect(this.staffConnectPage.deviceSearchIcon).toBeVisible();
    await this.elementActions.clickElement(this.staffConnectPage.deviceSearchIcon);
    console.log('Clicked device search icon');

    await this.elementActions.fillElement(this.staffConnectPage.deviceSearchInput, deviceId);
    console.log(`Filled search input with device ID: ${deviceId}`);

    const createdDevice = this.page.locator(
      `(//tbody//tr)[1]//td//p[text()="${deviceId}"]`,
    );
    await expect(createdDevice).toBeVisible();
    console.log(`Device ${deviceId} found in search results`);
  }

  async verifyDeviceInList(deviceId: string) {
    const createdDevice = this.page.locator(
      `(//tbody//tr)[1]//td//p[text()="${deviceId}"]`,
    );
    await expect(createdDevice).toBeVisible();
    console.log(`Device ${deviceId} found in device list`);
  }

  async createSidecar(deviceName: string) {
    await this.sidecarPage.connectSidecar(deviceName);
    console.log(`Sidecar created with device name: ${deviceName}`);
  }

  async verifySidecarConnection() {
    await this.sidecarPage.verifySidecarConnection();
    console.log('Sidecar connection verified');
  }

  async getDeviceId(): Promise<string> {
    return this.sidecarPage.getSharedDeviceID();
  }

  // Delete device method - only implements delete functionality
  async deleteDevice(deviceId: string) {
    console.log('=== DELETE DEVICE METHOD STARTED ===');
    console.log(`Device ID to delete: ${deviceId}`);

    // 5. Find delete icon using the provided XPath
    const deleteIcon = this.page.locator(`//tbody//tr[.//p[text()="${deviceId}"]]//div[@class="ms-5 cursor-pointer"]//*[@xmlns="http://www.w3.org/2000/svg"]`);
    await expect(deleteIcon).toBeVisible({ timeout: 5000 });
    console.log('Delete icon found and visible');

    // 6. Scroll into view and click delete icon
    await this.elementActions.scrollIntoView(deleteIcon);
    await this.elementActions.clickElement(deleteIcon, { force: true });
    console.log(`Clicked delete icon for device: ${deviceId}`);

    // 7. Wait for confirm popup to appear
    await this.elementActions.waitForTimeout(1000);

    // 8. Click on confirm button
    await expect(this.confirmButton).toBeVisible({ timeout: 5000 });
    await this.elementActions.clickElement(this.confirmButton);
    console.log(`Clicked confirm button to delete device: ${deviceId}`);

    // Wait for deletion to complete
    await this.elementActions.waitForTimeout(2000);
    console.log('=== DELETE DEVICE METHOD COMPLETED ===');
  }

  // Complete Staff Connect Login Flow for Front Desk Admin
  async completeStaffConnectLogin(url: string, email: string, password: string, property: string) {
    await this.launchStaffConnectAndLogin(url, email);
    await this.enterStaffConnectPassword(password);
    await this.selectStaffConnectProperty(property);
    await this.verifyStaffConnectLogin();
    console.log('Staff Connect login completed successfully');
  }

  // Complete Sidecar Login Flow
  async completeSidecarLogin(url: string, email: string, password: string, property: string) {
    await this.launchSidecarAndLogin(url, email);
    await this.enterSidecarPassword(password);
    await this.selectSidecarProperty(property);
    console.log('Sidecar login completed successfully');
  }

  // =========================================
  // Test Scenario Methods
  // =========================================

  async verifyDeviceCreation(deviceName: string): Promise<string> {
    await this.createSidecar(deviceName);
    await this.verifySidecarConnection();
    const deviceId = await this.getDeviceId();
    console.log(`Device created with ID: ${deviceId}`);
    return deviceId;
  }

  async verifyDeviceSearch(deviceId: string) {
    await this.searchDevice(deviceId);
    console.log(`Device search verified for: ${deviceId}`);
  }

  async verifyDeviceDeletion(deviceId: string) {
    // Use the deleteDevice method which includes the full flow
    await this.deleteDevice(deviceId);

    // Verify device is NOT displayed after deletion
    await this.verifyDeviceNotDisplayed(deviceId);

    // Additional verification: Search with device ID and verify it's not displayed
    await this.elementActions.fillElement(this.staffConnectPage.deviceSearchInput, deviceId);
    await this.elementActions.waitForTimeout(1000);
    const deletedDevice = this.page.locator(
      `//tbody//tr//td//p[text()="${deviceId}"]`,
    );
    await expect(deletedDevice).not.toBeVisible({ timeout: 5000 });
    console.log(`Verified device ${deviceId} is not displayed when searched after deletion`);
  }

  async verifyDeviceNotDisplayed(deviceId: string) {
    // Clear search to see all devices
    await this.elementActions.fillElement(this.staffConnectPage.deviceSearchInput, '');
    await this.elementActions.waitForTimeout(1000);

    // Verify the deleted device is NOT displayed in the device list
    const deletedDevice = this.page.locator(
      `//tbody//tr//td//p[text()="${deviceId}"]`,
    );
    await expect(deletedDevice).not.toBeVisible({ timeout: 5000 });
    console.log(`Verified device ${deviceId} is not displayed after deletion`);
  }
}
