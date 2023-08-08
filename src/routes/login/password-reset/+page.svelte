<script lang="ts">
    import {currentSession, supabase} from "$lib/database";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {ProgressBar} from "@skeletonlabs/skeleton";

    let email = "";
    let info = {
        color: "text-success-500",
        text: ""
    }

    let loading = false;

    async function isEmailValid() {
        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            info.color = "text-error-500";
            info.text = "Email is invalid";
        }
        return regex.test(email);
    }

    async function sendResetLink() {
        if (!await isEmailValid()) return;
        loading = true;

        const {error} = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/login/update-password"
        });

        if (error) {
            info.color = "text-error-500";
            info.text = error.message;
        } else {
            info.color = "text-success-500";
            info.text = "Reset link send successfully";
        }
        loading = false;
    }

    onMount(() => {
        if ($currentSession) goto("/");
    })
</script>

<div class="h-full grid items-center">
    <div>
        <div class="card max-w-2xl w-full p-3 px-8 m-auto">
            <div class="mb-10 mt-4">
                <h1 class="text-4xl font-bold">Forgot your password?</h1>
                <p>No problem, we got you!</p>
            </div>

            <form>
                <div class="label mb-3 flex">
                    <input class="input rounded-md hover:shadow-2xl duration-200 mt-1 h-12" type="email" placeholder="Email"
                           bind:value={email}/>
                    <button class="btn variant-filled-primary rounded-md ml-3 h-12" type="submit" on:click={sendResetLink}>
                        Send reset link
                    </button>
                </div>
                {#if loading}
                    <ProgressBar value={undefined} class="mb-3" meter="bg-primary-500"/>
                {/if}

                <p class="{info.color} text-center mb-4">
                    {info.text}
                </p>
            </form>
        </div>
    </div>
</div>