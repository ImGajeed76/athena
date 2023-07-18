<script lang="ts">
    import type {AthenaTask} from "$lib/athenaTask";

    export let originalTask: AthenaTask;
    export let isAdmin: boolean;
</script>

<div class="w-full h-32 bg-surface-600 rounded shadow-2xl p-3">
    <p class="text-xl">{originalTask.title}</p>
    <p></p>
</div>