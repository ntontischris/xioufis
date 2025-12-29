# 🚀 MASTER PROMPT: Political CRM με Next.js + Supabase

## Οδηγίες Χρήσης
Κάνε copy-paste ολόκληρο αυτό το αρχείο στο πρώτο μήνυμα ενός νέου Claude Code session.

---

# PROJECT BRIEF

## Τι Θέλω να Φτιάξεις

Ένα **Political CRM System** με Next.js 14+ (App Router) και Supabase backend. Το σύστημα διαχειρίζεται πολίτες, αιτήματα, επικοινωνίες και στρατιωτικό προσωπικό για πολιτικό γραφείο στην Ελλάδα.

**ΚΡΙΣΙΜΟ:**
- Database columns σε **ENGLISH** (για αποφυγή encoding issues)
- UI labels σε **ΕΛΛΗΝΙΚΑ**
- Real-time updates σε όλα τα components
- Modern glassmorphism UI design

---

# COMPLETE DATABASE SCHEMA

## 1. Citizens Table (Πολίτες)

```sql
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  surname VARCHAR(100) NOT NULL,           -- επίθετο
  first_name VARCHAR(100) NOT NULL,        -- όνομα
  father_name VARCHAR(100),                -- πατρώνυμο
  referral_source VARCHAR(200),            -- σύσταση από

  -- Contact
  mobile VARCHAR(15),                       -- κινητό (format: 69xxxxxxxx ή +3069xxxxxxxx)
  landline VARCHAR(15),                     -- σταθερό
  email VARCHAR(255),

  -- Address
  address TEXT,                             -- διεύθυνση
  postal_code VARCHAR(5),                   -- Τ.Κ.
  area VARCHAR(100),                        -- περιοχή
  municipality VARCHAR(50),                 -- δήμος (enum: see below)

  -- Electoral
  electoral_district VARCHAR(50),           -- εκλογική περιφέρεια (enum: see below)

  -- Classification
  contact_category VARCHAR(20) DEFAULT 'GDPR',  -- κατηγορία επαφής
  profession VARCHAR(100),                  -- ιδιότητα

  -- Management
  assigned_user_id UUID REFERENCES auth.users(id),  -- αρμόδιος συνεργάτης
  notes TEXT,                               -- παρατηρήσεις

  -- Soft Delete
  is_active BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_contact CHECK (
    mobile IS NOT NULL OR landline IS NOT NULL OR email IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_citizens_surname_name ON citizens(surname, first_name);
CREATE INDEX idx_citizens_municipality ON citizens(municipality);
CREATE INDEX idx_citizens_electoral ON citizens(electoral_district);
CREATE INDEX idx_citizens_active ON citizens(is_active) WHERE is_active = true;
CREATE INDEX idx_citizens_assigned ON citizens(assigned_user_id);
```

### Municipality Enum Values (δήμος):
- `THESSALONIKI` → Θεσσαλονίκη
- `KALAMARIA` → Καλαμαριά
- `PAVLOS_MELAS` → Παύλος Μελάς
- `KORDELIO_EVOSMOS` → Κορδελιό-Εύοσμος
- `AMPELOKIPOI_MENEMENI` → Αμπελόκηποι-Μενεμένη
- `NEAPOLI_SYKIES` → Νεάπολη-Συκιές
- `OTHER` → Άλλος

### Electoral District Enum Values (εκλογική περιφέρεια):
- `THESSALONIKI_A` → Α' Θεσσαλονίκης
- `THESSALONIKI_B` → Β' Θεσσαλονίκης
- `OTHER` → Άλλη

### Contact Category Enum Values:
- `GDPR` → GDPR
- `REQUEST` → Αίτημα
- `BOTH` → GDPR & Αίτημα

---

## 2. Requests Table (Αιτήματα)

