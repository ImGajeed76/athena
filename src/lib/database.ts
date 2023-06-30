import type {Session} from "@supabase/supabase-js";
import {createClient} from "@supabase/supabase-js";
import {env} from "$env/dynamic/public";
import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export const supabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_KEY
);

export const currentSession: Writable<Session | null> = writable(null);
export const currentUserData: Writable<any | null> = writable(null);
supabase.auth.onAuthStateChange(async (_, session) => {
    currentSession.set(session);

    if (!session) return;
    const email = session.user.email;
    if (!email) return;

    const {data, error} = await supabase
        .from("user-data")
        .select("*")
        .eq("email", email)

    if (error || !data || data.length === 0) {
        const {data: tableData, error: tableError} = await supabase
            .from("user-data")
            .insert({
                email,
                username: email.split("@")[0],
            })
            .select();
        if (tableError) {
            console.error(tableError);
            return;
        }

        currentUserData.set(tableData);
        return;
    }

    currentUserData.set(data);
});


export async function createUser(email: string, password: string): Promise<{ data: any, error: any }> {
    const {data: signUpData, error: signUpError} = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin
        }
    });
    if (signUpError) return {data: null, error: signUpError};

    return {data: signUpData, error: null};
}
