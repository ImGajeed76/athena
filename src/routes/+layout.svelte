<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    import {currentSession, signOut} from "$lib/database";
    import {AppBar, Modal, modeCurrent, modeOsPrefers, modeUserPrefers, Toast} from "@skeletonlabs/skeleton";
    import {onMount} from "svelte";

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
                    <a href="/classes" class="hover:underline m-auto">Classes</a>
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
