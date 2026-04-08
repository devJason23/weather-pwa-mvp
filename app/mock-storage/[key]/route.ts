import { createReadStream, existsSync } from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const filePath = path.join(process.cwd(), "storage", "uploads", key);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const stream = createReadStream(filePath);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "video/mp4"
    }
  });
}
