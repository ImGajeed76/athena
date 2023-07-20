import {generateUUID} from "$lib/utils";

export type AthenaTaskAnswer = {
    type: 'text',
    text: string,
    correct_text: string,
    ai_correct: boolean,
} | {
    type: 'variables',
    variables: {
        name: string,
        value: string,
        correct_value: string,
    }[],
} | {
    type: 'multiple_choice',
    options: {
        name: string,
        selected: boolean,
        correct: boolean,
    }[],
    allow_multiple: boolean,
} | {
    type: 'simulation',
    variables: {
        name: string,
        value: string,
        correct_value: string,
    }[],
}

export type AthenaTaskExtra = {
    type: 'image',
    src: string,
} | {
    type: 'video',
    src: string,
} | {
    type: 'audio',
    src: string,
} | {
    type: 'simulation',
}

export type AthenaTaskExplanation = {
    steps: {
        title: string,
        content: any,
        extra: AthenaTaskExtra,
    }[]
}

export type AthenaTask = {
    structVersion: number,
    uuid: string,
    title: string,
    content: any,
    answer: AthenaTaskAnswer,
    extra: AthenaTaskExtra,
    explanation: AthenaTaskExplanation,
}

export type AthenaTaskProgress = {
    uuid: string,
    seen: boolean,
    completed: boolean,
    solve_time: number,
}

export const createEmptyTask = (): AthenaTask => ({
    structVersion: 1,
    uuid: generateUUID(),
    title: '',
    content: {},
    answer: {
        type: 'text',
        text: '',
        correct_text: '',
        ai_correct: true,
    },
    extra: {
        type: 'image',
        src: '',
    },
    explanation: {
        steps: [],
    }
});

export const createEmptyTaskProgress = (uuid: string): AthenaTaskProgress => ({
    uuid,
    seen: false,
    completed: false,
    solve_time: 0,
});

export const parseTask = (text: string): AthenaTask => {
    const JSONData = JSON.parse(text);
    return updateTaskVersion(JSONData);
}

export const updateTaskVersion = (task: AthenaTask): AthenaTask => {
    if (task.structVersion === undefined) {
        task.structVersion = 1;
    }

    switch (task.structVersion) {
        case 1:
            return task as AthenaTask;
        default:
            throw new Error(`Unknown task struct version: ${task.structVersion}`);
    }
}