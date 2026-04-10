import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { rm } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { LOCAL_UPLOAD_DIRECTORY } from "@/lib/config";

export type StoredAsset = {
  storageKey: string;
  url: string;
  sizeBytes: number;
  contentType: string;
  originalFileName: string;
};

export interface StorageDriver {
  save(file: File): Promise<StoredAsset>;
  remove(storageKey: string): Promise<void>;
}

class LocalStorageDriver implements StorageDriver {
  private root = path.join(process.cwd(), LOCAL_UPLOAD_DIRECTORY);

  async save(file: File): Promise<StoredAsset> {
    await mkdir(this.root, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
    const fullPath = path.join(this.root, safeName);
    const writeStream = createWriteStream(fullPath);
    await pipeline(Readable.fromWeb(file.stream() as never), writeStream);

    return {
      storageKey: safeName,
      url: `/mock-storage/${safeName}`,
      sizeBytes: file.size,
      contentType: file.type || "video/mp4",
      originalFileName: file.name
    };
  }

  async remove(storageKey: string): Promise<void> {
    const fullPath = path.join(this.root, storageKey);
    await rm(fullPath, { force: true });
  }
}

export const storageDriver: StorageDriver = new LocalStorageDriver();
