import { get, post } from "./infrai_client.ts";
import { z } from "zod";

const receiptRequest = z.object({ orderId: z.string().min(1), pdf: z.string().min(1) });

export type OrderUpdate = { orderId: string; status: "paid" | "fulfilled" | "needs_review"; searchableText: string };
type OcrResult = { text?: string; job_id?: string; id?: string };
type JobResult = { status?: string; text?: string; result?: { text?: string } };

function textFrom(value: OcrResult | JobResult): string {
  return value.text ?? ("result" in value ? value.result?.text : undefined) ?? "";
}

export async function scanReceipt(orderId: string, pdf: string): Promise<OrderUpdate> {
  receiptRequest.parse({ orderId, pdf });
  const first = await post<OcrResult>("/v1/pdf/ocr", { pdf, lang: "eng", quality: "balanced" });
  let searchableText = textFrom(first);
  if (!searchableText && first.job_id) {
    for (let i = 0; i < 6; i++) {
      const job = await get<JobResult>(`/v1/pdf/job/get/${encodeURIComponent(first.job_id)}`);
      searchableText = textFrom(job);
      if (job.status === "completed" || searchableText) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
    }
  }
  const normalized = searchableText.toLowerCase();
  const status = normalized.includes("shipped") ? "fulfilled" : normalized.includes("paid") ? "paid" : "needs_review";
  return { orderId, status, searchableText };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [orderId, pdf] = process.argv.slice(2);
  if (!orderId || !pdf) throw new Error("usage: npm run run -- ORDER_ID PDF_DATA");
  scanReceipt(orderId, pdf).then((update) => console.log(JSON.stringify(update, null, 2))).catch((error) => { console.error(error); process.exitCode = 1; });
}
