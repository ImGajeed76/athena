import type {Session} from "@supabase/supabase-js";
import {createClient} from "@supabase/supabase-js";
import {env} from "$env/dynamic/public";
import type {Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {AthenaClass} from "$lib/athenaClass";
import type {AthenaTaskProgress} from "$lib/athenaTask";
import {createEmptyTaskProgress} from "$lib/athenaTask";

export const supabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_KEY,
);

export const currentSession: Writable<Session | null> = writable(null);
let $currentSession: Session | null = null;
currentSession.subscribe((session) => {
    $currentSession = session
});
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

    const classes = await getClasses(session);
    console.log(classes);
    athenaClasses.set(classes);
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

export const athenaClasses = writable<AthenaClass[]>([]);
let $athenaClasses: AthenaClass[] = [];
athenaClasses.subscribe((classes) => {
    $athenaClasses = classes;
});

export async function getClasses(session: Session | null): Promise<AthenaClass[]> {
    if (!session && $currentSession) session = $currentSession;
    if (!session) return [];
    console.log(session);

    const {data, error} = await supabase
        .from("classes")
        .select();

    if (error) {
        console.error(error);
        return [];
    }

    return data as AthenaClass[];
}

export async function updateClass(classData: AthenaClass) {
    if (!$currentSession) return false;
    if (!$currentSession.user.email) return false;

    const {error} = await supabase
        .from("classes")
        .update({
            admins: classData.admins,
            users: classData.users,
            name: classData.name,
            description: classData.description,
            banner: classData.banner,
            subjects: classData.subjects,
        })
        .eq("uuid", classData.uuid)

    if (error) {
        console.error(error);
        return false;
    }

    athenaClasses.set(await getClasses(null));
    return true;
}

export async function createClass(name: string, description: string) {
    if (!$currentSession) return;
    if (!$currentSession.user.email) return;
    console.log(name, description, $currentSession.user.email)

    const classData: AthenaClass = {
        uuid: "",
        name,
        description,
        admins: [$currentSession.user.email],
        users: [$currentSession.user.email],
        banner: "",
        subjects: [],
    }

    const {data, error} = await supabase
        .from("classes")
        .insert({
            admins: classData.admins,
            users: classData.users,
            name: classData.name,
            description: classData.description,
            banner: classData.banner,
            subjects: classData.subjects,
        })
        .select()

    if (error) {
        console.error(error);
        return;
    }

    console.log(data);
}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function getTaskProgress(taskUuid: string): Promise<AthenaTaskProgress | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data, error} = await supabase
        .from("task_progress")
        .select()
        .eq("task_uuid", taskUuid)

    if (error) {
        console.error(error);
        return null;
    }

    if (data.length === 0) {
        const {data: newData, error: newError} = await supabase
            .from("task_progress")
            .insert({
                task_uuid: taskUuid,
                email: $currentSession.user.email,
                progress: createEmptyTaskProgress(taskUuid),
            })
            .select()

        if (newError) {
            console.error(newError);
            return null;
        }

        return newData[0].progress;
    }

    return data[0].progress;
}

export async function updateTaskProgress(taskUuid: string, progress: AthenaTaskProgress): Promise<AthenaTaskProgress | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data, error} = await supabase
        .from("task_progress")
        .update({
            progress,
        })
        .eq("task_uuid", taskUuid)
        .select();

    if (error) {
        console.error(error);
        return null;
    }

    return data[0].progress;
}
