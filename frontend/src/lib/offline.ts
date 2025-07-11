interface OfflineData {
  id: string;
  type: "wildlife_report" | "research_data" | "patrol_update";
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineManager {
  private dbName = "rwanda-eco-offline";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("offline_data")) {
          const store = db.createObjectStore("offline_data", { keyPath: "id" });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("synced", "synced", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async storeData(type: OfflineData["type"], data: any): Promise<string> {
    if (!this.db) await this.init();

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_data"], "readwrite");
      const store = transaction.objectStore("offline_data");
      const request = store.add(offlineData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(id);
    });
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_data"], "readonly");
      const store = transaction.objectStore("offline_data");
      const index = store.index("synced");
      const request = index.getAll(false);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_data"], "readwrite");
      const store = transaction.objectStore("offline_data");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          reject(new Error("Data not found"));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async syncToCloud(): Promise<void> {
    const unsyncedData = await this.getUnsyncedData();

    for (const item of unsyncedData) {
      try {
        // Simulate API sync - in real app, this would make actual API calls
        await this.simulateCloudSync(item);
        await this.markAsSynced(item.id);
        console.log(`Synced ${item.type} data to cloud:`, item.id);
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
      }
    }
  }

  private async simulateCloudSync(data: OfflineData): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would make HTTP requests to your API
    console.log("Syncing to cloud:", data);
  }
}

export const offlineManager = new OfflineManager();

import React from "react";

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically sync when coming back online
      offlineManager.syncToCloud();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

// Initialize offline manager
if (typeof window !== "undefined") {
  offlineManager.init().catch(console.error);
}
