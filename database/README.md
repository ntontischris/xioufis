# Database SQL Scripts

## Σειρά Εκτέλεσης στο Supabase

Πήγαινε στο **Supabase Dashboard → Database → SQL Editor → New Query**

Τρέξε τα αρχεία με τη σειρά:

| # | Αρχείο | Περιγραφή |
|---|--------|-----------|
| 01 | `01_citizens_table.sql` | Πίνακας Πολιτών |
| 02 | `02_user_profiles_table.sql` | Πίνακας Προφίλ Χρηστών |
| 03 | `03_requests_table.sql` | Πίνακας Αιτημάτων |
| 04 | `04_communications_table.sql` | Πίνακας Επικοινωνιών |
| 05 | `05_military_personnel_table.sql` | Πίνακας Στρατιωτικού Προσωπικού |
| 06 | `06_triggers_updated_at.sql` | Triggers για timestamps |
| 07 | `07_trigger_military_auto_create.sql` | Auto-create citizen για military |
| 08 | `08_trigger_citizen_sync.sql` | Sync citizen → military |
| 09 | `09_enable_rls.sql` | Enable Row Level Security |
| 10 | `10_rls_citizens.sql` | RLS πολιτικές για Citizens |
| 11 | `11_rls_requests.sql` | RLS πολιτικές για Requests |
| 12 | `12_rls_communications.sql` | RLS πολιτικές για Communications |
| 13 | `13_rls_military.sql` | RLS πολιτικές για Military |
| 14 | `14_rls_user_profiles.sql` | RLS πολιτικές για Profiles |

## Μετά την εκτέλεση

1. Πήγαινε στο **Database → Replication**
2. Ενεργοποίησε Real-time για:
   - `citizens`
   - `requests`
   - `communications`
   - `military_personnel`

## Reset Database (Προσοχή!)

Αν θέλεις να διαγράψεις τα πάντα και να ξεκινήσεις από την αρχή:

```sql
-- ΠΡΟΣΟΧΗ: Διαγράφει ΟΛΑ τα δεδομένα!
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS military_personnel CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS auto_set_completion_date CASCADE;
DROP FUNCTION IF EXISTS auto_create_citizen_for_military CASCADE;
DROP FUNCTION IF EXISTS sync_citizen_to_military CASCADE;
DROP FUNCTION IF EXISTS get_user_role CASCADE;
```
