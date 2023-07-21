<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {AthenaTask} from "$lib/athenaTask";
    import {createEmptyTask} from "$lib/athenaTask";
    import LaTeX_Viewer from "./LaTeX_Viewer.svelte";
    import VideoPlayer from "./players/VideoPlayer.svelte";
    import AudioPlayer from "./players/AudioPlayer.svelte";
    import {Step, Stepper} from "@skeletonlabs/skeleton";
    import {PUBLIC_BACKEND_KEY} from "$env/static/public";

    export let task: Writable<AthenaTask> = writable(createEmptyTask());
    export let onComplete: (allCorrect: boolean) => void = () => {return};
    let oldTask: string = JSON.stringify($task);

    let content = writable($task.content);
    content.subscribe(value => {
        $task.content = value;
    });

    setInterval(() => {
        if (oldTask !== JSON.stringify($task)) {
            oldTask = JSON.stringify($task);
            task.set($task);
        }
    }, 1000);


    const currentStep = writable(0);

    function onStep(e: { detail: { state: { current: number, total: number }, step: number } }) {
        currentStep.set(e.detail.state.current);
    }

    let answersCorrected = false;
    let textAnswerCorrect = false;

    let allCorrect = false;

    async function correctAnswers() {
        if ($task.answer.type === 'text') {
            if ($task.answer.ai_correct) {
                const response = await fetch('/api/ai-correct', {
                    method: 'POST',
                    body: JSON.stringify({
                        text: $task.answer.text,
                        correct_text: $task.answer.correct_text
                    }),
                    headers: {
                        'content-type': 'application/json',
                        'x-api-key': PUBLIC_BACKEND_KEY
                    }
                }).then(res => res.json());

                textAnswerCorrect = response.correct || false;
            } else {
                textAnswerCorrect = $task.answer.text.toLowerCase().trim() === $task.answer.correct_text.toLowerCase().trim();
            }

            allCorrect = textAnswerCorrect;
        }

        if ($task.answer.type === 'variables') {
            if ($task.answer.variables) {
                allCorrect = true;
                for (let i = 0; i < $task.answer.variables.length; i++) {
                    const variable = $task.answer.variables[i];
                    if (variable.value.toLowerCase().trim() !== variable.correct_value.toLowerCase().trim()) {
                        allCorrect = false;
                    }
                }
            }
        }

        if ($task.answer.type === 'multiple_choice') {
            if ($task.answer.options) {
                allCorrect = true;
                for (let i = 0; i < $task.answer.options.length; i++) {
                    const option = $task.answer.options[i];
                    if (option.selected !== option.correct) {
                        allCorrect = false;
                    }
                }
            }
        }

        answersCorrected = true;
    }

    function getURL(src) {
        return `url(${src})`;
    }

    const completionMessages = [
        "Way to go! You nailed that [subject]. Keep up the good work.",
        "You're on fire! Another [subject] bites the dust. You're making amazing progress!",
        "Boom! Task conquered. Keep up the momentum. Can't wait to see what you tackle next!",
        "You crushed it! Can't wait to see what you conquer next. Onwards and upwards!",
        "Another one down! You're making progress. Stay motivated, you're doing great!",
        "And just like that, you've done it. Keep up the good work! You're on a roll!",
        "Task completed! Your effort is showing. Keep it up, you're smashing these tasks!",
        "Wow! You make this look easy. Keep going strong!",
        "Done and dusted! On to the next challenge. You've got this!",
        "Great work! You're absolutely smashing these tasks. Keep going, you're unstoppable!"
    ];

    const completionMemes = [
        "https://i.giphy.com/media/mGK1g88HZRa2FlKGbz/giphy.webp",
        "https://media0.giphy.com/media/YRuFixSNWFVcXaxpmX/giphy.gif?cid=ecf05e47rt9o4f4gyn585qs4455u43qt9rfhxvvio61pr528&ep=v1_gifs_search&rid=giphy.gif&ct=g",
        "https://i.giphy.com/media/d31w24psGYeekCZy/giphy.webp",
        "https://i.giphy.com/media/l3q2SH4Cmhh8F40jS/giphy.webp",
        "https://tvovermind.com/wp-content/uploads/2017/04/gastsby-whatgatsby.jpg.gif"
    ]
</script>

