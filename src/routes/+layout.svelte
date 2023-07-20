<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import {currentSession, onAuthStateChange, signOut, supabase} from "$lib/database";
    import {AppBar, Modal, modeCurrent, modeOsPrefers, modeUserPrefers, Toast} from "@skeletonlabs/skeleton";
    import {onMount} from "svelte";
    import {env} from "$env/dynamic/public";

    const theme: "light" | "dark" = "dark";

    onMount(async () => {
        await updateDevSession();
        $modeOsPrefers = theme === "light";
        $modeUserPrefers = theme === "light";
        $modeCurrent = theme === "light";
    })

    async function updateDevSession() {
        if (window.location.origin === "http://localhost:5173") {
            setTimeout(async () => {
                localStorage.clear();
                sessionStorage.clear();
                setTimeout(async () => {
                    console.log(await supabase.auth.signInWithPassword({
                        email: env.PUBLIC_DEV_EMAIL,
                        password: env.PUBLIC_DEV_PASSWORD
                    }));
                }, 200);
            }, 200);
        }
    }

    async function logout() {
        await signOut();
        console.log($currentSession);
    }
</script>

<Modal/>
<Toast/>

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
                    <button on:click={logout}>Logout</button>
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
