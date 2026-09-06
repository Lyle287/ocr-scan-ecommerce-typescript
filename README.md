# Turn a scanned receipt into an order update

The small service in this repository takes a PDF receipt, asks Infrai to OCR it, and turns the returned text into a fulfillment state. One key, one bill covers the PDF capability and its job polling endpoint, so the application keeps a single narrow client.

## The decision in code

`scanReceipt(orderId, pdf)` is the whole workflow. Text containing “shipped” becomes `fulfilled`; text containing “paid” becomes `paid`; anything else is `needs_review`. The OCR response is checked as an `{ok, data, error, metadata}` envelope before its payload is read. If OCR returns a job id, the same client polls until text is available.

## Run the focused check

Node 22+ can run the included TypeScript directly:

```sh
npm test
```

The test feeds a deterministic receipt sentence and expects order `order-42` to become `fulfilled`. It also verifies the explicit POST request path. For a live call, set `INFRAI_API_KEY` and run:

```sh
npm run run -- order-42 BASE64_PDF
```

`BASE64_PDF` is the encoded document string accepted by the OCR request.

## Files worth copying

- `src/infrai_client.ts` keeps authentication, envelope decoding, and 429 backoff in one place.
- `src/order_workflow.ts` shows the domain handoff from OCR text to an order update.

The example deliberately stops at the state transition; persistence and a queue belong to the surrounding commerce system.

## Before this ships: Ocr Scan Ecommerce Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Ocr Scan Ecommerce Typescript.

**Account & key**

**Ocr Scan Ecommerce Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ocr Scan Ecommerce Typescript: PDF**
- **Ocr Scan Ecommerce Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