```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,

  -- Request Details
  category VARCHAR(50) NOT NULL,            -- κατηγορία αιτήματος (enum: see below)
  status VARCHAR(20) DEFAULT 'PENDING',     -- κατάσταση (enum: see below)
  request_text TEXT,                        -- κείμενο αιτήματος
  notes TEXT,                               -- παρατηρήσεις

  -- Dates
  submitted_at DATE DEFAULT CURRENT_DATE,   -- ημερομηνία αποστολής
  completed_at DATE,                        -- ημερομηνία ολοκλήρωσης

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT completion_date_valid CHECK (
    completed_at IS NULL OR completed_at >= submitted_at
  ),
  CONSTRAINT completion_required_when_done CHECK (
    status != 'COMPLETED' OR completed_at IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_requests_citizen ON requests(citizen_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_submitted ON requests(submitted_at DESC);
CREATE INDEX idx_requests_pending ON requests(status, submitted_at)
  WHERE status = 'PENDING';
```

### Request Category Enum Values:
- `MILITARY` → Στρατιωτικό
- `MEDICAL` → Ιατρικό
- `POLICE` → Αστυνομικό
- `FIRE_DEPARTMENT` → Πυροσβεστική
- `EDUCATION` → Παιδείας
- `ADMINISTRATIVE` → Διοικητικό
- `JOB_SEARCH` → Εύρεση Εργασίας
- `SOCIAL_SECURITY` → ΕΦΚΑ
- `OTHER` → Άλλο

### Request Status Enum Values:
- `COMPLETED` → Ολοκληρωμένο
- `PENDING` → Εκκρεμεί
- `NOT_COMPLETED` → Μη Ολοκληρωμένο

---

## 3. Communications Table (Επικοινωνίες)

```sql
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,

  -- Communication Details
  communication_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- ημερομηνία επικοινωνίας
  comm_type VARCHAR(20) NOT NULL,           -- τύπος (enum: see below)
  notes TEXT,                               -- σημειώσεις

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communications_citizen ON communications(citizen_id);
CREATE INDEX idx_communications_date ON communications(communication_date DESC);
CREATE INDEX idx_communications_type ON communications(comm_type);
```

### Communication Type Enum Values:
- `PHONE` → Τηλέφωνο
- `EMAIL` → Email
- `IN_PERSON` → Προσωπική
- `SMS` → SMS
- `OTHER` → Άλλο

---

## 4. Military Personnel Table (Στρατιωτικό Προσωπικό)

```sql
CREATE TABLE military_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- One-to-One with Citizen
  citizen_id UUID UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,

  -- Type
  military_type VARCHAR(20) NOT NULL,       -- τύπος: CONSCRIPT (στρατιώτης) ή PERMANENT (μόνιμος)

  -- Basic Info (synced with Citizen)
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mobile VARCHAR(15),
  email VARCHAR(255),

  -- Conscript-specific fields (ΣΤΡΑΤΙΩΤΗΣ)
  esso_year INTEGER,                        -- ΕΣΣΟ έτος (π.χ. 2025)
  esso_letter VARCHAR(1),                   -- ΕΣΣΟ γράμμα (Α, Β, Γ, Δ, Ε)
  military_number VARCHAR(50),              -- ΑΣΜ
  conscript_wish TEXT,                      -- επιθυμία στρατιώτη
  training_center VARCHAR(100),             -- κέντρο εκπαίδευσης
  presentation_date DATE,                   -- ημερομηνία παρουσίασης
  assignment VARCHAR(200),                  -- τοποθέτηση
  assignment_date DATE,                     -- ημερομηνία τοποθέτησης
  transfer TEXT,                            -- μετάθεση/απόσπαση
  transfer_date DATE,                       -- ημερομηνία μετάθεσης

  -- Permanent-specific fields (ΜΟΝΙΜΟΣ)
  rank VARCHAR(50),                         -- βαθμός
  service_unit VARCHAR(200),                -- μονάδα υπηρεσίας
  permanent_wish TEXT,                      -- επιθυμία μόνιμου
  service_number VARCHAR(50),               -- ΑΜ

  -- Common
  notes TEXT,                               -- παρατηρήσεις
  assigned_user_id UUID REFERENCES auth.users(id),

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_contact_military CHECK (
    mobile IS NOT NULL OR email IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_military_citizen ON military_personnel(citizen_id);
CREATE INDEX idx_military_type ON military_personnel(military_type);
CREATE INDEX idx_military_esso ON military_personnel(esso_year, esso_letter);
CREATE INDEX idx_military_rank ON military_personnel(rank);
```

### Military Type Enum Values:
- `CONSCRIPT` → Στρατιώτης
- `PERMANENT` → Μόνιμος

