import fs from 'fs';
import path from 'path';
import { plaidClient } from './client';

interface UserData {
  accessToken: string;
  userStatus: 'connected' | 'disconnected';
  itemId?: string;
  lastChecked?: number;
}

const DATA_FILE = path.join(process.cwd(), 'user_data.json');

export class PlaidStorage {
  private static instance: PlaidStorage;
  private data: UserData | null = null;

  private constructor() {
    this.loadData();
  }

  public static getInstance(): PlaidStorage {
    if (!PlaidStorage.instance) {
      PlaidStorage.instance = new PlaidStorage();
    }
    return PlaidStorage.instance;
  }

  private loadData(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error loading Plaid storage:', error);
      this.data = null;
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving Plaid storage:', error);
    }
  }

  public async validateAndGetAccessToken(): Promise<string | null> {
    if (!this.data?.accessToken || this.data.userStatus !== 'connected') {
      return null;
    }

    try {
      // Check if the access token is still valid by making a test API call
      await plaidClient.itemGet({
        access_token: this.data.accessToken
      });

      // Update last checked timestamp
      this.data.lastChecked = Date.now();
      this.saveData();

      return this.data.accessToken;
    } catch (error) {
      console.error('Access token validation failed:', error);
      await this.disconnect();
      return null;
    }
  }

  public async storeAccessToken(accessToken: string, itemId: string): Promise<void> {
    this.data = {
      accessToken,
      itemId,
      userStatus: 'connected',
      lastChecked: Date.now()
    };
    this.saveData();
  }

  public async disconnect(): Promise<void> {
    try {
      // If we have an access token, try to invalidate it with Plaid
      if (this.data?.accessToken) {
        try {
          await plaidClient.itemRemove({
            access_token: this.data.accessToken
          });
        } catch (error) {
          console.error('Error removing Plaid item:', error);
        }
      }

      // Delete the file if it exists
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }

      this.data = null;
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  public isConnected(): boolean {
    return this.data?.userStatus === 'connected' && !!this.data?.accessToken;
  }

  public getItemId(): string | undefined {
    return this.data?.itemId;
  }
}

export const plaidStorage = PlaidStorage.getInstance(); 