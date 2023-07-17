export type TaskAnswer = {
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

export type TaskExtra = {
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

export type TaskExplanation = {
    steps: {
        title: string,
        content: any,
        extra: TaskExtra,
    }[]
}

export type Task = {
    uuid: string,
    title: string,
    content: any,
    answer: TaskAnswer,
    extra: TaskExtra,
    explanation: TaskExplanation,
}

export const createEmptyTask = (): Task => ({
    uuid: '',
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