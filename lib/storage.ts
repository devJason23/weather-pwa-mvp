import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type StoredAsset = {
  storageKey: string;
  url: string;
  sizeBytes: number;
  contentType: string;
  originalFileName: string;
};

export interface StorageDriver {
  save(file: File): Promise<StoredAsset>;
}

class LocalStorageDriver implements StorageDriver {
  private root = path.join(process.cwd(), "storage", "uploads");

  async save(file: File): Promise<StoredAsset> {
    await mkdir(this.root, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
    const fullPath = path.join(this.root, safeName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, bytes);

    return {
      storageKey: safeName,
      url: `/mock-storage/${safeName}`,
      sizeBytes: bytes.byteLength,
      contentType: file.type || "video/mp4",
      originalFileName: file.name
    };
  }
}

export const storageDriver: StorageDriver = new LocalStorageDriver();