<div class="card w-full max-w-6xl h-fit m-auto p-5">
    <Stepper class="h-full grid grid-rows-[auto_1fr] {$currentStep === 0 ? 'space-y-0 overflow-y-auto' : 'space-y-4'}"
             regionContent="h-fit m-0 p-0 space-y-0"
             regionHeader="h-fit" stepTerm="" on:step={onStep} on:complete={() => onComplete(allCorrect)}>
        <Step class="space-y-1 h-fit grid grid-rows-[auto_1fr_auto]" regionContent="h-fit space-y-0"
              locked={!answersCorrected}>
            <svelte:fragment slot="header">
                <p></p>
            </svelte:fragment>
            <div class="grid grid-cols-2 w-full h-fit pb-7 space-x-5">
                <div class="grid grid-rows-[1fr_auto] overflow-y-auto">
                    <div class="h-full overflow-auto rounded">
                        <p class="outline-0 text-4xl p-2">{$task.title || 'Some title'}</p>
                        <div class="mt-5 mb-5 h-64">
                            <LaTeX_Viewer content={content}/>
                        </div>

                        {#if $task.answer.type === 'text'}
                            <div>
                                <textarea
                                        class="textarea h-60 {answersCorrected ? (textAnswerCorrect ? 'variant-glass-success' : 'variant-glass-error') : ''}"
                                        placeholder="Enter your {$task.answer.ai_correct ? '' : 'exact '}answer"
                                        style="resize: none" bind:value={$task.answer.text} on:input={() => {answersCorrected = false}}></textarea>
                            </div>
                        {:else if $task.answer.type === 'variables'}
                            <div class="max-h-96 overflow-y-auto p-1 rounded">
                                {#if $task.answer.variables}
                                    {#each $task.answer.variables as variable}
                                        <div class="mb-2 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                            <div class="input-group-shim w-24">{variable.name}</div>
                                            <input class="pl-2 outline-0 {answersCorrected ? (variable.value.toLowerCase().trim() === variable.correct_value.toLowerCase().trim() ? 'variant-glass-success' : 'variant-glass-error') :''}"
                                                   placeholder="Your answer"
                                                   bind:value={variable.value} on:input={() => {answersCorrected = false}}/>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        {:else if $task.answer.type === 'multiple_choice'}
                            <div class="max-h-96 overflow-y-auto p-1 rounded">
                                {#if $task.answer.options}
                                    {#each $task.answer.options as option}
                                        <div class="mb-2 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                            <input type="checkbox"
                                                   class="input-group-shim pl-2 m-auto mx-5 checkbox {option.selected ? 'variant-filled-primary': 'variant-filled-surface'}"
                                                   bind:checked={option.selected} on:input={() => {answersCorrected = false}}>
                                            <div class="pl-2 outline-0 {answersCorrected ? (option.selected === option.correct ? 'variant-glass-success' : 'variant-glass-error') :''}">{option.name}</div>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        {:else if $task.answer.type === 'simulation'}
                            <div>
                                <p class="text-center">Not implemented yet</p>
                            </div>
                        {/if}
                    </div>

                    <div class="mt-5">
                        <button class="btn variant-filled-primary rounded w-full" on:click={correctAnswers}>
                            Submit
                        </button>
                    </div>
                </div>
                <div class="bg-surface-700 rounded p-5 overflow-y-auto h-full">
                    {#if $task.extra.type === "image"}
                        <div>
                            <img class="rounded mt-2" alt="reference"
                                 src={$task.extra.src || "robert-shunev-mS1nlYbq1kA-unsplash.jpg"}>
                        </div>
                    {:else if $task.extra.type === "video"}
                        <div>
                            <div class="w-full h-72 mt-2 rounded overflow-hidden">
                                <VideoPlayer src={$task.extra.src || "pexels-akari-m-5927778 (1080p).mp4"}
                                             alt="Your Video"/>
                            </div>
                        </div>
                    {:else if $task.extra.type === "audio"}
                        <div>
                            <div class="w-full h-20 mt-2 rounded overflow-hidden">
                                <AudioPlayer src={$task.extra.src || "spirit-blossom-15285.mp3"} alt="Your Audio"/>
                            </div>
                        </div>
                    {:else if $task.extra.type === "simulation"}
                        <div>
                            <p class="text-center">Not implemented yet</p>
                        </div>
                    {/if}
                </div>
            </div>
        </Step>
        {#if $task.explanation.steps.length > 0}
            {#each $task.explanation.steps as step}
                <Step>
                    <svelte:fragment slot="header">
                        <p>{step.title}</p>
                    </svelte:fragment>

                    <div class="grid grid-cols-2">
                        <div class="h-96">
                            <LaTeX_Viewer content={writable(step.content)}/>
                        </div>

                        <div class="px-2">
                            {#if step.extra.type === "image"}
                                <div class="bg-cover rounded bg-center w-full h-full"
                                     style="background-image: {getURL(step.extra.src || 'robert-shunev-mS1nlYbq1kA-unsplash.jpg')}">
                                </div>
                            {:else if step.extra.type === "video"}
                                <div class="w-full h-full rounded overflow-hidden">
                                    <VideoPlayer
                                            src={step.extra.src || "pexels-akari-m-5927778 (1080p).mp4"}
                                            alt="Your Video"/>
                                </div>
                            {:else if step.extra.type === "audio"}
                                <div class="w-full h-full rounded overflow-hidden">
                                    <AudioPlayer src={step.extra.src || "spirit-blossom-15285.mp3"}
                                                 alt="Your Audio"/>
                                </div>
                            {:else if step.extra.type === "simulation"}
                                <div>
                                    <p class="text-center">Not implemented yet</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                </Step>
            {/each}
        {/if}
        <Step>
            <svelte:fragment slot="header">
                <p>Congratulations 🎉</p>
            </svelte:fragment>

            <div class="w-full">
                <div class="h-fit grid items-center m-auto">
                    <p class="h4 m-auto">{completionMessages[Math.floor(Math.random() * completionMessages.length)]}</p>
                    <img src="{completionMemes[Math.floor(Math.random() * completionMemes.length)]}" alt="Meme"
                         class="h-full max-h-72 rounded m-auto mt-5">
                </div>
            </div>
        </Step>
    </Stepper>
</div>