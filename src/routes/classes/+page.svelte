<script lang="ts">
    import {athenaClasses, createClass, currentSession} from "$lib/database";
    import ClassPreview from "./ClassPreview.svelte";
    import type {ModalSettings} from "@skeletonlabs/skeleton";
    import {modalStore} from "@skeletonlabs/skeleton";

    function createNewClass() {
        const classNameModal: ModalSettings = {
            type: "prompt",
            title: "New Class",
            body: "What is the name of the class?",
            valueAttr: {type: "text", minlength: 1, required: true},
            response: async (r: string) => {
                if (r) {
                    await createClass(r, "Some description of your new class");
                }
            }
        }

        modalStore.trigger(classNameModal);
    }
</script>

<div class="p-5 w-full h-full">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl m-auto">
        {#each $athenaClasses as athenaClass}
            <ClassPreview title={athenaClass.name} description={athenaClass.description} image={athenaClass.banner}
                          uuid={athenaClass.uuid}/>
        {/each}
    </div>

    <div class="w-full flex justify-around mt-5">
        {#if $currentSession}
            <button class="btn variant-filled-primary" on:click={createNewClass}>
                Create Class
            </button>
        {:else}
            <a href="/login" class="btn variant-filled-primary">
                Please Login
            </a>
        {/if}
    </div>
</div>