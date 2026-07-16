from supabase import Client, create_client

from app.config import settings

supabase: Client = create_client(
    supabase_url=settings.supabase_url,
    supabase_key=settings.supabase_key,
)
