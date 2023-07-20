<script lang="ts">
    import type {AthenaTask, AthenaTaskProgress} from "$lib/athenaTask";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {deleteTask, getTask, getTaskData, getTaskProgress, updateClass, updateTaskUsers} from "$lib/database";
    import {millsToTimeFormat} from "$lib/utils";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";
    import type {AthenaClass} from "$lib/athenaClass";
    import type {ModalSettings} from "@skeletonlabs/skeleton";
    import {modalStore, SlideToggle} from "@skeletonlabs/skeleton";

    export let athenaClass: Writable<AthenaClass>;
    export let taskUuid: string;
    export let subject: string;
    export let isAdmin: boolean;
    export let isEditing: boolean;

    let userProgress = writable<AthenaTaskProgress>();
    let originalTask: AthenaTask;

    let visible = writable(false);

    onMount(async () => {
        const taskData = await getTaskData(taskUuid);
        if (!taskData) {
            console.error(`No task found for [${subject}] with uuid [${taskUuid}]. Removing from subject.`);
            const subjectIndex = $athenaClass.subjects.findIndex(s => s.name === subject);
            $athenaClass.subjects[subjectIndex].task_uuids = $athenaClass.subjects[subjectIndex].task_uuids.filter(t => t !== taskUuid);
            await updateClass($athenaClass);
            return;
        }
        originalTask = taskData.task;
        visible = writable(taskData.users === $athenaClass.users);

        const progress = await getTaskProgress(taskUuid);
        console.log(progress);
        if (!progress) throw new Error(`No progress found for [${subject}] with uuid [${taskUuid}]`);
        userProgress.set(progress)


        console.log($page)
    })

    async function deleteAthenaTask() {
        const confirmModal: ModalSettings = {
            type: "prompt",
            title: "Delete task",
            body: `Are you sure you want to delete this task? This action cannot be undone. Please type the [${originalTask.title}] to confirm.`,
            valueAttr: {type: "text", placeholder: "Task title", required: true},
            response: async (r: string) => {
                if (r === originalTask.title) {
                    const subjectIndex = $athenaClass.subjects.findIndex(s => s.name === subject);
                    $athenaClass.subjects[subjectIndex].task_uuids = $athenaClass.subjects[subjectIndex].task_uuids.filter(t => t !== taskUuid);
                    await updateClass($athenaClass);
                    await deleteTask(taskUuid);
                }
            }
        }

        modalStore.trigger(confirmModal);
    }


    visible.subscribe(async (value) => {
        if (value) await updateTaskUsers(taskUuid, $athenaClass.users, "append")
        else await updateTaskUsers(taskUuid, $athenaClass.users, "remove")
    })
</script>

{#if originalTask}
    {#if isAdmin && isEditing}
        <div class="w-full h-24 bg-surface-600 rounded shadow p-5 hover:shadow-2xl duration-200"
             style="cursor: pointer">
            <div class="flex justify-between">
                <p class="text-xl">{originalTask.title}</p>
            </div>
            <div class="flex justify-between mt-1">
                <div class="flex">
                    <button class="chip variant-filled-primary mr-2"
                            on:click={goto(`/classes/${$page.params.uuid}/${subject}/edit/${taskUuid}`)}>Edit
                    </button>
                    <button class="chip variant-glass-error" on:click={deleteAthenaTask}>Delete</button>
                </div>
                <SlideToggle size="sm" bind:checked={$visible}>User Visibility</SlideToggle>
            </div>
        </div>
    {:else}
        <div class="w-full h-24 bg-surface-600 rounded shadow p-5 hover:shadow-2xl duration-200" style="cursor: pointer"
             on:click={goto(`/classes/${$page.params.uuid}/${subject}/view/${taskUuid}`)}
             on:keydown={()=>{/**/}}
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
                <p class="text-sm text-surface-200">You're already on it
                    since {millsToTimeFormat($userProgress.solve_time)}</p>
            {:else if $userProgress && $userProgress.seen && $userProgress.completed}
                <p class="text-sm text-surface-200">You have completed this task in {millsToTimeFormat($userProgress.solve_time)}</p>
            {:else if $userProgress && !$userProgress.seen}
                <p class="text-sm text-surface-200">You have not seen this task yet.</p>
            {/if}
        </div>
    {/if}
{/if}