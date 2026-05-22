# AI-Powered Retail Analytics Platform

This is a production-style Retail Intelligence Platform for a consumer electronics retailer. It is built as a modern Next.js web application with enterprise BI workflows for sales, purchasing, inventory health, WIO benchmark risk, product intelligence, and AI-style decision support.

## What Is Included

- Executive Overview with KPI cards, trend charts, inventory health, WIO risk matrix, and AI brief.
- Separate modules for Sales Analytics, Purchase Analytics, Inventory Analytics, Brand Performance, Vendor Performance, Product Intelligence, Risk Center, AI Insights Center, and Alerts.
- Upload workflow for Sales, Purchase, and Inventory files.
- Excel and CSV support through SheetJS.
- Sheet detection and sheet selection.
- First 50 row preview.
- Header normalization and automatic column matching.
- Manual column mapping.
- Validation report before calculations.
- Blocking rules for missing critical fields, invalid numbers, empty critical values, and invalid WIO Benchmark.
- WIO calculations driven only by uploaded WIO Benchmark values.
- Large-data-friendly product table with range-based virtualization.
- Global filters for dates, brand, class, vendor, product code, description, WIO range, inventory status, and product velocity.
- Export actions for CSV, PDF, and screenshot.
- Demo records preloaded so the platform opens with a complete executive experience.
- Sample CSV files in `public/demo-data`.

## Important WIO Logic

The platform does not use hardcoded WIO benchmarks.

Inventory risk is calculated by comparing:

- Actual WIO, calculated from inventory quantity and sales velocity.
- Benchmark WIO, loaded from the uploaded inventory file.

The validation layer blocks inventory processing if the WIO Benchmark column is missing or contains invalid benchmark values.

## Install

Install Node.js 20 or newer from [nodejs.org](https://nodejs.org/).

Then open this folder in a terminal and run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build For Production

```bash
npm run build
npm run start
```

## Demo Data

The app opens with generated demo data. You can also upload the CSV samples:

- `public/demo-data/sales-demo.csv`
- `public/demo-data/purchase-demo.csv`
- `public/demo-data/inventory-demo.csv`

Use these to test the upload, sheet selection, mapping, validation, and processing flow.

## Expected Columns

The platform can automatically detect common variations of:

- Date
- PO Number
- Month
- Code
- Description
- Brand
- Qty
- Unit Cost
- Total
- Class
- Vendor ID
- Credit
- Due Date
- WIO Benchmark

If the uploaded column names are different, use the manual mapping controls in the upload cards.

## Architecture

```text
app/
  api/health/route.ts       Health endpoint for future monitoring
  api/validate/route.ts     Server-side validation endpoint for future ingestion jobs
  globals.css               Enterprise theme tokens and base styles
  layout.tsx                App shell metadata
  page.tsx                  Main platform UI and module routing
lib/
  analytics.ts              KPI, WIO, risk, ABC, trend, and AI insight logic
  export.ts                 CSV, PDF, and screenshot export helpers
  normalization.ts          Header cleanup, date/number parsing, row conversion
  sample-data.ts            Built-in demo records
  schema.ts                 Expected fields, aliases, required columns
  types.ts                  Shared platform types
  validation.ts             Data validation layer and blocking rules
public/demo-data/
  sales-demo.csv
  purchase-demo.csv
  inventory-demo.csv
```

## Future Expansion Points

The structure is prepared for:

- ERP integration
- SAP or Acumatica APIs
- Authentication and role-based access
- Scheduled reports
- Forecasting engine
- AI chatbot assistant
- Server-side validation for very large uploads
- Background processing queues

For 750,000+ row production files, the next recommended step is moving parsing and aggregation into server-side workers or a database-backed analytics layer while keeping the current UI and validation workflow.
