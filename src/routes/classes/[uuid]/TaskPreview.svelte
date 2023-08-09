<script lang="ts">
    import type {AthenaTask, AthenaTaskProgress} from "$lib/athenaTask";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {
        currentSession,
        deleteTask,
        getTask,
        getTaskData,
        getTaskProgress,
        updateClass,
        updateTaskUsers
    } from "$lib/database";
    import {millsToTimeFormat} from "$lib/utils";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";
    import type {AthenaClass} from "$lib/athenaClass";
    import type {ModalSettings} from "@skeletonlabs/skeleton";
    import {Modal, modalStore, SlideToggle} from "@skeletonlabs/skeleton";
    import VisibilityModal from "./VisibilityModal.svelte";

    export let athenaClass: Writable<AthenaClass | undefined>;
    export let taskUuid: string;
    export let subject: string;
    export let isAdmin: boolean;
    export let isCreator: boolean;

    let isTaskAdmin = false;

    let userProgress = writable<AthenaTaskProgress>();
    let originalTask: AthenaTask;

    onMount(async () => {
        if (!$athenaClass) throw new Error("No class provided");

        const taskData = await getTaskData(taskUuid);
        if (!taskData) {
            console.error(`No task found for [${subject}] with uuid [${taskUuid}]. Removing from subject.`);
            const subjectIndex = $athenaClass.subjects.findIndex(s => s.name === subject);
            $athenaClass.subjects[subjectIndex].task_uuids = $athenaClass.subjects[subjectIndex].task_uuids.filter(t => t !== taskUuid);
            await updateClass($athenaClass);
            return;
        }
        originalTask = taskData.task;

        const progress = await getTaskProgress(taskUuid, originalTask.answer);
        if (!progress) throw new Error(`No progress found for [${subject}] with uuid [${taskUuid}]`);
        userProgress.set(progress)

        if (!$currentSession) return;
        isTaskAdmin = taskData.admins.includes($currentSession.user.email ?? "");
    })

    async function deleteAthenaTask() {
        const confirmModal: ModalSettings = {
            type: "prompt",
            title: "Delete task",
            body: `Are you sure you want to delete this task? This action cannot be undone. Please type the [${originalTask.title}] to confirm.`,
            valueAttr: {type: "text", placeholder: "Task title", required: true},
            response: async (r: string) => {
                if (r === originalTask.title) {
                    if (!$athenaClass) throw new Error("No class provided");
                    const subjectIndex = $athenaClass.subjects.findIndex(s => s.name === subject);
                    $athenaClass.subjects[subjectIndex].task_uuids = $athenaClass.subjects[subjectIndex].task_uuids.filter(t => t !== taskUuid);
                    await updateClass($athenaClass);
                    await deleteTask(taskUuid);
                }
            }
        }

        modalStore.trigger(confirmModal);
    }

    async function openVisibility() {
        const visibilityModal: ModalSettings = {
            type: "component",
            component: {
                ref: VisibilityModal,
                props: {
                    taskUuid: taskUuid,
                    athenaClass: $athenaClass,
                    reopen: openVisibility
                }
            }
        }

        modalStore.trigger(visibilityModal);
    }
</script>

<Modal/>

{#if originalTask}
    {#if isTaskAdmin && (isAdmin || isCreator)}
        <div class="w-full h-24 bg-surface-600 rounded shadow p-5 hover:shadow-2xl duration-200 mb-5"
             style="cursor: pointer">
            <div class="flex justify-between">
                <p class="text-xl">{originalTask.title}</p>
            </div>
            <div class="flex justify-between mt-1">
                <div class="flex space-x-2">
                    <button class="chip variant-glass-error" on:click={deleteAthenaTask}>Delete</button>
                </div>
                <div class="flex space-x-2">
                    <button class="chip variant-glass hover:variant-filled-warning" on:click={openVisibility}>
                        Visibility
                    </button>
                    <button class="chip variant-glass hover:variant-filled-success"
                            on:click={() => {goto(`/classes/${$page.params.uuid}/${subject}/view/${taskUuid}`)}}>View
                    </button>
                    <button class="chip variant-filled-primary"
                            on:click={() => {goto(`/classes/${$page.params.uuid}/${subject}/edit/${taskUuid}`)}}>Edit
                    </button>
                </div>
            </div>
        </div>
    {:else}
        <div class="w-full h-24 bg-surface-600 rounded shadow p-5 hover:shadow-2xl duration-200 mb-5"
             style="cursor: pointer"
             on:click={() => {goto(`/classes/${$page.params.uuid}/${subject}/view/${taskUuid}`)}}
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
                <p class="text-sm text-surface-200">You have completed this task
                    in {millsToTimeFormat($userProgress.solve_time)}</p>
            {:else if $userProgress && !$userProgress.seen}
                <p class="text-sm text-surface-200">You have not seen this task yet.</p>
            {/if}
        </div>
    {/if}
{/if}