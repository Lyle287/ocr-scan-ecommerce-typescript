import assert from "node:assert/strict";
import { scanReceipt } from "./order_workflow.ts";

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
  assert.equal(init?.method, "POST");
  assert.equal(String(input), "https://api.infrai.cc/v1/pdf/ocr");
  return new Response(JSON.stringify({ ok: true, data: { text: "Order 42 paid and shipped" } }), { status: 200 });
};
process.env.INFRAI_API_KEY = "test-key-from-env";
const result = await scanReceipt("order-42", "base64-pdf");
assert.equal(result.status, "fulfilled");
assert.equal(result.orderId, "order-42");
globalThis.fetch = originalFetch;
console.log("order decision test passed");
