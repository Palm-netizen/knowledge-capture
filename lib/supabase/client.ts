import { createClient } from "@supabase/supabase-js";

// Public anon key — safe to ship in client code (RLS policies gate access).
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ubtowmtqxakjfwllcali.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidG93bXRxeGFramZ3bGxjYWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDIyODksImV4cCI6MjA5ODc3ODI4OX0.L73GYomVHytMZe9lquWhTgGFrurqmZWcXCCxt0utno4";

export const PHOTO_BUCKET = "knowledge-photos";

// Typed via our own hand-written interfaces in ./types (see query/mutation
// helpers) rather than the generated Database generic, so every table
// access goes through a reviewed, explicit shape instead of `any`.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