### ΕΣΣΟ Letter Values:
- `Α`, `Β`, `Γ`, `Δ`, `Ε`

---

## 5. User Profiles Table (Προφίλ Χρηστών)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  full_name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'REGULAR',       -- SUPERADMIN, ADMIN, REGULAR

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_profiles_role ON user_profiles(role);
```

### User Role Enum Values:
- `SUPERADMIN` → Full access, can manage admins
- `ADMIN` → Can manage regular users, full CRUD
- `REGULAR` → Limited access based on assignment

---

## 6. Database Triggers (Αντί Django Signals)

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER citizens_updated_at
  BEFORE UPDATE ON citizens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER military_updated_at
  BEFORE UPDATE ON military_personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-set completion date when status becomes COMPLETED
CREATE OR REPLACE FUNCTION auto_set_completion_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_auto_complete
  BEFORE INSERT OR UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION auto_set_completion_date();

-- Auto-create citizen when military personnel is created without citizen
CREATE OR REPLACE FUNCTION auto_create_citizen_for_military()
RETURNS TRIGGER AS $$
DECLARE
  new_citizen_id UUID;
BEGIN
  IF NEW.citizen_id IS NULL THEN
    INSERT INTO citizens (surname, first_name, father_name, mobile, email, profession, contact_category, assigned_user_id)
    VALUES (NEW.surname, NEW.first_name, NEW.father_name, NEW.mobile, NEW.email, 'Στρατιωτικό Προσωπικό', 'GDPR', NEW.assigned_user_id)
    RETURNING id INTO new_citizen_id;

    NEW.citizen_id = new_citizen_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER military_auto_create_citizen
  BEFORE INSERT ON military_personnel
  FOR EACH ROW EXECUTE FUNCTION auto_create_citizen_for_military();

-- Sync citizen to military personnel
CREATE OR REPLACE FUNCTION sync_citizen_to_military()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE military_personnel
  SET
    surname = NEW.surname,
    first_name = NEW.first_name,
    father_name = NEW.father_name,
    mobile = NEW.mobile,
    email = NEW.email,
    updated_at = NOW()
  WHERE citizen_id = NEW.id
    AND (surname != NEW.surname
      OR first_name != NEW.first_name
      OR COALESCE(father_name, '') != COALESCE(NEW.father_name, '')
      OR COALESCE(mobile, '') != COALESCE(NEW.mobile, '')
      OR COALESCE(email, '') != COALESCE(NEW.email, ''));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER citizen_sync_to_military
  AFTER UPDATE ON citizens
  FOR EACH ROW EXECUTE FUNCTION sync_citizen_to_military();
```

---

## 7. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Citizens policies
CREATE POLICY "Citizens: Authenticated can read" ON citizens
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Citizens: Admins can insert" ON citizens
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

CREATE POLICY "Citizens: Admins can update" ON citizens
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

CREATE POLICY "Citizens: Only superadmin can delete" ON citizens
  FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');

-- Requests policies
CREATE POLICY "Requests: Authenticated can read" ON requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Requests: Authenticated can insert" ON requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Requests: Authenticated can update" ON requests
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Requests: Admins can delete" ON requests
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- Communications policies
CREATE POLICY "Communications: Authenticated can read" ON communications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Communications: Authenticated can insert" ON communications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Communications: Admins can delete" ON communications
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- Military personnel policies
CREATE POLICY "Military: Authenticated can read" ON military_personnel
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Military: Admins can insert" ON military_personnel
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

CREATE POLICY "Military: Admins can update" ON military_personnel
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- User profiles policies
CREATE POLICY "Profiles: Users can read own" ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_user_role() IN ('SUPERADMIN', 'ADMIN'));

CREATE POLICY "Profiles: Superadmin can manage all" ON user_profiles
  FOR ALL TO authenticated
  USING (get_user_role() = 'SUPERADMIN');
