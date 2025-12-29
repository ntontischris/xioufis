# CLAUDE.md

## Project Overview

Political CRM System built with Next.js 14 (App Router) and Supabase.
Manages citizens, requests, communications, and military personnel for a political office in Greece.

## Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## Key Conventions

### Database
- All column names in **ENGLISH**
- All UI labels in **GREEK** (see `src/lib/utils/constants.ts`)
- Real-time subscriptions for all list views

### File Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (organized by feature)
- `src/lib/` - Utilities, hooks, Supabase clients
- `src/types/` - TypeScript definitions

## Commands

```bash
# Development
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint

# Supabase
npx supabase login
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

## Supabase Setup

1. Create project at supabase.com
2. Run SQL schema from `NEXTJS_SUPABASE_CRM_MASTER_PROMPT.md`
3. Enable RLS and create policies
4. Enable Real-time for tables: citizens, requests, communications, military_personnel
5. Copy URL and anon key to `.env.local`

## Important Patterns

### Real-time Hooks
All list components use custom hooks with Supabase subscriptions:
```typescript
// Example: src/lib/hooks/useCitizens.ts
const channel = supabase
  .channel('citizens-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, callback)
  .subscribe()
```

### Server Actions
Use for mutations (create, update, delete) - located in `src/lib/actions/`

### Greek Validation
Phone numbers must match Greek format: `^(\+30)?[2-9][0-9]{9}$`

### Conditional Fields
Military form shows different fields based on type (CONSCRIPT vs PERMANENT)

## Greek Labels Reference

All labels are in `src/lib/utils/constants.ts`:
- `LABELS` - Field name translations
- `MUNICIPALITY_OPTIONS` - Municipality dropdown
- `REQUEST_CATEGORY_OPTIONS` - Request categories
- `REQUEST_STATUS_OPTIONS` - Status with colors
- `MILITARY_TYPE_OPTIONS` - Military type

## Business Rules

1. **Citizen:** Must have at least one contact (mobile, landline, or email)
2. **Request:** Completion date auto-set when status = COMPLETED
3. **Military:** Auto-creates linked Citizen if none exists
4. **Sync:** Citizen ↔ Military data stays in sync via database triggers

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Development Notes

- Primary color: Indigo (#6366F1)
- Dark mode: Supported via Tailwind
- Icons: Lucide React
- All dates in Greek format (DD/MM/YYYY)
