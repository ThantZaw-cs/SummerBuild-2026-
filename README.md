# CivicLens

> AI-powered civic infrastructure reporting platform built for SummerBuild 2026.

## Team

**Team Name:** The Musketeers

| Member | Role |
| --- | --- |
| Member 1 | Frontend Lead |
| Thant Zaw *(ThantZaw-cs)* | AI / Reka Integration |
| Member 3 | Backend & Database |
| Member 4 | Product & Research |

## Problem

Current civic reporting platforms are slow and frustrating for both citizens and agencies.

Citizen-side pain points:

- Reporting infrastructure issues takes too long
- Users often need to choose categories manually
- Reports vary wildly in clarity and detail
- Smaller issues are often never submitted

Agency-side pain points:

- Large report volumes still require manual review
- Duplicate submissions waste maintenance resources
- Urgency is difficult to assess consistently
- Unstructured data makes prioritization harder

## Solution

CivicLens reduces reporting friction to a simple flow:

1. Upload a photo or video
2. Enter a location
3. Write a short description
4. Submit

The platform then turns that simple input into structured maintenance data:

- Detect likely issue type
- Estimate severity
- Score authenticity
- Generate a professional maintenance report
- Prioritize what should be addressed first

## Project Status

The repository now includes the MVP skeleton for:

- Next.js App Router frontend
- TailwindCSS-based UI
- Landing page at `/`
- Submit page at `/submit`
- Dashboard page at `/dashboard`
- Report details page at `/reports/[id]`
- Shared navigation and reusable report components
- Mock data for dashboard and details screens

This base scaffold does not include real backend integration yet.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Starter Structure

```txt
app/
  dashboard/
    page.tsx
  reports/
    [id]/
      page.tsx
  submit/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  Navbar.tsx
  ReportCard.tsx
  ReportForm.tsx
  SeverityBadge.tsx
lib/
  mockReports.ts
```

## Next Steps

- Add real form handling
- Introduce backend routes when the UI flow is stable
- Connect persistent storage after the base experience feels right
