# FEEDBACK.md — Feedback Table Schema

User-submitted feedback collected via the `<FeedbackSheet />` on the your-loops screen.

---

## Schema

```sql
create table public.feedback (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) not null,
  feedback_text text not null,
  thumbs_up  boolean,  -- true = thumbs up, false = thumbs down, null = not set
  created_at timestamptz default now()
);
```

## Row Level Security

```sql
alter table public.feedback enable row level security;

create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);
```

Users can only insert their own rows. There is no select or update policy — feedback is write-only from the client. Admin review happens directly in the Supabase dashboard.
