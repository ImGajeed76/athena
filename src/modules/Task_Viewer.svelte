<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {Task} from "$lib/task";
    import {createEmptyTask} from "$lib/task";
    import LaTeX_Viewer from "./LaTeX_Viewer.svelte";
    import VideoPlayer from "./VideoPlayer.svelte";
    import AudioPlayer from "./AudioPlayer.svelte";

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
</script>


<div class="p-5 w-full h-full">
    <div class="card w-full max-w-6xl h-full m-auto">
        <div class="grid grid-cols-2 w-full h-full p-5 space-x-5">
            <div class="grid grid-rows-[1fr_auto] overflow-y-auto">
                <div class="h-full overflow-auto rounded">
                    <p class="outline-0 text-4xl p-2">{$task.title || 'Some title'}</p>
                    <div class="mt-5 mb-5 h-full max-h-72">
                        <LaTeX_Viewer content={content}/>
                    </div>

                    {#if $task.answer.type === 'text'}
                        <div>
                    <textarea class="textarea h-80" placeholder="Enter your answer"
                              style="resize: none" bind:value={$task.answer.text}></textarea>
                        </div>
                    {:else if $task.answer.type === 'variables'}
                        <div class="max-h-96 overflow-y-auto p-1 rounded">
                            {#if $task.answer.variables}
                                {#each $task.answer.variables as variable}
                                    <div class="mb-2 input-group input-group-divider grid-cols-[auto_1fr_auto] h-10 rounded">
                                        <div class="input-group-shim w-24">{variable.name}</div>
                                        <input class="pl-2 outline-0" placeholder="Your answer"
                                               bind:value={variable.value}/>
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
                                               bind:checked={option.selected}>
                                        <div class="pl-2 outline-0">{option.name}</div>
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

                <div class="mt-2">
                    <button class="btn variant-filled-primary rounded w-full">
                        Submit
                    </button>
                </div>
            </div>
            <div class="bg-surface-700 rounded p-5 overflow-y-auto">
                {#if $task.extra.type === "image"}
                    <div>
                        <img class="rounded mt-2" src={$task.extra.src || "robert-shunev-mS1nlYbq1kA-unsplash.jpg"}
                             alt="image">
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
    </div>
</div>