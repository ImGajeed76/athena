export type AthenaClass = {
    uuid: string,
    name: string,
    description: string,
    admins: string[],
    users: string[],
    creators: string[],
    banner: string,
    subjects: AthenaSubjects[],
}

export type AthenaSubjects = {
    name: string,
    description: string,
    task_uuids: string[],
}