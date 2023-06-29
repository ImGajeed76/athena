import {createClient} from "@supabase/supabase-js";
import {env} from "$env/dynamic/public";
import {writable} from "svelte/store";
import type {Writable} from "svelte/store";
import type {Session} from "@supabase/supabase-js";

export const supabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_KEY
);

export const currentSession: Writable<Session | null> = writable(null);
supabase.auth.onAuthStateChange((_, session) => {
    currentSession.set(session);
});
