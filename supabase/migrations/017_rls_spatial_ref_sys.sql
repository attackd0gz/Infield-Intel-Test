-- ─────────────────────────────────────────────────────────────────────────────
-- 017 Enable RLS on PostGIS spatial_ref_sys table
-- ─────────────────────────────────────────────────────────────────────────────
-- spatial_ref_sys is a read-only reference table installed by the PostGIS
-- extension. It should not be directly accessible via PostgREST. Enabling RLS
-- with no policies blocks all direct access while PostGIS functions continue
-- to work normally via SECURITY DEFINER.

alter table public.spatial_ref_sys enable row level security;
