<script lang="ts">
    import type {PopupSettings} from "@skeletonlabs/skeleton";
    import {modalStore, popup, ProgressRadial, toastStore} from '@skeletonlabs/skeleton';
    import type {AthenaClass} from "$lib/athenaClass";
    import type {AthenaTaskData} from "$lib/athenaTask";
    import {onMount} from "svelte";
    import {currentSession, getTaskData, updateTaskAdmins, updateTaskUsers} from "$lib/database";
    import {writable} from "svelte/store";

    // Props
    /** Exposes parent props to this component. */
    export let parent: any;

    export let taskUuid: string;
    export let athenaClass: AthenaClass;

    export let reopen: () => void;


    // Local
    let task = writable<AthenaTaskData>();

    onMount(async () => {
        const athenaTask = await getTaskData(taskUuid);
        if (athenaTask) task = writable(athenaTask);
    })

    // Handle Form Submission
    function onFormSubmit(): void {
        modalStore.close();
    }

    // Base Classes
    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';

    async function makeVisible(email: string) {
        await updateTaskUsers(taskUuid, [email], "append");
        await updateTask();
    }

    async function makeHidden(email: string) {
        if ($currentSession?.user?.email === email) {
            modalStore.clear();
            modalStore.trigger({
                type: "alert",
                title: "Error",
                body: "You cannot remove yourself as an admin",
                response: reopen
            })
        }
        await updateTaskAdmins(taskUuid, [email], "remove");
        await updateTaskUsers(taskUuid, [email], "remove");
        await updateTask();
    }

    async function makeAdmin(email: string) {
        await updateTaskAdmins(taskUuid, [email], "append");
        await updateTask();
    }

    async function makeNotAdmin(email: string) {
        if ($currentSession?.user?.email === email) {
            modalStore.clear();
            modalStore.trigger({
                type: "alert",
                title: "Error",
                body: "You cannot remove yourself as an admin",
                response: reopen
            })
        }
        await updateTaskAdmins(taskUuid, [email], "remove");
        await updateTask();
    }

    async function updateTask() {
        const athenaTask = await getTaskData(taskUuid);
        if (athenaTask) task = writable(athenaTask);
    }

    async function allVisible() {
        await updateTaskUsers(taskUuid, athenaClass.users, "append");
        await updateTask();
    }

    async function allHidden() {
        await updateTaskUsers(taskUuid, athenaClass.users, "remove");
        await updateTask();
    }
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
    <div class="modal-example-form {cBase}">
        <header class={cHeader}>Visibility</header>
        <article>Change the visibility of your task</article>
        {#if $task}
            <div>
                <div class="grid grid-cols-2">
                    <p>Email:</p>
                    <p>Visibility:</p>
                </div>
            </div>

            <hr>

            <div class="h-full max-h-60">
                {#each athenaClass.users as user}
                    <div class="my-4">
                        <div class="grid grid-cols-2">
                            <p>{user}</p>
                            <div class="flex justify-between">
                                {#if $task.users.includes(user)}
                                    <div class="flex">
                                        <button class="chip variant-glass-success mr-2"
                                                on:click={() => makeHidden(user)}>Visible
                                        </button>
                                        {#if $task.admins.includes(user)}
                                            <button class="chip variant-glass-success"
                                                    on:click={() => makeNotAdmin(user)}>Admin
                                            </button>
                                        {:else}
                                            <button class="chip variant-glass-warning" on:click={() => makeAdmin(user)}>
                                                Make Admin
                                            </button>
                                        {/if}
                                    </div>
                                {:else}
                                    <button class="chip variant-glass-warning" on:click={() => makeVisible(user)}>
                                        Hidden
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            <hr>
            <div class="w-full flex space-x-2">
                <button class="chip rounded variant-filled-primary" on:click={allVisible}>All Visible</button>
                <button class="chip rounded variant-glass-primary" on:click={allHidden}>All Hidden</button>
            </div>
        {:else}
            <div class="w-full h-full grid items-center">
                <ProgressRadial class="mx-auto"/>
            </div>
        {/if}
        <!-- prettier-ignore -->
        <footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Confirm</button>
        </footer>
    </div>
{/if}