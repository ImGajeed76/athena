<script lang="ts">
    import Task_Editor from "../../modules/Task_Editor.svelte";
    import {LightSwitch, Tab, TabGroup} from "@skeletonlabs/skeleton";
    import Task_Viewer from "../../modules/Task_Viewer.svelte";
    import type {Writable} from "svelte/store";
    import type {AthenaTask} from "$lib/athenaTask";
    import {writable} from "svelte/store";
    import {createEmptyTask} from "$lib/athenaTask";

    let tabSet = 0;

    let task: Writable<AthenaTask> = writable(createEmptyTask());
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
</div>