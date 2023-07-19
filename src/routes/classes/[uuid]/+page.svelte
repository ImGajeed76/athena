<script lang="ts">
    import {onMount} from "svelte";
    import {page} from "$app/stores";
    import type {AthenaClass} from "$lib/athenaClass";
    import {athenaClasses, currentSession, updateClass} from "$lib/database";
    import type {ModalSettings} from "@skeletonlabs/skeleton";
    import {AppRail, AppRailAnchor, AppRailTile, Modal, modalStore, Toast, toastStore} from "@skeletonlabs/skeleton";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import TaskPreview from "./TaskPreview.svelte";

    let uuid = $page.params.uuid;
    let athenaClass: Writable<AthenaClass | undefined> = writable(undefined);
    let originalAthanaClass = "";

    let isAdmin = false;

    athenaClasses.subscribe(classes => {
        athenaClass = writable(classes.find(c => c.uuid === uuid)) || writable(undefined);
        originalAthanaClass = JSON.stringify($athenaClass);
        const currentUserEmail = $currentSession?.user.email;
        if (currentUserEmail) {
            isAdmin = $athenaClass?.admins.includes(currentUserEmail) || false;
        }
    })

    onMount(() => {
        athenaClass = writable($athenaClasses.find(c => c.uuid === uuid)) || writable(undefined);
        originalAthanaClass = JSON.stringify($athenaClass);
        console.log($athenaClass);
    })

    let currentTile = 1;

    async function addSubject() {
        const subjectNameModal: ModalSettings = {
            type: "prompt",
            title: "New Subject",
            body: "What is the name of the subject?",
            valueAttr: {type: "text", minlength: 1, required: true},
            response: async (r: string) => {
                if (r) {
                    if (!$athenaClass) return;
                    if (!$athenaClass.subjects.find(s => s.name === r)) {
                        $athenaClass.subjects.push({name: r, description: "", tasks: []});

                        await updateClass($athenaClass);
                    } else {
                        toastStore.trigger({
                            message: "Subject already exists!",
                            timeout: 2000,
                            background: "variant-filled-error"
                        })
                    }
                }
            }
        }

        modalStore.trigger(subjectNameModal);
    }
</script>


{#if $athenaClass}
    <div class="h-full grid grid-rows-[auto_1fr]">
        <div class="sticky top-0 w-full h-52 -z-10">
            <div class="-z-10 h-full w-full bg-cover bg-center absolute"
                 style="background-image: {`url(${$athenaClass.banner || 'k-soma-plXL7vYXfyA-unsplash.jpg'})`}"></div>
            <div class="h-full w-full max-w-2xl grid items-center">
                <div class="text-6xl m-5 p-5">
                    <div class="-m-2 absolute w-full max-w-2xl h-20 rounded bg-white opacity-10 backdrop-blur-2xl">
                    </div>
                    <p>{$athenaClass.name}</p>
                </div>
            </div>
        </div>

        <div class="h-full bg-surface-900">
            <div class="grid grid-cols-[auto_1fr] h-full">
                <AppRail width="w-60" height="h-full" aspectRatio="">
                    <svelte:fragment slot="lead">
                        <AppRailAnchor><p class="h4 m-3">Subjects:</p></AppRailAnchor>
                    </svelte:fragment>

                    <AppRailTile bind:group={currentTile} name="tile-{0}" value={0} title="tile-{0}">
                        <div class="m-3 h6 flex justify-between">
                            <p>Home</p>
                            {#if currentTile === 0}
                                <p>-></p>
                            {/if}
                        </div>
                    </AppRailTile>

                    {#each $athenaClass.subjects as subject, i}
                        <AppRailTile bind:group={currentTile} name="tile-{i+1}" value={i+1} title="tile-{i+1}">
                            <div class="m-3 h6 flex justify-between">
                                <p>{subject.name}</p>
                                {#if currentTile === i + 1}
                                    <p>-></p>
                                {/if}
                            </div>
                        </AppRailTile>
                    {/each}

                    {#if isAdmin}
                        <hr class="my-3">
                        <div>
                            <div class="px-5">
                                <button class="w-full h-full btn variant-glass-primary" on:click={addSubject}>
                                    New Subject
                                </button>
                            </div>
                        </div>
                    {/if}
                </AppRail>
                <div class="w-full h-full p-10 overflow-y-auto">
                    {#if currentTile === 0}
                        <div class="h-full grid grid-rows-[auto_auto_1fr]">
                            <p class="h1">About {$athenaClass.name}</p>
                            <hr class="my-5">
                            {#if isAdmin}
                                <textarea class="w-full h-full p-5 rounded textarea"
                                          bind:value={$athenaClass.description}
                                          on:blur={async () => {
                                              if (originalAthanaClass === JSON.stringify($athenaClass)) return;
                                              await updateClass($athenaClass);
                                              toastStore.trigger({
                                                message: "Changes saved!",
                                                timeout: 2000,
                                                background: "variant-filled-success"
                                              })
                                          }}
                                          placeholder="Description..."
                                          style="resize: none"></textarea>
                            {:else}
                                <p>{$athenaClass.description}</p>
                            {/if}
                        </div>
                    {:else}
                        <div class="h-full">
                            <p class="h1">{$athenaClass.subjects[currentTile - 1].name}</p>
                            <hr class="my-5">
                            {#if isAdmin}
                                <textarea class="w-full h-40 p-5 rounded textarea"
                                          bind:value={$athenaClass.subjects[currentTile - 1].description}
                                          on:blur={async () => {
                                              if (originalAthanaClass === JSON.stringify($athenaClass)) return;
                                              await updateClass($athenaClass);
                                              toastStore.trigger({
                                                message: "Changes saved!",
                                                timeout: 2000,
                                                background: "variant-filled-success"
                                              })
                                          }}
                                          placeholder="Description..."
                                          style="resize: none"></textarea>
                            {:else}
                                <p>{$athenaClass.subjects[currentTile - 1].description}</p>
                            {/if}

                            <div class="card w-full h-fit mt-5 p-5">
                                {#if $athenaClass.subjects[currentTile - 1].tasks.length > 0}
                                    {#each $athenaClass.subjects[currentTile - 1].tasks as task}
                                        <TaskPreview originalTask={task} isAdmin={isAdmin} subject={encodeURIComponent($athenaClass.subjects[currentTile - 1].name)}/>
                                    {/each}
                                {:else}
                                    <p class="text-center">no tasks to display</p>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
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
