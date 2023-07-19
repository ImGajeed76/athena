<script lang="ts">
    import {page} from "$app/stores";
    import {writable} from "svelte/store";
    import type {AthenaTask, AthenaTaskProgress} from "$lib/athenaTask";
    import {onMount} from "svelte";
    import {athenaClasses, getTaskProgress, updateTaskProgress} from "$lib/database";
    import Task_Viewer from "../../../../../modules/Task_Viewer.svelte";
    import {goto} from "$app/navigation";

    let uuid = $page.params.uuid;
    let subject = decodeURIComponent($page.params.subject);
    let task_uuid = $page.params.task_uuid;

    let task = writable<AthenaTask>();
    let user_progress = writable<AthenaTaskProgress>();

    let startTimeInMills = Date.now();

    onMount(async () => {
        const athenaClass = $athenaClasses.find(c => c.uuid === uuid);
        if (!athenaClass) return;

        const athenaSubject = athenaClass.subjects.find(s => s.name === subject);
        if (!athenaSubject) return;

        const athenaTask = athenaSubject.tasks.find(t => t.uuid === task_uuid);
        if (!athenaTask) return;
        task.set(JSON.parse(JSON.stringify(athenaTask)));

        const athenaTaskProgress = await getTaskProgress(athenaTask.uuid);
        if (!athenaTaskProgress) return;
        user_progress.set(athenaTaskProgress);

        if (!$user_progress.seen) {
            $user_progress.seen = true;
            await updateTaskProgress($user_progress.uuid, $user_progress);
        }
    })

    const timeUpdater = setInterval(() => {
        if (!$user_progress) return;
        if (window.location.pathname === `/classes/${uuid}/${subject}/${task_uuid}` && !$user_progress.completed) {
            let timeElapsed = Date.now() - startTimeInMills;
            startTimeInMills = Date.now();
            $user_progress.solve_time += timeElapsed;
            updateTaskProgress($user_progress.uuid, $user_progress);
        } else {
            clearInterval(timeUpdater);
        }
    }, 5000)

    function onComplete(allCorrect: boolean) {
        if (!$user_progress.completed) $user_progress.completed = allCorrect;
        goto(`/classes/${uuid}`);
    }
</script>

{#if $task}
    <div class="pt-10">
        <Task_Viewer task={task} onComplete={onComplete}/>
    </div>
{/if}