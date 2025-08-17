Mini Seller Console (React + Tailwind)
Goal: Build a lightweight console to triage Leads and convert them into Opportunities. You can use an
AI co-pilot, we encourage dev’s to do so, but what we are assessing on is the structure and quality.
Requirements (MVP)
1. Leads List
○ Load from a local JSON fil
○ Fields: id, name, company, email, source, score, status.
○ Features: search (name/company), filter (status), sort (score desc
2. Lead Detail Panel
○ Click a row to open a slide-over panel.
○ Inline edit status and email (validate email format).
○ Save/cancel actions with basic error handling.
3. Convert to Opportunity
○ Button: Convert Lead.
○ Create an Opportunity with: id, name, stage, amount (optional), accountName.
○ Show Opportunities in a simple table.
4. UX/States
○ Loading, empty, and simple error states.
○ Handle ~100 leads smoothly.
Nice-to-Haves (pick 1–2)
● Persist filter/sort in localStorag
● Optimistic updates with a rollback on simulated failure.
● Responsive layout (desktop → mobile).
Tech Constraints
● React (Vite or CRA) + Tailwind CSS.
● No backend required; use local JSON and setTimeout to simulate latency.