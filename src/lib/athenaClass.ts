import type {AthenaTask} from "$lib/athenaTask";

export type AthenaClass = {
    uuid: string,
    name: string,
    description: string,
    admins: string[],
    users: string[],
    banner: string,
    subjects: AthenaSubjects[],
}

export type AthenaSubjects = {
    name: string,
    description: string,
    tasks: AthenaTask[],
}