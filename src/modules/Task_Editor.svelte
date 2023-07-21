<script lang="ts">
    import type {Writable} from "svelte/store";
    import type {AthenaTask} from "$lib/athenaTask";
    import {createEmptyTask, parseTask} from "$lib/athenaTask";
    import {writable} from "svelte/store";
    import LaTeX_Editor from "./LaTeX_Editor.svelte";
    import {SlideToggle, Step, Stepper, Toast, toastStore} from "@skeletonlabs/skeleton";
    import VideoPlayer from "./players/VideoPlayer.svelte";
    import AudioPlayer from "./players/AudioPlayer.svelte";
    import {onMount} from "svelte";
    import {download} from "$lib/utils";

    let variableName = '';
    let variableCorrectValue = '';

    let optionName = '';
    let optionCorrectValue = false;

    export let task: Writable<AthenaTask> = writable(createEmptyTask());
    let oldTask: string = JSON.stringify($task);

    let content = writable($task.content);
    let reloadContent = writable(false);
    content.subscribe(value => {
        $task.content = value;
    });

    setInterval(() => {
        if (oldTask !== JSON.stringify($task)) {
            oldTask = JSON.stringify($task);
            task.set($task);
        }
    }, 1000);


    function addVariable() {
        if ($task.answer.type !== 'variables') return;
        if (!$task.answer.variables) $task.answer.variables = [];
        if (variableName === '' || variableCorrectValue === '') {
            const errorToast = {
                message: "Please fill in all variable fields",
                timeout: 3000,
                background: "variant-filled-error"
            }
            toastStore.trigger(errorToast);
            return;
        }

        if ($task.answer.variables.find(variable => variable.name === variableName)) {
            const errorToast = {
                message: "A variable with that name already exists",
                timeout: 3000,
                background: "variant-filled-error"
            }
            toastStore.trigger(errorToast);
            return;
        }

        $task.answer.variables.push({
            name: variableName,
            value: '',
            correct_value: variableCorrectValue
        });

        variableName = '';
        variableCorrectValue = '';
    }

    function removeVariable(variableName: string) {
        if ($task.answer.type !== 'variables') return;
        if (!$task.answer.variables) $task.answer.variables = [];
        $task.answer.variables = $task.answer.variables.filter(variable => variable.name !== variableName);
    }

    function addOption() {
        if ($task.answer.type !== 'multiple_choice') return;
        if (!$task.answer.options) $task.answer.options = [];
        if (optionName === '') {
            const errorToast = {
                message: "Please fill in all option fields",
                timeout: 3000,
                background: "variant-filled-error"
            }
            toastStore.trigger(errorToast);
            return;
        }

        if ($task.answer.options.find(option => option.name === optionName)) {
            const errorToast = {
                message: "An option with that name already exists",
                timeout: 3000,
                background: "variant-filled-error"
            }
            toastStore.trigger(errorToast);
            return;
        }

        $task.answer.options.push({
            name: optionName,
            correct: optionCorrectValue,
            selected: false
        });

        optionName = '';
        optionCorrectValue = false;
    }

    function removeOption(optionName: string) {
        if ($task.answer.type !== 'multiple_choice') return;
        if (!$task.answer.options) $task.answer.options = [];
        $task.answer.options = $task.answer.options.filter(option => option.name !== optionName);
    }

    let stepContents: Writable<any>[] = [];

    function updateWritable() {
        $task.explanation.steps.forEach(step => {
            const content = writable(step.content);
            content.subscribe(value => {
                step.content = value;
                console.log(step.content);
            })
            stepContents.push(content);
        })

        stepContents = [...stepContents];
    }

    onMount(() => {
        updateWritable();
    })

    function addExplanation() {
        $task.explanation.steps.push({
            title: `Step ${$task.explanation.steps.length + 1}`,
            content: {},
            extra: {
                type: 'image',
                src: ''
            }
        })

        const content = writable($task.explanation.steps[$task.explanation.steps.length - 1].content);
        content.subscribe(value => {
            $task.explanation.steps[$task.explanation.steps.length - 1].content = value;
        })

        stepContents.push(content);

        oldTask = JSON.stringify($task);
        task.set($task);
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        }, 100);
    }

    function removeStep(title) {
        let index = $task.explanation.steps.findIndex(step => step.title === title);
        if (index === -1) return;
        stepContents.splice(index, 1);
        $task.explanation.steps = $task.explanation.steps.filter(step => step.title !== title);
        oldTask = JSON.stringify($task);
        task.set($task);

        if (index < $task.explanation.steps.length) return;
        reloadStepper = true;
        setTimeout(() => {
            reloadStepper = false;
        }, 10);
    }

    function getURL(src) {
        return `url(${src})`;
    }

    async function upload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.athena';
        input.onchange = e => {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = readerEvent => {
                const fileContent = readerEvent.target.result;
                if (typeof fileContent === "string") {
                    const newTask = parseTask(fileContent);
                    newTask.uuid = $task.uuid;
                    $task = newTask;
                }
                task.set($task);
                content.set($task.content);
                reloadContent.set(true);
                updateWritable();
            }
        }
        input.click();
    }

    async function exportTask() {
        let filename = ($task.title.replace(/ /g, '_').toLowerCase() || "some_task") + '.athena';
        download(filename, JSON.stringify($task));
    }

    async function importTask() {
        await upload();
    }

    let reloadStepper = false;
