<script lang="ts">
    import Task_Editor from "../../modules/Task_Editor.svelte";
    import {LightSwitch, modalStore, Tab, TabGroup, toastStore} from "@skeletonlabs/skeleton";
    import Task_Viewer from "../../modules/Task_Viewer.svelte";
    import type {Writable} from "svelte/store";
    import type {AthenaTask} from "$lib/athenaTask";
    import {writable} from "svelte/store";
    import {createEmptyTask} from "$lib/athenaTask";
    import {onMount} from "svelte";
    import {download} from "$lib/utils";

    let tabSet = 0;

    let task: Writable<AthenaTask> = writable(createEmptyTask());

    onMount(() => {
        const startPathName = window.location.pathname;
        const saveEvent = (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                if (window.location.pathname !== startPathName) {
                    window.removeEventListener("keydown", saveEvent);
                    return;
                }

                saveTask();
            }
        }

        window.addEventListener("keydown", saveEvent);
    });

    function saveTask() {
        modalStore.trigger({
            type: "confirm",
            title: "Save Task",
            body: "Please note that you cant save tasks here. Would you like to export the task?",
            response: (response) => {
                if (response) {
                    let filename = ($task.title.replace(/ /g, '_').toLowerCase() || "some_task") + '.athena';
                    download(filename, JSON.stringify($task));
                }
            }
        })
    }
</script>

<div class="h-full w-full px-20 pt-10 pb-20">
    <div class="mb-3">
        <TabGroup>
            <Tab bind:group={tabSet} name="task_editor" value={0}>
                <p>Task Editor</p>
            </Tab>
            <Tab bind:group={tabSet}  name="task_viewer" value={1}>
                <p>Task Viewer</p>
            </Tab>
        </TabGroup>
    </div>
    {#if tabSet === 0}
        <Task_Editor task={task}/>
    {:else if tabSet === 1}
        <Task_Viewer task={task}/>
    {/if}
    <div class="w-full flex justify-around">
        <button class="btn variant-glass-success rounded" on:click={saveTask}>Save Task</button>
    </div>
</div>