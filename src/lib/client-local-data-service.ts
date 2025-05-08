// src/lib/client-local-data-service.ts
"use client"; 

import { LocalDataService } from './local-data-service';
import type { IDataService } from './data-service-interface';

let instance: IDataService | null = null;

export function getClientLocalDataService(): IDataService {
    if (typeof window === 'undefined') {
        // This function is intended for client-side use only.
        // If called from the server, it indicates a logical error in how it's being invoked.
        console.error("getClientLocalDataService was called from the server. This is not supported.");
        throw new Error("getClientLocalDataService cannot be called from the server. It relies on browser localStorage.");
    }
    if (!instance) {
        instance = new LocalDataService();
    }
    return instance;
}
