# Mizan

Hadith search and WhatsApp formatting app using the Mizan Alhekmah database in Supabase.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `VITE_SUPABASE_ANON_KEY` in `.env.local` to the project's public anon/publishable key. The app uses this key only for read-only searches protected by Supabase Row Level Security.

## Supabase setup and data import

1. In the Supabase SQL Editor, run [`supabase/migrations/20261016000000_create_hadiths.sql`](./supabase/migrations/20261016000000_create_hadiths.sql), then run each newer migration in `supabase/migrations/` in filename order.
2. Keep the source workbook at `public/pdfs/Mizan_Hadith_Sheet_All4.xlsx`. It is git-ignored and is not published with the app.
3. Add the project's `service_role` key to `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Never add this key to a `VITE_` variable or commit it.
4. Run `npm run import:hadiths`. The importer validates the workbook, imports records in batches, and removes rows from older dataset versions after a successful import.
5. Remove the service-role key from `.env.local` when the import is finished. Normal app searches use only the anon key.

The importer reads the `Hadiths` worksheet and requires `ID`, `Topic`, `Hadith`, and `Source`. It also imports `Narrator`, `Volume`, and `PDF page` when present. Search returns up to 100 best matches and reports the total match count.

To preview a hadith's source page in the app, keep the four book PDFs in `public/pdfs/` named `Part 1.pdf`, `Part 2.pdf`, `Part 3.pdf`, and `Part 4.pdf`. The `Volume` value selects the PDF, and `PDF page` is treated as the PDF viewer page number. Search results and the daily hadith show an in-app preview button when both values are valid. The app renders that exact PDF page as an in-app snapshot, including on mobile devices; the original PDF can still be opened separately.

The topic filter is an autocomplete index that suggests matching topics as you type. The daily hadith is selected deterministically from the current local date, so it stays the same during that day and changes the following day. WhatsApp formats the title with asterisks for bold text.

WhatsApp messages include the narrator line when available, bold the hadith text, and display the source and bold community signature with its group invitation. The shared formatter applies to both search results and the daily hadith.

## GitHub Pages

The included GitHub Actions workflow builds and deploys the `main` branch to GitHub Pages. Configure the repository secret `VITE_SUPABASE_ANON_KEY` before deploying. In repository Settings → Pages, select GitHub Actions as the build and deployment source.

Noor Al-Hawza remains an optional manual verification link; the app does not scrape or automate it.
