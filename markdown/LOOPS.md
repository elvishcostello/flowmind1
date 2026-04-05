# LOOPS.md — Loops Feature Persistence

Schema, RLS, and data access patterns for the Loops feature. Read alongside `PERSISTENCE.md` (auth, client setup, middleware) and `CLAUDE.md` before making changes.

---

## Schema

```sql
create table public.loops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text not null,
  tasks text[] not null,
  how_long text,
  how_often text,
  days text[],                          -- null unless a day-chooser action was used
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## Row Level Security

```sql
alter table public.loops enable row level security;

create policy "Users can read own loops"
  on public.loops for select
  using (auth.uid() = user_id);

create policy "Users can insert own loops"
  on public.loops for insert
  with check (auth.uid() = user_id);

create policy "Users can update own loops"
  on public.loops for update
  using (auth.uid() = user_id);

create policy "Users can delete own loops"
  on public.loops for delete
  using (auth.uid() = user_id);
```

---

## Data Flow

```typescript
const supabase = createClient()

// Read all loops for the current user
const { data, error } = await supabase
  .from('loops')
  .select('*')
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false })

// Insert a new loop
const { error } = await supabase
  .from('loops')
  .insert({
    user_id: session.user.id,
    category,
    tasks,
    how_long: howLong,
    how_often: howOften,
    days: selectedDays.length > 0 ? selectedDays : null,
  })

// Delete a loop
const { error } = await supabase
  .from('loops')
  .delete()
  .eq('id', loopId)
  .eq('user_id', session.user.id)  // belt-and-suspenders, RLS already enforces this
```

---

## What Not To Do

- Do not store loop data in URL params beyond the creation flow — persist to Supabase on save
- Do not skip the `user_id` filter on reads — RLS enforces it but explicit filters are clearer
- Do not omit the delete RLS policy — loops must be deletable by their owner
