<script>
    import {supabase} from "$lib/database.ts";

    async function logout() {
        const {error} = await supabase.auth.signOut();
        if (error) console.log('Error logging out:', error.message);
    }
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full mx-auto flex justify-center items-center">
    <div class="space-y-5">
        <h1 class="h1">Let's get cracking bones!</h1>
        <p>Start by exploring:</p>
        <ul>
            <li><code class="code">/src/routes/+layout.svelte</code> - barebones layout, the CSS import order is
                critical!
            </li>
            <li><code class="code">/src/app.postcss</code> - minimal css to make the page full screen, may not be
                relevant for your project
            </li>
            <li><code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents</li>
        </ul>

        <a class="btn variant-filled-primary" href="/login">
            LogIn
        </a>

        <button class="btn variant-filled-primary" on:click={logout}>
            LogOut
        </button>
    </div>
</div>

