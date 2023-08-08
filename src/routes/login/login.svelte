<script lang="ts">
    import type {Writable} from "svelte/store";
    import {supabase} from "$lib/database";
    import {goto} from "$app/navigation";
    import {ProgressBar} from "@skeletonlabs/skeleton";

    export let selected: Writable<number>;
    let info: {
        color: string,
        text: string,
    } = {
        color: "text-white",
        text: "",
    };

    let email = "";
    let password = "";

    let loading = false;

    async function login() {
        loading = true;

        info.text = "";

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            info = {
                color: "text-error-500",
                text: error.message,
            };
        } else {
            info = {
                color: "text-success-500",
                text: "Logged in successfully!",
            };

            setTimeout(() => {
                info.text = "";
                goto("/")
            }, 1000);
        }

        loading = false;
    }
</script>

<div class="mb-12 mt-4">
    <h1 class="text-4xl font-bold">Welcome back!</h1>
    <p>Sign in to your account</p>
</div>

<form>
    <div class="label mb-6">
        <input class="input rounded-md hover:shadow-2xl duration-200" type="email" placeholder="Email"
               bind:value={email}/>
    </div>

    <div class="label mb-6">
        <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="Password"
               bind:value={password}/>
        <p class="text-sm ml-1">
            Forgot your password? <a href="/login/password-reset" class="underline">Reset it here</a>
        </p>
    </div>

    <div class="mb-14">
        <button type="submit" class="btn variant-filled-primary w-full rounded-md hover:shadow-2xl duration-200"
                on:click={login}>
            Login
        </button>
        {#if loading}
            <ProgressBar value={undefined} class="mt-1" meter="bg-primary-500"/>
        {/if}

        <p class="{info.color} text-center">
            {info.text}
        </p>
    </div>

    <p class="text-center text-md">
        Don't have an account?
        <button class="text-secondary-500" on:click={() => selected.set(0)}>Sign Up Now</button>
    </p>
</form>