```

---

# NEXT.JS PROJECT STRUCTURE

```
political-crm/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout με sidebar
│   │   ├── page.tsx                # Main dashboard με stats
│   │   ├── citizens/
│   │   │   ├── page.tsx            # Citizens list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # Citizen detail με tabs
│   │   │   └── new/
│   │   │       └── page.tsx        # New citizen form
│   │   ├── requests/
│   │   │   ├── page.tsx            # All requests list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Request detail
│   │   ├── military/
│   │   │   ├── page.tsx            # Military personnel list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Military detail
│   │   └── users/
│   │       └── page.tsx            # User management (admin only)
│   ├── api/
│   │   └── reminders/
│   │       └── route.ts            # Cron endpoint for reminders
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   ├── citizens/
│   │   ├── CitizenTable.tsx        # List with real-time
│   │   ├── CitizenForm.tsx         # Create/Edit form
│   │   ├── CitizenCard.tsx         # Dashboard card
│   │   └── CitizenTabs.tsx         # Detail view tabs
│   ├── requests/
│   │   ├── RequestTable.tsx
│   │   ├── RequestForm.tsx
│   │   └── RequestBadge.tsx        # Status badge
│   ├── communications/
│   │   ├── CommunicationList.tsx
│   │   └── CommunicationForm.tsx
│   ├── military/
│   │   ├── MilitaryTable.tsx
│   │   ├── MilitaryForm.tsx
│   │   └── ConditionalFields.tsx   # Show/hide based on type
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── CategoryChart.tsx       # Pie chart
│   │   ├── StatusChart.tsx
│   │   └── TrendChart.tsx          # Line chart
│   └── shared/
│       ├── DataTable.tsx           # Reusable table with sorting/filtering
│       ├── SearchInput.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   ├── middleware.ts           # Auth middleware
│   │   └── types.ts                # Generated types
│   ├── hooks/
│   │   ├── useCitizens.ts          # Real-time citizens hook
│   │   ├── useRequests.ts
│   │   ├── useCommunications.ts
│   │   ├── useMilitary.ts
│   │   └── useDashboardStats.ts
│   ├── utils/
│   │   ├── formatters.ts           # Date, phone formatters
│   │   ├── validators.ts           # Greek phone validation
│   │   └── constants.ts            # Enums, labels
│   └── actions/
│       ├── citizens.ts             # Server actions
│       ├── requests.ts
│       └── communications.ts
├── types/
│   ├── database.ts                 # Supabase generated types
│   └── index.ts                    # App-specific types
├── middleware.ts                   # Auth protection
├── next.config.js
├── tailwind.config.ts
├── package.json
└── .env.local
```

---

# UI/UX REQUIREMENTS

## Design System
- **Framework:** Tailwind CSS + shadcn/ui
- **Style:** Glassmorphism με gradient backgrounds
- **Colors:** Indigo/Purple palette (όπως το Django Unfold)
- **Icons:** Lucide React
- **Charts:** Recharts ή Chart.js

## Greek Labels Mapping

```typescript
// lib/utils/constants.ts

export const LABELS = {
  // Citizens
  surname: 'Επίθετο',
  first_name: 'Όνομα',
  father_name: 'Πατρώνυμο',
  mobile: 'Κινητό',
  landline: 'Σταθερό',
  email: 'Email',
  address: 'Διεύθυνση',
  postal_code: 'Τ.Κ.',
  municipality: 'Δήμος',
  electoral_district: 'Εκλογική Περιφέρεια',
  profession: 'Ιδιότητα',
  notes: 'Παρατηρήσεις',
  assigned_user: 'Αρμόδιος Συνεργάτης',

  // Requests
  category: 'Κατηγορία',
  status: 'Κατάσταση',
  request_text: 'Κείμενο Αιτήματος',
  submitted_at: 'Ημ/νία Αποστολής',
  completed_at: 'Ημ/νία Ολοκλήρωσης',

  // Military
  military_type: 'Τύπος',
  esso: 'ΕΣΣΟ',
  rank: 'Βαθμός',
  training_center: 'Κέντρο Εκπαίδευσης',
  assignment: 'Τοποθέτηση',
};

export const MUNICIPALITY_OPTIONS = [
  { value: 'THESSALONIKI', label: 'Θεσσαλονίκη' },
  { value: 'KALAMARIA', label: 'Καλαμαριά' },
  { value: 'PAVLOS_MELAS', label: 'Παύλος Μελάς' },
  { value: 'KORDELIO_EVOSMOS', label: 'Κορδελιό-Εύοσμος' },
  { value: 'AMPELOKIPOI_MENEMENI', label: 'Αμπελόκηποι-Μενεμένη' },
  { value: 'NEAPOLI_SYKIES', label: 'Νεάπολη-Συκιές' },
  { value: 'OTHER', label: 'Άλλος' },
];

