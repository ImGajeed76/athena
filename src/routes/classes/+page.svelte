<script lang="ts">
    import {athenaClasses, createClass} from "$lib/database";
    import ClassPreview from "./ClassPreview.svelte";
    import {ProgressRadial} from "@skeletonlabs/skeleton";

    let loading = false;

    function createNewClass() {
        alert("This feature is not yet implemented")
    }
</script>

<div class="p-5 w-full h-full">
    {#if !loading}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl m-auto">
            {#each $athenaClasses as athenaClass}
                <ClassPreview title={athenaClass.name} description={athenaClass.description} image={athenaClass.banner}
                              uuid={athenaClass.uuid}/>
            {/each}
        </div>

        <div class="w-full flex justify-around mt-5">
            <button class="btn variant-filled-primary" on:click={createNewClass}>Create
                Class
            </button>
        </div>
    {:else}
        <div class="w-full h-full grid items-center">
            <ProgressRadial class="m-auto" size="large" color="primary"/>
        </div>
    {/if}
</div>