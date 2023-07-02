<script>
    import {supabase} from "$lib/database.ts";
    import LaTeX_Editor from "../modules/LaTeX_Editor.svelte";
    import {writable} from "svelte/store";
    import LaTeX_Viewer from "../modules/LaTeX_Viewer.svelte";

    async function logout() {
        const {error} = await supabase.auth.signOut();
        if (error) console.log('Error logging out:', error.message);
    }

    let content = writable("");
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full w-full mx-auto flex justify-center items-center">
    <div class="space-y-5 w-full">
        <h1 class="h1">
            Just for testing
        </h1>

        <a class="btn variant-filled-primary" href="/login">
            LogIn
        </a>

        <button class="btn variant-filled-primary" on:click={logout}>
            LogOut
        </button>

        <div class="h-96 pb-20">
            <LaTeX_Editor content={content}/>
        </div>

        <div class="h-96 pb-20">
            <LaTeX_Viewer content={content}/>
        </div>
    </div>
</div>

