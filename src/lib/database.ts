import type {AuthResponse, Session} from "@supabase/supabase-js";
import {createClient} from "@supabase/supabase-js";
import {env} from "$env/dynamic/public";
import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";
import type {AthenaClass} from "$lib/athenaClass";
import type {AthenaTask, AthenaTaskAnswer, AthenaTaskData, AthenaTaskProgress} from "$lib/athenaTask";
import {createEmptyTaskProgress, updateTaskVersion} from "$lib/athenaTask";
import {getRandomUnsplashImage} from "$lib/utils";

export const supabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_KEY,
);
supabase.auth.refreshSession().then(() => {
    supabase.auth.onAuthStateChange(async (_, session) => {
        await onAuthStateChange(session);
    });
});

export const currentSession: Writable<Session | null> = writable(null);
export const currentUserData: Writable<{ email: string, username: string } | null> = writable(null);
export const athenaClasses = writable<AthenaClass[]>([]);
export const athenaTasks = writable<AthenaTask[]>([]);
export const athenaTaskData = writable<AthenaTaskData[]>([]);
export const athenaTaskProgress = writable<{
    progress: AthenaTaskProgress,
    uuid: string,
    task_uuid: string,
    email: string
}[]>([]);


export async function onAuthStateChange(session: Session | null) {
    currentSession.set(session);

    if (!session) return;
    const classes = await getClasses(session);
    athenaClasses.set(classes);

    await loadTaskData();

    const email = session.user.email;
    if (!email) return;

    const {data, error} = await supabase
        .from("user-data")
        .select("*")
        .eq("email", email);

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

        currentUserData.set(tableData[0]);
        return;
    }

    currentUserData.set(data[0]);

}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function createUser(email: string, password: string): Promise<AuthResponse> {
    const {data: signUpData, error: signUpError} = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin
        }
    });
    if (signUpError) return {data: {user: null, session: null}, error: signUpError};

    return {data: signUpData, error: null};
}

export async function getClasses(session: Session | null = null): Promise<AthenaClass[]> {
    if (!session && get(currentSession)) session = get(currentSession);
    if (!session) return [];

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
    const session = get(currentSession);
    if (!session) return false;
    if (!session.user.email) return false;

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

export async function deleteClass(athenaClass: AthenaClass) {
    const session = get(currentSession);
    if (!session) return false;
    if (!session.user.email) return false;

    for (const subject in athenaClass.subjects) {
        for (const task_uuid of athenaClass.subjects[subject].task_uuids) {
            await deleteTask(task_uuid);
        }
    }

    const {error} = await supabase
        .from("classes")
        .delete()
        .eq("uuid", athenaClass.uuid)

    if (error) {
        console.error(error);
        return false;
    }

    athenaClasses.set(await getClasses(null));
    return true;
}

export async function createClass(name: string, description: string) {
    const session = get(currentSession);
    if (!session) return false;
    if (!session.user.email) return false;
    console.log(name, description, session.user.email)

    const classData: AthenaClass = {
        uuid: "",
        name,
        description,
        admins: [session.user.email],
        users: [session.user.email],
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

    athenaClasses.set(await getClasses(null));
    console.log(data);
}

export async function loadTaskData() {
    const session = get(currentSession);
    if (!session) return;
    if (!session.user.email) return;

    const {data: taskData, error} = await supabase
        .from("tasks")
        .select();

    if (error) {
        console.error(error);
        return;
    }

    athenaTaskData.set(taskData);

    const tasks: AthenaTask[] = [];
    for (const task of taskData) {
        tasks.push(updateTaskVersion(task.task));
    }
    athenaTasks.set(tasks);

    const {data: progressData, error: progressError} = await supabase
        .from("task_progress")
        .select();

    if (progressError) {
        console.error(progressError);
        return;
    }

    athenaTaskProgress.set(progressData);
    console.log(taskData);
}

export async function getTask(taskUuid: string): Promise<AthenaTask | null> {
    return get(athenaTasks).find(task => task.uuid === taskUuid) || null;
}

export async function getTaskData(taskUuid: string): Promise<AthenaTaskData | null> {
    return get(athenaTaskData).find(task => task.uuid === taskUuid) || null;
}

export async function createTask(task: AthenaTask, admins: string[] = [], users: string[] = []): Promise<AthenaTask | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

    if (!admins.includes(session.user.email)) admins.push(session.user.email);
    if (!users.includes(session.user.email)) users.push(session.user.email);

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

    await loadTaskData();
    return data[0].task;
}

export async function updateTask(task: AthenaTask): Promise<AthenaTask | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

    const {error} = await supabase
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

    await loadTaskData();
    return task;
}

export async function deleteTask(taskUuid: string): Promise<boolean> {
    const session = get(currentSession);
    if (!session) return false;
    if (!session.user.email) return false;

    const {error} = await supabase
        .from("tasks")
        .delete()
        .eq("uuid", taskUuid);

    if (error) {
        console.error(error);
        return false;
    }

    await loadTaskData();
    return true;
}

export async function updateTaskAdmins(taskUuid: string, adminEmails: string[], operation: "append" | "remove" | "set"): Promise<AthenaTask | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

    const {data: currentData, error: currentError} = await supabase
        .from("tasks")
        .select("admins")
        .eq("uuid", taskUuid);

    if (currentError) {
        console.error(currentError);
        return null;
    }

    const currentAdmins = currentData[0].admins;
    if (!currentAdmins.includes(session.user.email)) return null;

    if (operation === "append") {
        for (const adminEmail of adminEmails) {
            if (!currentAdmins.includes(adminEmail)) currentAdmins.push(adminEmail);
        }
    } else if (operation === "remove") {
        for (const adminEmail of adminEmails) {
            if (currentAdmins.includes(adminEmail) && adminEmail !== session.user.email) currentAdmins.splice(currentAdmins.indexOf(adminEmail), 1);
        }
    } else if (operation === "set") {
        for (const adminEmail of adminEmails) {
            if (currentAdmins.includes(adminEmail) && adminEmail !== session.user.email) currentAdmins.splice(currentAdmins.indexOf(adminEmail), 1);
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

    await loadTaskData();
    return data[0].task;
}

export async function updateTaskUsers(taskUuid: string, userEmails: string[], operation: "append" | "remove" | "set"): Promise<AthenaTask | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

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
    if (!currentUsers.includes(session.user.email)) return null;

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

    await loadTaskData();
    return data[0].task;
}

export async function getTaskProgress(taskUuid: string, answer: AthenaTaskAnswer): Promise<AthenaTaskProgress | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

    const progress = get(athenaTaskProgress).find(progress => progress.task_uuid === taskUuid && progress.email === session.user.email);

    if (!progress) {
        const {data: newData, error: newError} = await supabase
            .from("task_progress")
            .insert({
                task_uuid: taskUuid,
                email: session.user.email,
                progress: createEmptyTaskProgress(taskUuid, answer),
            })
            .select()

        if (newError) {
            console.error(newError);
            return null;
        }

        await loadTaskData();
        return newData[0].progress;
    }

    return progress.progress;
}

export async function updateTaskProgress(taskUuid: string, progress: AthenaTaskProgress): Promise<AthenaTaskProgress | null> {
    const session = get(currentSession);
    if (!session) return null;
    if (!session.user.email) return null;

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

    await loadTaskData();
    return data[0].progress;
}