</script>

<Toast/>

<div class="p-5 w-full">
    <div class="mb-1 w-full max-w-6xl m-auto">
        <button class="text-surface-400 px-1 hover:underline duration-200" on:click={importTask}>Import</button>
        <button class="text-surface-400 px-1 hover:underline duration-200" on:click={exportTask}>Export</button>
    </div>
    <div class="card w-full max-w-6xl h-full m-auto">
        <div class="grid grid-cols-2 w-full h-full p-5 space-x-5">
            <div class="grid grid-rows-[1fr_auto] h-full overflow-y-auto">
                <div class="h-full overflow-y-auto rounded">
                    <input class="input variant-form-material outline-0 text-4xl p-2" placeholder="Title"
                           bind:value={$task.title}>
                    <div class="mt-5 h-60 w-full">
                        <LaTeX_Editor content={content} reload={reloadContent}/>
                    </div>
                    <label class="label mt-14 mb-5">
                        <span>Answer Type</span>
                        <select class="select" bind:value={$task.answer.type}>
                            <option value="text">Text</option>
                            <option value="variables">Variables</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="simulation">Simulation</option>
                        </select>
                    </label>

                    {#if $task.answer.type === 'text'}
                        <div>
                    <textarea class="textarea h-64" placeholder="Enter the correct answer"
                              style="resize: none" bind:value={$task.answer.correct_text}></textarea>
                            <SlideToggle name="ai_correction" active="bg-primary-500" size="sm"
                                         bind:checked={$task.answer.ai_correct}>
                                {$task.answer.ai_correct ?
                                    'Yes, use AI to correct the users answer' :
                                    'No, do not use AI to correct the users answer'
                                }
                            </SlideToggle>
                        </div>
                    {:else if $task.answer.type === 'variables'}
                        <div class="max-h-72 overflow-y-auto p-1 rounded">
                            <div class="mb-4">
                                {#if $task.answer.variables}
                                    {#each $task.answer.variables as variable}
                                        <div class="mb-2 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                            <input class="input-group-shim pl-2 outline-0" placeholder="Name"
                                                   bind:value={variable.name}>
                                            <input class="pl-2 outline-0" placeholder="Correct Value"
                                                   bind:value={variable.correct_value}/>
                                            <button class="bg-error-500 w-24"
                                                    on:click={() => {removeVariable(variable.name)}}>
                                                Remove
                                            </button>
                                        </div>
                                    {/each}
                                {/if}
                            </div>

                            <div class="w-full h-[1px] bg-surface-500"></div>

                            <div class="mb-2 mt-4 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                <input class="input-group-shim pl-2 outline-0" placeholder="Name"
                                       bind:value={variableName}>
                                <input class="pl-2 outline-0" placeholder="Correct Value"
                                       bind:value={variableCorrectValue}/>
                                <button class="variant-filled-secondary w-24" on:click={addVariable}>Add</button>
                            </div>
                        </div>
                    {:else if $task.answer.type === 'multiple_choice'}
                        <div class="max-h-72 overflow-y-auto p-1 rounded">
                            <div class="mb-4">
                                {#if $task.answer.options}
                                    {#each $task.answer.options as option}
                                        <div class="mb-2 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                            <input type="checkbox"
                                                   class="input-group-shim pl-2 m-auto mx-5 checkbox {option.correct ? 'variant-filled-primary': 'variant-filled-surface'}"
                                                   bind:checked={option.correct}>
                                            <input class="pl-2 outline-0" placeholder="Name"
                                                   bind:value={option.name}/>
                                            <button class="bg-error-500 w-24"
                                                    on:click={() => {removeOption(option.name)}}>
                                                Remove
                                            </button>
                                        </div>
                                    {/each}
                                {/if}
                            </div>

                            <div class="w-full h-[1px] bg-surface-500"></div>

                            <div class="mb-2 mt-4 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                <input type="checkbox"
                                       class="input-group-shim pl-2 m-auto mx-5 checkbox {optionCorrectValue ? 'variant-filled-primary': 'variant-filled-surface'}"
                                       bind:checked={optionCorrectValue}>
                                <input class="pl-2 outline-0" placeholder="Name" bind:value={optionName}/>
                                <button class="variant-filled-secondary w-24" on:click={addOption}>Add</button>
                            </div>
                        </div>
                    {:else if $task.answer.type === 'simulation'}
                        <div>
                            <p class="text-center">Not implemented yet</p>
                        </div>
                    {/if}
                </div>

                <div class="mt-2">
                    <button class="btn rounded variant-filled-primary w-full" on:click={addExplanation}>Add
                        Explanation
                    </button>
                </div>
            </div>
            <div class="bg-surface-700 rounded p-5 overflow-y-auto">
                <label class="label mb-5">
                    <span>Reference Type</span>
                    <select class="select" bind:value={$task.extra.type}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="simulation">Simulation</option>
                    </select>
                </label>

                {#if $task.extra.type === "image"}
                    <div>
                        <input class="input variant-form-material outline-0 p-1" placeholder="Image URL"
                               bind:value={$task.extra.src}>

                        <img class="rounded mt-2" src={$task.extra.src || "robert-shunev-mS1nlYbq1kA-unsplash.jpg"}
                             alt="reference">
                    </div>
                {:else if $task.extra.type === "video"}
                    <div>
                        <input class="input variant-form-material outline-0 p-1" placeholder="Video URL"
                               bind:value={$task.extra.src}>

                        <div class="w-full h-72 mt-2 rounded overflow-hidden">
                            <VideoPlayer src={$task.extra.src || "pexels-akari-m-5927778 (1080p).mp4"}
                                         alt="Your Video"/>
                        </div>
                    </div>
                {:else if $task.extra.type === "audio"}
                    <div>
                        <input class="input variant-form-material outline-0 p-1" placeholder="Audio URL"
                               bind:value={$task.extra.src}>

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
    </div>

    {#if $task.explanation.steps.length > 0}
        <div class="card w-full max-w-6xl h-full m-auto my-5 p-5">
            <p class="h2 mb-10">Explanation:</p>
            <div>
                {#if !reloadStepper}
                    <Stepper buttonComplete="variant-filled" buttonCompleteLabel="Next →">
                        {#each $task.explanation.steps as step, i}
                            <Step locked={i === $task.explanation.steps.length - 1}>
                                <svelte:fragment slot="header">
                                    <p></p>
                                </svelte:fragment>
                                <input class="input rounded-md outline-0 p-2 text-2xl" bind:value={step.title}
                                       placeholder="Step 1">

                                <div class="grid grid-cols-2">
                                    <div class="h-96">
                                        <LaTeX_Editor content={stepContents[i]}/>
                                    </div>

                                    <div class="px-2">
                                        <label class="label mb-5">
                                            <select class="select" bind:value={step.extra.type}>
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                                <option value="audio">Audio</option>
                                                <option value="simulation">Simulation</option>
                                            </select>
                                        </label>

                                        {#if step.extra.type === "image"}
                                            <div>
                                                <input class="input variant-form-material outline-0 p-1"
                                                       placeholder="Image URL"
                                                       bind:value={step.extra.src}>

                                                <div class="bg-cover rounded bg-center w-full h-80 mt-3"
                                                     style="background-image: {getURL(step.extra.src || 'robert-shunev-mS1nlYbq1kA-unsplash.jpg')}">
                                                </div>


                                            </div>
                                        {:else if step.extra.type === "video"}
                                            <div>
                                                <input class="input variant-form-material outline-0 p-1"
                                                       placeholder="Video URL"
                                                       bind:value={step.extra.src}>

                                                <div class="w-full h-80 mt-3 rounded overflow-hidden">
                                                    <VideoPlayer
                                                            src={step.extra.src || "pexels-akari-m-5927778 (1080p).mp4"}
                                                            alt="Your Video"/>
                                                </div>
                                            </div>
                                        {:else if step.extra.type === "audio"}
                                            <div>
                                                <input class="input variant-form-material outline-0 p-1"
                                                       placeholder="Audio URL"
                                                       bind:value={step.extra.src}>

                                                <div class="w-full h-80 mt-3 rounded overflow-hidden">
                                                    <AudioPlayer src={step.extra.src || "spirit-blossom-15285.mp3"}
                                                                 alt="Your Audio"/>
                                                </div>
                                            </div>
                                        {:else if step.extra.type === "simulation"}
                                            <div>
                                                <p class="text-center">Not implemented yet</p>
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <div class="flex justify-between pt-10">
                                    <button class="btn rounded variant-glass-error"
                                            on:click={() => {removeStep(step.title)}}>Remove Step
                                    </button>
                                    <button class="btn rounded variant-filled-primary" on:click={addExplanation}>Add
                                        Step
                                    </button>
                                </div>
                            </Step>
                        {/each}
                    </Stepper>
                {/if}
            </div>
        </div>
    {/if}
</div>