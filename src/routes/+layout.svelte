<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import {arrow, autoUpdate, computePosition, flip, offset, shift} from '@floating-ui/dom';
    import {
        AppBar,
        Modal,
        modeCurrent,
        modeOsPrefers,
        modeUserPrefers,
        storePopup,
        Toast
    } from '@skeletonlabs/skeleton';
    import {currentSession, signOut} from "$lib/database";
    import {onMount} from "svelte";

    storePopup.set({computePosition, autoUpdate, offset, shift, flip, arrow});

    const theme: "light" | "dark" = "dark";

    onMount(async () => {
        $modeOsPrefers = theme === "light";
        $modeUserPrefers = theme === "light";
        $modeCurrent = theme === "light";
    });
</script>

<Toast/>
<Modal/>

<div class="w-full h-full grid grid-rows-[auto_1fr]">
    <div class="shadow z-20 w-full" style="position: sticky; top: 0;">
        <AppBar slotTrail="place-content-end">
            <div class="flex h-full">
                <a href="/" class="h3">Athena</a>
                <div class="ml-10 h-full m-auto pt-1">
                    <a href="/classes" class="hover:underline mx-2">Classes</a>
                    <a href="/editor" class="hover:underline mx-2">Editor</a>
                </div>
            </div>
            <svelte:fragment slot="trail">
                {#if $currentSession}
                    <button on:click={signOut}>Logout</button>
                {:else}
                    <a href="/login">Login</a>
                {/if}
            </svelte:fragment>
        </AppBar>
    </div>
    <div class="h-full">
        <slot/>
    </div>
</div>
