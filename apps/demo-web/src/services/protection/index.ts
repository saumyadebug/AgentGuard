import type { IProtectionService } from './IProtectionService';
import { MockProtectionService } from './MockProtectionService';
import { HttpProtectionService } from './HttpProtectionService';

export type * from './IProtectionService';
export * from './MockProtectionService';
export * from './HttpProtectionService';

let mockInstance: MockProtectionService | null = null;
let httpInstance: HttpProtectionService | null = null;

export function getProtectionService(mode: 'mock' | 'live'): IProtectionService {
  if (mode === 'live') {
    if (!httpInstance) {
      httpInstance = new HttpProtectionService();
    }
    return httpInstance;
  }
  
  if (!mockInstance) {
    mockInstance = new MockProtectionService();
  }
  return mockInstance;
}
