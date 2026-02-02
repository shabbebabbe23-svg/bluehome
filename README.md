# BaraHem

Sveriges modernaste fastighetsplattform.

🌐 **Webbplats**: [barahem.se](https://barahem.se)

## Om projektet

BaraHem är en fastighetsplattform där köpare kan hitta sitt drömhem och mäklare kan marknadsföra sina objekt.

## Teknologier

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Hosting**: Vercel

## Kom igång

```bash
# Installera dependencies
npm install

# Starta utvecklingsserver
npm run dev
```

Appen körs på `http://localhost:8080`

## Miljövariabler

Skapa en `.env.local` fil med:

```env
VITE_SUPABASE_URL=din-supabase-url
VITE_SUPABASE_ANON_KEY=din-supabase-anon-key
```

## Deploy

Projektet deployas automatiskt till Vercel vid push till main-branchen.

## Licens

Proprietär - Alla rättigheter förbehållna.