export const REQUEST_CATEGORY_OPTIONS = [
  { value: 'MILITARY', label: 'Στρατιωτικό' },
  { value: 'MEDICAL', label: 'Ιατρικό' },
  { value: 'POLICE', label: 'Αστυνομικό' },
  { value: 'FIRE_DEPARTMENT', label: 'Πυροσβεστική' },
  { value: 'EDUCATION', label: 'Παιδείας' },
  { value: 'ADMINISTRATIVE', label: 'Διοικητικό' },
  { value: 'JOB_SEARCH', label: 'Εύρεση Εργασίας' },
  { value: 'SOCIAL_SECURITY', label: 'ΕΦΚΑ' },
  { value: 'OTHER', label: 'Άλλο' },
];

export const REQUEST_STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Ολοκληρωμένο', color: 'green' },
  { value: 'PENDING', label: 'Εκκρεμεί', color: 'yellow' },
  { value: 'NOT_COMPLETED', label: 'Μη Ολοκληρωμένο', color: 'gray' },
];

export const MILITARY_TYPE_OPTIONS = [
  { value: 'CONSCRIPT', label: 'Στρατιώτης' },
  { value: 'PERMANENT', label: 'Μόνιμος' },
];
```

---

# REAL-TIME IMPLEMENTATION

## Custom Hook Example

```typescript
// lib/hooks/useCitizens.ts

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

type Citizen = Database['public']['Tables']['citizens']['Row'];

