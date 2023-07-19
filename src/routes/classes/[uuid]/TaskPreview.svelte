<script lang="ts">
    import type {AthenaTask, AthenaTaskProgress} from "$lib/athenaTask";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {getTaskProgress} from "$lib/database";
    import {millsToTimeFormat} from "$lib/utils";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";

    export let originalTask: AthenaTask;
    export let subject: string;
    export let isAdmin: boolean;

    let userProgress = writable<AthenaTaskProgress>();

    onMount(async () => {
        const progress = await getTaskProgress(originalTask.uuid);
        console.log(progress);
        if (!progress) throw new Error("No progress found for [subject]");
        userProgress.set(progress)

        console.log($page)
    })
</script>

<div class="w-full h-24 bg-surface-600 rounded shadow p-5 hover:shadow-2xl duration-200" style="cursor: pointer"
     on:click={goto(`/classes/${$page.params.uuid}/${subject}/${originalTask.uuid}`)}
     on:keydown={()=>{return}}
>
    <div class="flex justify-between">
        <p class="text-xl">{originalTask.title}</p>
        {#if $userProgress}
            {#if !$userProgress.seen}
                <span class="chip variant-filled-primary">New</span>
            {:else if !$userProgress.completed}
                <span class="chip variant-filled">Seen</span>
            {:else}
                <span class="chip variant-filled-success">Completed</span>
            {/if}
        {/if}
    </div>
    {#if $userProgress && $userProgress.seen && !$userProgress.completed}
        <p class="text-sm text-surface-200">You're already on it since {millsToTimeFormat($userProgress.solve_time)}</p>
    {:else if $userProgress && $userProgress.seen && $userProgress.completed}
        <p class="text-sm text-surface-200">You have already completed this task.</p>
    {:else if $userProgress && !$userProgress.seen}
        <p class="text-sm text-surface-200">You have not seen this task yet.</p>
    {/if}
</div>