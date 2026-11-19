declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    STUDIO_DATABASE?: string;
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    STUDIO_STORAGE_BUCKET?: string;
    BUCKET?: R2Bucket;
    ADMIN_EMAIL?: string;
    PUBLIC_SITE_URL?: string;
    STUDIO_PUBLIC_URL?: string;
  }
}