export function useCitizens() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Initial fetch
    const fetchCitizens = async () => {
      const { data, error } = await supabase
        .from('citizens')
        .select('*, assigned_user:user_profiles(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) setCitizens(data);
      setLoading(false);
    };

    fetchCitizens();

    // Real-time subscription
    const channel = supabase
      .channel('citizens-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citizens' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCitizens((prev) => [payload.new as Citizen, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCitizens((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new as Citizen : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setCitizens((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { citizens, loading };
}
```

---

# PHONE VALIDATION (Greek Numbers)

```typescript
// lib/utils/validators.ts

export const GREEK_PHONE_REGEX = /^(\+30)?[2-9][0-9]{9}$/;

export function validateGreekPhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  return GREEK_PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

export function formatGreekPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('30')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}
```

---

# FEATURES CHECKLIST

## Phase 1: Core Setup
- [ ] Next.js 14 project με App Router
- [ ] Supabase project setup
- [ ] Database schema creation (όλα τα tables)
- [ ] RLS policies
- [ ] Database triggers
- [ ] Authentication με Supabase Auth
- [ ] Protected routes middleware
- [ ] Basic layout (sidebar, header)

## Phase 2: Citizens Module
- [ ] Citizens list με real-time
- [ ] Search & filters (surname, municipality, electoral)
- [ ] Citizen create form με validation
- [ ] Citizen edit form
- [ ] Citizen detail view με tabs
- [ ] Soft delete functionality
- [ ] Export to Excel/CSV

## Phase 3: Requests Module
- [ ] Requests list με status badges
- [ ] Request create (linked to citizen)
- [ ] Request edit με auto-completion date
- [ ] Days pending calculation
- [ ] Filter by status, category
- [ ] Overdue requests highlighting

## Phase 4: Communications Module
- [ ] Communications list
- [ ] Quick add communication
- [ ] Filter by type, date
- [ ] Timeline view option

## Phase 5: Military Personnel Module
- [ ] Military list με type badges
- [ ] Create with conditional fields (conscript vs permanent)
- [ ] Auto-create citizen on save
- [ ] ΕΣΣΟ display and filtering
- [ ] Sync with citizen data

## Phase 6: Dashboard
- [ ] Stats cards (totals, pending, overdue)
- [ ] Category breakdown pie chart
- [ ] Status distribution chart
- [ ] Monthly trend line chart
- [ ] Top collaborators list
- [ ] Municipality breakdown

## Phase 7: User Management
- [ ] User list (admin only)
- [ ] Role assignment
- [ ] Activity log (optional)

## Phase 8: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

# ENVIRONMENT VARIABLES

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (for reminders - optional)
RESEND_API_KEY=your-resend-key
```

---

# DEPENDENCIES

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.8.x",
    "@supabase/ssr": "^0.1.x",
    "tailwindcss": "^3.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-tabs": "^1.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",
    "date-fns": "^3.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "xlsx": "^0.18.x",
    "sonner": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "supabase": "^1.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

---

# CLAUDE.MD CONTENT

Δημιούργησε ένα αρχείο `CLAUDE.md` στο root του project με το παρακάτω περιεχόμενο:

```markdown
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
- All UI labels in **GREEK** (see `lib/utils/constants.ts`)
- Real-time subscriptions for all list views

### File Structure
- `app/` - Next.js App Router pages
- `components/` - React components (organized by feature)
- `lib/` - Utilities, hooks, Supabase clients
- `types/` - TypeScript definitions

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx supabase gen types typescript --project-id <id> > types/database.ts
```

### Supabase
- RLS is enabled on all tables
- Triggers handle auto-updates (completion dates, timestamps, citizen sync)
- Real-time enabled for citizens, requests, communications, military_personnel

### Important Patterns
1. **Real-time hooks:** All list components use custom hooks with Supabase subscriptions
2. **Server Actions:** Use for mutations (create, update, delete)
3. **Greek validation:** Phone numbers must match Greek format
4. **Conditional fields:** Military form shows different fields based on type

### Greek Phone Validation
Pattern: `^(\+30)?[2-9][0-9]{9}$`
Examples: `6912345678`, `2310123456`, `+306912345678`

### Business Rules
1. Citizen must have at least one contact method (mobile, landline, or email)
2. Request completion date is auto-set when status becomes COMPLETED
3. Military personnel auto-creates linked citizen if none exists
4. Citizen ↔ Military data stays in sync via triggers
```

---

# EXECUTION ORDER

Ακολούθησε αυτή τη σειρά:

1. **Setup Supabase Project**
   - Create project στο supabase.com
   - Run all SQL (tables, triggers, RLS)
   - Enable Real-time για τα tables

2. **Setup Next.js Project**
   - `npx create-next-app@latest political-crm --typescript --tailwind --eslint --app`
   - Install dependencies
   - Setup shadcn/ui: `npx shadcn-ui@latest init`

3. **Configure Supabase Client**
   - Create `lib/supabase/` files
   - Generate types: `npx supabase gen types typescript`

4. **Build Auth Flow**
   - Login page
   - Middleware for protected routes
   - User profile creation trigger

5. **Build Layout**
   - Sidebar με navigation
   - Header με user info
   - Breadcrumbs

6. **Build Features (σε σειρά)**
   - Dashboard (stats only first)
   - Citizens CRUD
   - Requests CRUD
   - Communications
   - Military Personnel
   - Dashboard charts
   - User management

7. **Polish**
   - Loading states
   - Error handling
   - Notifications
   - Dark mode

---

# ΣΗΜΑΝΤΙΚΕΣ ΟΔΗΓΙΕΣ ΓΙΑ ΤΟ CLAUDE

1. **ΠΑΝΤΑ English column names** στη database
2. **ΠΑΝΤΑ Greek labels** στο UI
3. **ΠΑΝΤΑ real-time subscriptions** σε list views
4. **ΠΟΤΕ μη χρησιμοποιείς ελληνικά** σε variable names ή function names
5. **Χρησιμοποίησε Zod** για form validation
6. **Χρησιμοποίησε Server Actions** για mutations
7. **Test RLS policies** πριν προχωρήσεις
8. **Κάνε generate types** μετά από κάθε schema change
9. **Handle errors gracefully** - Supabase μπορεί να αποτύχει σιωπηλά

---

# ΕΡΩΤΗΣΕΙΣ ΓΙΑ ΔΙΕΥΚΡΙΝΙΣΗ

Αν κάτι δεν είναι σαφές, ρώτησε πριν υλοποιήσεις. Ειδικά για:
- Authentication flow (magic link vs password)
- Email provider για reminders
- Hosting (Vercel, άλλο)
- Additional features
```
