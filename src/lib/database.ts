import type {Session} from "@supabase/supabase-js";
import {createClient} from "@supabase/supabase-js";
import {env} from "$env/dynamic/public";
import type {Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {AthenaClass} from "$lib/athenaClass";
import type {AthenaTask, AthenaTaskProgress} from "$lib/athenaTask";
import {createEmptyTaskProgress} from "$lib/athenaTask";
import {getRandomUnsplashImage} from "$lib/utils";

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
    await onAuthStateChange(session);
});

export async function onAuthStateChange(session: Session | null) {
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
}

export async function signOut() {
    return await supabase.auth.signOut();
}


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
        banner: await getRandomUnsplashImage(["landscape", "mountain"]),
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

    if (data.length === 0 || !data) return;

    athenaClasses.set(data);
    console.log(data);
}

export async function getTask(taskUuid: string): Promise<AthenaTask | null> {
    return (await getTaskData(taskUuid))?.task ?? null;
}

export async function getTaskData(taskUuid: string): Promise<any | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data, error} = await supabase
        .from("tasks")
        .select()
        .eq("uuid", taskUuid);

    if (error) {
        console.error(error);
        return null;
    }

    if (data.length === 0) return null;

    return data[0];
}

export async function createTask(task: AthenaTask, admins: string[] = [], users: string[] = []): Promise<AthenaTask | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    if (!admins.includes($currentSession.user.email)) admins.push($currentSession.user.email);
    if (!users.includes($currentSession.user.email)) users.push($currentSession.user.email);

    const {data, error} = await supabase
        .from("tasks")
        .insert({
            uuid: task.uuid,
            task,
            admins,
            users,
        })
        .select();

    if (error) {
        console.error(error);
        return null;
    }

    return data[0].task;
}

export async function updateTask(task: AthenaTask): Promise<AthenaTask | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data, error} = await supabase
        .from("tasks")
        .update({
            task,
        })
        .eq("uuid", task.uuid)
        .select();

    if (error) {
        console.error(error);
        return null;
    }

    return data[0].task;
}

export async function deleteTask(taskUuid: string): Promise<boolean> {
    if (!$currentSession) return false;
    if (!$currentSession.user.email) return false;

    const {error} = await supabase
        .from("tasks")
        .delete()
        .eq("uuid", taskUuid);

    if (error) {
        console.error(error);
        return false;
    }

    return true;
}

export async function updateTaskAdmins(taskUuid: string, adminEmails: string[], operation: "append" | "remove" | "set"): Promise<AthenaTask | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data: currentData, error: currentError} = await supabase
        .from("tasks")
        .select("admins")
        .eq("uuid", taskUuid);

    if (currentError) {
        console.error(currentError);
        return null;
    }

    const currentAdmins = currentData[0].admins;
    if (!currentAdmins.includes($currentSession.user.email)) return null;

    if (operation === "append") {
        for (const adminEmail of adminEmails) {
            if (!currentAdmins.includes(adminEmail)) currentAdmins.push(adminEmail);
        }
    } else if (operation === "remove") {
        for (const adminEmail of adminEmails) {
            if (currentAdmins.includes(adminEmail) && adminEmail !== $currentSession.user.email) currentAdmins.splice(currentAdmins.indexOf(adminEmail), 1);
        }
    } else if (operation === "set") {
        for (const adminEmail of adminEmails) {
            if (currentAdmins.includes(adminEmail) && adminEmail !== $currentSession.user.email) currentAdmins.splice(currentAdmins.indexOf(adminEmail), 1);
        }
        for (const adminEmail of adminEmails) {
            if (!currentAdmins.includes(adminEmail)) currentAdmins.push(adminEmail);
        }
    }

    const {data, error} = await supabase
        .from("tasks")
        .update({
            admins: currentAdmins,
        })
        .eq("uuid", taskUuid)
        .select();

    if (error) {
        console.error(error);
        return null;
    }

    return data[0].task;
}

export async function updateTaskUsers(taskUuid: string, userEmails: string[], operation: "append" | "remove" | "set"): Promise<AthenaTask | null> {
    if (!$currentSession) return null;
    if (!$currentSession.user.email) return null;

    const {data: currentData, error: currentError} = await supabase
        .from("tasks")
        .select()
        .eq("uuid", taskUuid);

    if (currentError) {
        console.error(currentError);
        return null;
    }

    const currentUsers = currentData[0].users;
    const currentAdmins = currentData[0].admins;
    if (!currentUsers.includes($currentSession.user.email)) return null;

    if (operation === "append") {
        for (const userEmail of userEmails) {
            if (!currentUsers.includes(userEmail)) currentUsers.push(userEmail);
        }
    } else if (operation === "remove") {
        for (const userEmail of userEmails) {
            if (currentUsers.includes(userEmail) && !currentAdmins.includes(userEmail)) currentUsers.splice(currentUsers.indexOf(userEmail), 1);
        }
    } else if (operation === "set") {
        for (const userEmail of userEmails) {
            if (currentUsers.includes(userEmail) && !currentAdmins.includes(userEmail)) currentUsers.splice(currentUsers.indexOf(userEmail), 1);
        }
        for (const userEmail of userEmails) {
            if (!currentUsers.includes(userEmail)) currentUsers.push(userEmail);
        }
    }

    const {data, error} = await supabase
        .from("tasks")
        .update({
            users: currentUsers,
        })
        .eq("uuid", taskUuid)
        .select();

    if (error) {
        console.error(error);
        return null;
    }

    return data[0].task;
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
