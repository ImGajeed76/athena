<script lang="ts">
    import {onMount} from "svelte";
    import {page} from "$app/stores";
    import type {AthenaClass} from "$lib/athenaClass";
    import {
        athenaClasses,
        createTask,
        currentSession,
        deleteClass,
        getTaskData,
        updateClass,
        updateTaskUsers
    } from "$lib/database";
    import type {ModalSettings} from "@skeletonlabs/skeleton";
    import {
        AppRail,
        AppRailAnchor,
        AppRailTile, Modal,
        modalStore,
        ProgressRadial,
        SlideToggle, Toast,
        toastStore
    } from "@skeletonlabs/skeleton";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import TaskPreview from "./TaskPreview.svelte";
    import {createEmptyTask} from "$lib/athenaTask";
    import {goto} from "$app/navigation";
    import {validateEmail} from "$lib/utils";

    let uuid = $page.params.uuid;
    let athenaClass: Writable<AthenaClass | undefined> = writable(undefined);
    let originalAthenaClass = "";

    let isAdmin = false;
    let isEditing = false;

    let loading = true;
    let loadingText = "Loading...";

    athenaClasses.subscribe(classes => {
        if (classes.length === 0) return;
        athenaClass = writable(classes.find(c => c.uuid === uuid)) || writable(undefined);
        originalAthenaClass = JSON.stringify($athenaClass);
        const currentUserEmail = $currentSession?.user.email;
        if (currentUserEmail) {
            isAdmin = $athenaClass?.admins.includes(currentUserEmail) || false;
        }
        loading = false;
    })

    onMount(() => {
        setTimeout(() => {
            if (loading) {
                loadingText = "This is taking longer than usual...";
            }
        }, 5000);

        setTimeout(() => {
            if (loading) {
                loadingText = "Maybe try refreshing the page?";
            }
        }, 15000);

        if ($athenaClasses.length === 0) return;
        athenaClass = writable($athenaClasses.find(c => c.uuid === uuid)) || writable(undefined);
        originalAthenaClass = JSON.stringify($athenaClass);
        const currentUserEmail = $currentSession?.user.email;
        if (currentUserEmail) {
            isAdmin = $athenaClass?.admins.includes(currentUserEmail) || false;
        }
        loading = false;
    })

    let currentTile = 0;

    async function addSubject() {
        if (!isAdmin) return;
        const subjectNameModal: ModalSettings = {
            type: "prompt",
            title: "New Subject",
            body: "What is the name of the subject?",
            valueAttr: {type: "text", minlength: 1, required: true},
            response: async (r: string) => {
                if (r) {
                    if (!$athenaClass) return;
                    if (!$athenaClass.subjects.find(s => s.name === r)) {
                        $athenaClass.subjects.push({name: r, description: "", task_uuids: []});

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

    async function addTask() {
        if (!isAdmin) return;
        if (!$athenaClass) return;
        const newTask = createEmptyTask();
        newTask.title = "New Task";
        $athenaClass.subjects[currentTile - tilesBefore].task_uuids.push(newTask.uuid);
        await updateClass($athenaClass);
        await createTask(newTask);
        await goto(`/classes/${$athenaClass.uuid}/${$athenaClass.subjects[currentTile - tilesBefore].name}/edit/${newTask.uuid}`);
    }

    async function changeBanner() {
        if (!isAdmin) return;
        const bannerModal: ModalSettings = {
            type: "prompt",
            title: "Change Banner",
            body: "What is the URL of the new banner?",
            valueAttr: {type: "url", minlength: 1, required: true},
            response: async (r: string) => {
                if (r) {
                    if (!$athenaClass) return;
                    $athenaClass.banner = r;
                    if (await updateClass($athenaClass)) {
                        toastStore.trigger({
                            message: "Banner updated!",
                            timeout: 2000,
                            background: "variant-filled-success"
                        })
                    } else {
                        toastStore.trigger({
                            message: "Banner update failed!",
                            timeout: 2000,
                            background: "variant-filled-error"
                        })
                    }
                }
            }
        }

        modalStore.trigger(bannerModal);
    }

    let tilesBefore = 2;

    async function makeAdmin(email: string) {
        if (!isAdmin) return;
        if (!$athenaClass) return;
        if (!$athenaClass.admins.includes(email)) {
            $athenaClass.admins.push(email);
            if (await updateClass($athenaClass)) {
                toastStore.trigger({
                    message: "User is now an admin!",
                    timeout: 2000,
                    background: "variant-filled-success"
                })
            } else {
                toastStore.trigger({
                    message: "Failed to make user an admin!",
                    timeout: 2000,
                    background: "variant-filled-error"
                })
            }
        }
    }

    async function makeUser(email: string) {
        if (!isAdmin) return;
        if (!$athenaClass) return;

        if (email === $currentSession?.user.email) {
            toastStore.trigger({
                message: "You can't make yourself a user!",
                timeout: 2000,
                background: "variant-filled-error"
            })
            return;
        }

        if ($athenaClass.admins.includes(email)) {
            $athenaClass.admins = $athenaClass.admins.filter(e => e !== email);
            if (await updateClass($athenaClass)) {
                toastStore.trigger({
                    message: "Admin is now a user!",
                    timeout: 2000,
                    background: "variant-filled-success"
                })
            } else {
                toastStore.trigger({
                    message: "Failed to make user a user!",
                    timeout: 2000,
                    background: "variant-filled-error"
                })
            }
        }
    }

    async function addUser() {
        if (!$athenaClass) return;
        const oldClassUsers = [...$athenaClass.users];
        if (!isAdmin) return;
        const emailModal: ModalSettings = {
            type: "prompt",
            title: "Add User",
            body: "What is the email of the user?",
            valueAttr: {type: "email", minlength: 1, required: true},
            response: async (r: string) => {
                if (r) {
                    if (!$athenaClass) return;
                    if (!$athenaClass.users.includes(r)) {
                        $athenaClass.users.push(r);
                        if (!validateEmail(r)) {
                            toastStore.trigger({
                                message: "Invalid email!",
                                timeout: 2000,
                                background: "variant-filled-error"
                            })
                            return;
                        }

                        if (await updateClass($athenaClass)) {
                            toastStore.trigger({
                                message: "User added!",
                                timeout: 2000,
                                background: "variant-filled-success"
                            })
                            await updateTaskUsersFromClass(oldClassUsers);
                        } else {
                            toastStore.trigger({
                                message: "Failed to add user!",
                                timeout: 2000,
                                background: "variant-filled-error"
                            })
                        }
                    } else {
                        toastStore.trigger({
                            message: "User already exists!",
                            timeout: 2000,
                            background: "variant-filled-error"
                        })
                    }
                }
            }
        }

        modalStore.trigger(emailModal);
    }

    async function removeUser(email: string) {
        if (!$athenaClass) return;
        const oldClassUsers = [...$athenaClass.users];
        if (!isAdmin) return;
        const confirmModal: ModalSettings = {
            type: "confirm",
            title: "Remove User",
            body: `Are you sure you want to remove ${email} from the class?`,
            response: async (r: boolean) => {
                if (!r) return;
                if (!$athenaClass) return;
                $athenaClass.users = $athenaClass.users.filter(e => e !== email);
                if (await updateClass($athenaClass)) {
                    toastStore.trigger({
                        message: "User removed!",
                        timeout: 2000,
                        background: "variant-filled-success"
                    })
                    await updateTaskUsersFromClass(oldClassUsers);
                } else {
                    toastStore.trigger({
                        message: "Failed to remove user!",
                        timeout: 2000,
                        background: "variant-filled-error"
                    })
                }
            }
        }

        modalStore.trigger(confirmModal);
    }

    async function deleteAthenaClass() {
        if (!isAdmin) return;
        const confirmModal: ModalSettings = {
            type: "prompt",
            title: "Delete Class",
            body: `Are you sure you want to delete ${$athenaClass?.name}? This action is irreversible! Please type the name of the class to confirm.`,
            valueAttr: {type: "text", minlength: 1, required: true},
            response: async (r: string) => {
                if (!r) return;
                if (!$athenaClass) return;
                if (r === $athenaClass?.name) {
                    if (await deleteClass($athenaClass)) {
                        toastStore.trigger({
                            message: "Class deleted!",
                            timeout: 2000,
                            background: "variant-filled-success"
                        })
                        await goto("/classes");
                    } else {
                        toastStore.trigger({
                            message: "Failed to delete class!",
                            timeout: 2000,
                            background: "variant-filled-error"
                        })
                    }
                } else {
                    toastStore.trigger({
                        message: "Class name does not match!",
                        timeout: 2000,
                        background: "variant-filled-error"
                    })
                }
            }
        }

        modalStore.trigger(confirmModal);
    }

    async function updateTaskUsersFromClass(oldClassUsers: string[]) {
        if (!$athenaClass) return;
        if (!$athenaClass.subjects[currentTile - tilesBefore]) return;
        if (!$athenaClass.subjects[currentTile - tilesBefore].task_uuids) return;
        for (const subject of $athenaClass.subjects) {
            for (const task_uuid of subject.task_uuids) {
                const task = await getTaskData(task_uuid);
                if (!task) continue;
                if (task.users === oldClassUsers) {
                    await updateTaskUsers(task_uuid, $athenaClass.users, "set");
                }
            }
        }
    }
</script>

{#if !loading}
    {#if $athenaClass}
        <div class="h-full grid grid-rows-[auto_1fr]">
            <div class="sticky top-0 w-full h-52 -z-10">
                <div class="-z-10 h-full w-full bg-cover bg-center absolute"
                     style="background-image: {`url(${$athenaClass.banner || 'k-soma-plXL7vYXfyA-unsplash.jpg'})`}"></div>
                <div class="h-full w-full max-w-2xl grid items-center">
                    <div class="text-6xl m-5 p-5">
                        <p>{$athenaClass.name}</p>
                    </div>
                </div>
            </div>

            {#if isAdmin && isEditing}
                <div class="absolute w-full h-52">
                    <button class="absolute right-0 bottom-0 btn m-3 variant-glass-primary rounded"
                            on:click={changeBanner}>Change Banner
                    </button>
                </div>
            {/if}

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

                        {#if isAdmin}
                            <AppRailTile bind:group={currentTile} name="tile-{1}" value={1} title="tile-{1}">
                                <div class="m-3 h6 flex justify-between">
                                    <p>Settings</p>
                                    {#if currentTile === 1}
                                        <p>-></p>
                                    {/if}
                                </div>
                            </AppRailTile>
                        {/if}

                        <hr class="my-3">

                        {#each $athenaClass.subjects as subject, i}
                            <AppRailTile bind:group={currentTile} name="tile-{i+tilesBefore}" value={i+tilesBefore}
                                         title="tile-{i+tilesBefore}">
                                <div class="m-3 h6 flex justify-between">
                                    <p>{subject.name}</p>
                                    {#if currentTile === i + tilesBefore}
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
                    <div class="w-full h-full p-10 overflow-y-auto relative">
                        {#if isAdmin}
                            <div class="absolute top-0 right-0 m-2 mr-3">
                                <SlideToggle active="bg-primary-500" size="sm" bind:checked={isEditing}>Edit
                                </SlideToggle>
                            </div>
                        {/if}
                        {#if currentTile === 0}
                            <div class="h-full grid grid-rows-[auto_auto_1fr]">
                                {#if isAdmin && isEditing}
                                    <input type="text" class="input rounded h1 variant-form-material"
                                           bind:value={$athenaClass.name}
                                           on:blur={async () => {
                                               if (originalAthenaClass === JSON.stringify($athenaClass)) return;
                                               await updateClass($athenaClass);
                                               toastStore.trigger({
                                                message: "Changes saved!",
                                                timeout: 2000,
                                                background: "variant-filled-success"
                                              })
                                           }}
                                    >
                                {:else}
                                    <p class="h1">About {$athenaClass.name}</p>
                                {/if}
                                <hr class="my-5">
                                {#if isAdmin && isEditing}
                                <textarea class="w-full h-full p-5 rounded textarea"
                                          bind:value={$athenaClass.description}
                                          on:blur={async () => {
                                              if (originalAthenaClass === JSON.stringify($athenaClass)) return;
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
                        {:else if currentTile === 1}
                            <div class="h-full grid grid-rows-[auto_auto_1fr]">
                                <p class="h1">Settings</p>
                                <hr class="my-5">
                                <div>
                                    <p class="h2">Users:</p>
                                    <div class="w-full h-full py-5">
                                        <div class="card w-full h-full grid grid-rows-[1fr_auto] p-5">
                                            <div class="h-full max-h-full overflow-y-auto">
                                                <div>
                                                    <div class="grid grid-cols-2">
                                                        <p class="">Email:</p>
                                                        <p class="">Role:</p>
                                                    </div>
                                                    <hr class="my-2">
                                                </div>
                                                {#each $athenaClass.users as user}
                                                    <div>
                                                        <div class="grid grid-cols-2">
                                                            <p class="">{user}</p>
                                                            <div class="flex justify-between">
                                                                {#if $athenaClass.admins.includes(user)}
                                                                    <p class="">Admin</p>
                                                                    <button class="chip variant-glass hover:variant-glass-error"
                                                                            on:click={() => {makeUser(user)}}>Make User
                                                                    </button>
                                                                {:else}
                                                                    <p class="">User</p>
                                                                    <div>
                                                                        <button class="chip variant-glass hover:variant-glass-success"
                                                                                on:click={() => {makeAdmin(user)}}>Make
                                                                            Admin
                                                                        </button>
                                                                        <button class="chip variant-glass hover:variant-glass-error"
                                                                                on:click={() => {removeUser(user)}}>
                                                                            Remove User
                                                                        </button>
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                        </div>
                                                        <hr class="my-2">
                                                    </div>
                                                {/each}
                                            </div>
                                            <div class="flex justify-around">
                                                <button class="btn variant-filled-primary rounded" on:click={addUser}>
                                                    Add User
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <hr class="mb-5">
                                    <div class="w-full flex justify-around pb-10">
                                        <button class="btn variant-glass-error hover:variant-filled-error rounded"
                                                on:click={deleteAthenaClass}>Delete Class
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {:else if $athenaClass.subjects && $athenaClass.subjects.length + tilesBefore > currentTile}
                            <div class="h-full">
                                {#if isAdmin && isEditing}
                                    <input type="text" class="input rounded h1 variant-form-material"
                                           bind:value={$athenaClass.subjects[currentTile - tilesBefore].name}
                                           on:blur={async () => {
                                               if (originalAthenaClass === JSON.stringify($athenaClass)) return;
                                               await updateClass($athenaClass);
                                               toastStore.trigger({
                                                message: "Changes saved!",
                                                timeout: 2000,
                                                background: "variant-filled-success"
                                              })
                                           }}
                                    >
                                {:else}
                                    <p class="h1">{$athenaClass.subjects[currentTile - tilesBefore].name}</p>
                                {/if}
                                <hr class="my-5">
                                {#if isAdmin && isEditing}
                                <textarea class="w-full h-40 p-5 rounded textarea"
                                          bind:value={$athenaClass.subjects[currentTile - tilesBefore].description}
                                          on:blur={async () => {
                                              if (originalAthenaClass === JSON.stringify($athenaClass)) return;
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
                                    <p>{$athenaClass.subjects[currentTile - tilesBefore].description}</p>
                                {/if}

                                <div class="card w-full h-fit mt-5 p-5">
                                    {#if $athenaClass.subjects[currentTile - tilesBefore].task_uuids.length > 0}
                                        {#each $athenaClass.subjects[currentTile - tilesBefore].task_uuids as task_uuid}
                                            <TaskPreview athenaClass={athenaClass} taskUuid={task_uuid}
                                                         isAdmin={isAdmin} isEditing={isEditing}
                                                         subject={encodeURIComponent($athenaClass.subjects[currentTile - tilesBefore].name)}/>
                                        {/each}
                                    {:else}
                                        <p class="text-center">no tasks to display</p>
                                    {/if}
                                    {#if isAdmin}
                                        <hr class="mt-5">
                                        <div class="w-full flex justify-around mt-5">
                                            <button class="btn variant-filled-primary" on:click={addTask}>New Task
                                            </button>
                                        </div>
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
{:else}
    <div class="w-full h-full grid items-center">
        <div>
            <ProgressRadial class="m-auto" size="large" color="primary"/>
            <p class="text-center mt-5">{loadingText}</p>
        </div>
    </div>
{/if}
