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

export const createEmptyTask = (): AthenaTask => ({
    structVersion: 1,
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

export const parseTask = (text: string): AthenaTask => {
    const JSONData = JSON.parse(text);
    if (JSONData.structVersion === undefined) {
        JSONData.structVersion = 1;
    }

    switch (JSONData.structVersion) {
        case 1:
            return JSONData as AthenaTask;
        default:
            throw new Error(`Unknown task struct version: ${JSONData.structVersion}`);
    }
}