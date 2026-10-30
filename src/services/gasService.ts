/**
 * Google Apps Script Web App Integration Service
 * Connects frontend PWA with backend Google Apps Script and Google Sheets
 * Spreadsheet ID: 1hMjeyC_Xizwj3ca67dGR0To1oGJGTw3VivFnT_o-76A
 */

import { storage } from './storage';

export interface GasResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class GasService {
  /**
   * Test connection to deployed Google Apps Script Web App
   */
  public static async testConnection(scriptUrl: string): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: unknown;
  }> {
    if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'Invalid URL. Must start with https://script.google.com/macros/s/.../exec'
      };
    }

    const startTime = Date.now();
    try {
      // Use mode 'cors' or fallback to no-cors check
      const testEndpoint = `${scriptUrl}?action=ping&t=${Date.now()}`;
      
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          latencyMs,
          message: `Server returned HTTP ${response.status}: ${response.statusText}`
        };
      }

      const json = await response.json();
      return {
        success: true,
        latencyMs,
        message: json.message || 'Connected successfully to Google Apps Script!',
        details: json
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      // Note on Google Apps Script CORS:
      // Google Apps Script redirect can sometimes trigger CORS in simple browser fetch if ContentService.MimeType is not TEXT/JSON.
      return {
        success: false,
        latencyMs,
        message: `Connection failed: ${errorMsg}. Please ensure Google Apps Script Web App is deployed with 'Execute as: Me' and 'Who has access: Anyone'.`
      };
    }
  }

  /**
   * Post action to Google Apps Script Web App
   */
  public static async sendToGas(
    action: string,
    payload: Record<string, unknown>
  ): Promise<GasResponse> {
    const settings = storage.getSettings();
    if (!settings.appsScriptUrl) {
      return {
        success: false,
        message: 'Google Apps Script URL is not configured. Using local persistence.'
      };
    }

    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // GAS handles text/plain without CORS preflight issues
        },
        body: JSON.stringify({
          action,
          payload,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const resJson = await response.json();
      return resJson;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Google Apps Script call failed:', msg);
      return {
        success: false,
        message: msg
      };
    }
  }

  /**
   * Sync complete local state to Google Sheets via GAS
   */
  public static async syncAllToGoogleSheets(): Promise<{
    success: boolean;
    message: string;
  }> {
    const settings = storage.getSettings();
    if (!settings.appsScriptUrl) {
      return {
        success: false,
        message: 'Please set your Google Apps Script Web App URL first in Settings.'
      };
    }

    const payload = {
      spreadsheetId: settings.spreadsheetId,
      customers: storage.getCustomers('ALL'),
      transactions: storage.getTransactions({ team: 'ALL' }),
      settings: storage.getSettings()
    };

    const res = await this.sendToGas('SYNC_BULK_DATA', payload);
    return {
      success: res.success,
      message: res.message || (res.success ? 'Synced successfully to Google Sheets!' : 'Sync failed.')
    };
  }
}
