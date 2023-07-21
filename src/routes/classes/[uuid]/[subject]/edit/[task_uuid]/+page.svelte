<script lang="ts">
    import {page} from "$app/stores";
    import {onDestroy, onMount} from "svelte";
    import {athenaClasses, getTask, updateTask} from "$lib/database";
    import type {AthenaTask} from "$lib/athenaTask";
    import Task_Editor from "../../../../../../modules/Task_Editor.svelte";
    import {writable} from "svelte/store";
    import {ProgressRadial, Tab, TabGroup, toastStore} from "@skeletonlabs/skeleton";
    import Task_Viewer from "../../../../../../modules/Task_Viewer.svelte";
    import {removeAllAnswers} from "$lib/athenaTask.js";

    let taskUuid = $page.params.task_uuid;

    let task = writable<AthenaTask>();
    let currentTab = 0;

    let loading = true;

    athenaClasses.subscribe(async () => {
        if (!loading) return;
        const athenaTask = await getTask(taskUuid);
        if (!athenaTask) return;
        $task = athenaTask;
        loading = false;
    })

    let saveEvent = null;

    onMount(async () => {
        const startPathName = window.location.pathname;

        saveEvent =  async (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                if (window.location.pathname !== startPathName) {
                    window.removeEventListener("keydown", saveEvent);
                    return;
                }

                if (await saveTask()) {
                    toastStore.trigger({
                        message: "Task saved!",
                        background: "variant-filled-success",
                        timeout: 3000
                    })
                } else {
                    toastStore.trigger({
                        message: "Failed to save task!",
                        background: "variant-filled-error",
                        timeout: 3000
                    })
                }
            }
        }

        window.addEventListener("keydown", saveEvent);

        const athenaTask = await getTask(taskUuid);
        if (!athenaTask) return;
        $task = athenaTask;
        loading = false;
    })

    onDestroy(() => {
        saveTask();
    });

    async function saveTask() {
        if (!$task) return;
        return await updateTask(removeAllAnswers($task));
    }

    setInterval(() => {
        saveTask();
    }, 10000);
</script>

{#if !loading}
    {#if $task}
        <div class="h-full w-full px-20 pt-10 pb-20">
            <div class="mb-3">
                <TabGroup>
                    <Tab bind:group={currentTab} name="task_editor" value={0}>
                        <p>Task Editor</p>
                    </Tab>
                    <Tab bind:group={currentTab} name="task_viewer" value={1}>
                        <p>Task Viewer</p>
                    </Tab>
                </TabGroup>
            </div>
            {#if currentTab === 0}
                <Task_Editor task={task}/>
            {:else if currentTab === 1}
                <Task_Viewer task={task}/>
            {/if}
        </div>
    {:else}
        <div class="w-full h-full grid items-center text-center">
            <div>
                <h1 class="h2">Nope, not only you. John is also confused...</h1>
                <img class="m-auto rounded mt-5"
                     src="https://media3.giphy.com/media/9r4Mm0byurei43ejVd/giphy.gif?cid=ecf05e47rk6xo648h7gzubwb7x8fjluktw5nx6ctafk2ue7n&ep=v1_gifs_related&rid=giphy.gif&ct=g"
                     alt="meme">
            </div>
        </div>
    {/if}
{:else}
    <div class="w-full h-full grid items-center">
        <div>
            <ProgressRadial class="m-auto" size="large" color="primary"/>
            <p class="text-center mt-5">Loading...</p>
        </div>
    </div>
{/if}