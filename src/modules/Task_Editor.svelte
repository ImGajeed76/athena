<script lang="ts">
    import type {Writable} from "svelte/store";
    import type {Task} from "$lib/task";
    import {createEmptyTask} from "$lib/task";
    import {writable} from "svelte/store";
    import LaTeX_Editor from "./LaTeX_Editor.svelte";
    import {SlideToggle, Toast, toastStore} from "@skeletonlabs/skeleton";

    let variableName = '';
    let variableCorrectValue = '';

    let optionName = '';
    let optionCorrectValue = false;

    export let task: Writable<Task> = writable(createEmptyTask());
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

</script>

<Toast/>

<div class="card w-full max-w-6xl h-full m-auto">
    <div class="grid grid-cols-2 w-full h-full p-5 space-x-5">
        <div class="grid grid-rows-[1fr_auto]">
            <div>
                <input class="input variant-form-material outline-0 text-4xl p-2" placeholder="Title"
                       bind:value={$task.title}>
                <div class="mt-5 h-full max-h-72">
                    <LaTeX_Editor content={content}/>
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
                    <textarea class="textarea h-80" placeholder="Enter the correct answer"
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
                            <input class="input-group-shim pl-2 outline-0" placeholder="Name" bind:value={variableName}>
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
                                        <button class="bg-error-500 w-24" on:click={() => {removeOption(option.name)}}>
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

            <div>
                <button class="btn rounded variant-filled-primary w-full">Save</button>
            </div>
        </div>
        <div class="bg-surface-700">
        </div>
    </div>
</div>