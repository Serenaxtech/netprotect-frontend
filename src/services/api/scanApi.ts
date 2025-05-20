const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ScanResult {
  scanName: string;
  scanResult: any;
  agentId: string;
  scanDate: string;
}

export class ScanApiService {
  static async getLatestScanResult(agentId: string): Promise<ScanResult> {
    const response = await fetch(`${API_BASE_URL}/scan/agent/${agentId}/latest`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scan results');
    }

    const result = await response.json();
    return result.scan_result;
  }

  static async getAllScanResults(agentId: string): Promise<ScanResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/scan/agent/${agentId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scan results');
      }

      const result = await response.json();
      return result.scan_results;
    } catch (error) {
      console.error('Error fetching scan results:', error);
      throw error;
    }
  }
}