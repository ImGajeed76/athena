<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import {currentSession, signOut, supabase} from "$lib/database";
    import {AppBar, modeCurrent, modeOsPrefers, modeUserPrefers} from "@skeletonlabs/skeleton";
    import {onMount} from "svelte";
    import {env} from "$env/dynamic/public";

    const theme: "light" | "dark" = "dark";

    onMount(async () => {
        $modeOsPrefers = theme === "light";
        $modeUserPrefers = theme === "light";
        $modeCurrent = theme === "light";
        await updateDevSession();
    })

    async function updateDevSession() {
        if(window.location.origin === "http://localhost:5173") {
            localStorage.clear();
            sessionStorage.clear();
            setTimeout(async () => {
                console.log(await supabase.auth.signInWithPassword({
                    email: env.PUBLIC_DEV_EMAIL,
                    password: env.PUBLIC_DEV_PASSWORD
                }));
            }, 500);
        }
    }

    async function logout() {
        await signOut();
        console.log($currentSession);
    }

</script>

<div class="w-full h-full grid grid-rows-[auto_1fr]">
    <div class="shadow z-20 w-full" style="position: sticky; top: 0;">
        <AppBar slotTrail="place-content-end">
            <a href="/" class="h5">Athena</a>
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
