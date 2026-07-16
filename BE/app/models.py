"""
Reference models matching the Supabase schema in supabase_schema.sql.

Tables managed via Supabase dashboard / SQL Editor:
  - files(id UUID PK, filename TEXT, source TEXT, synced_at TIMESTAMPTZ, processed BOOLEAN)
  - records(id UUID PK, file_id UUID FK, created_at TIMESTAMPTZ, extracted_json JSONB)
  - chat_messages(id UUID PK, session_id UUID, role TEXT, content TEXT, created_at TIMESTAMPTZ)
  - user_prefs(id UUID PK, persona TEXT DEFAULT 'straightforward')

Use supabase.table("name").select/insert/update/delete().execute() directly.
"""
