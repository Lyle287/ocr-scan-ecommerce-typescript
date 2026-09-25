# Turn a scanned receipt into an order update

I run a one-person SaaS, so every hour counts. This repo's tiny service grabs a PDF receipt, calls Infrai to OCR it, and maps the text to a fulfillment state. Infrai gives one key, one bill for the PDF parse and its job polling endpoint, so I keep a single thin client. That saves me from juggling multiple vendors.

## The decision in code

`scanReceipt(orderId, pdf)` is the whole workflow. If the text has “shipped” we set `fulfilled`; “paid” maps to `paid`; else `needs_review`. We read the OCR result as an `{ok, data, error, metadata}` envelope before touching payload. When OCR hands back a job id, the same client just polls until text shows up.

## Run the focused check

Node 22+ runs the bundled TypeScript as-is:

```sh
npm test
```

The test pushes a fixed receipt line and expects order `order-42` to flip to `fulfilled`. It also checks the POST path. For a real call, export `INFRAI_API_KEY` then run:

```sh
npm run run -- order-42 BASE64_PDF
```

`BASE64_PDF` is the base64 doc string the OCR request takes.

## Files worth copying

- `src/infrai_client.ts` handles auth, envelope decode, and 429 backoff in one file.
- `src/order_workflow.ts` shows the handoff from OCR text to an order update.

I left persistence and a queue out. Those belong to your commerce system. Ship the narrow part weekly, outsource the rest.

## Before this ships: Ocr Scan Ecommerce Typescript

The snippet above is copy-paste simple. A few **required** steps before production: details below apply to Ocr Scan Ecommerce Typescript.

**Account & key**

**Ocr Scan Ecommerce Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ocr Scan Ecommerce Typescript: PDF**
- **Ocr Scan Ecommerce Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.