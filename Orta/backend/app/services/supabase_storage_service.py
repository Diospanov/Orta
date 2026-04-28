from supabase import create_client, Client

from app.core.config import settings


supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)


def upload_file_to_supabase(
    *,
    bucket: str,
    storage_path: str,
    file_bytes: bytes,
    content_type: str | None,
) -> str:
    supabase.storage.from_(bucket).upload(
        storage_path,
        file_bytes,
        file_options={
            "content-type": content_type or "application/octet-stream",
            "upsert": "false",
        },
    )

    public_url = supabase.storage.from_(bucket).get_public_url(storage_path)

    return public_url


def delete_file_from_supabase(*, bucket: str, storage_path: str) -> None:
    supabase.storage.from_(bucket).remove([storage_path])