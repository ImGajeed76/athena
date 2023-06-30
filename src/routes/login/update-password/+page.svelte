<script lang="ts">
    import {onMount} from "svelte";
    import {currentSession, supabase} from "$lib/database";
    import {goto} from "$app/navigation";

    let info = {
        color: "",
        text: ""
    }

    let oldPassword = "";
    let newPassword = "";
    let confirmPassword = "";

    async function isUserValid() {
        if (!$currentSession) return false;
        if (!$currentSession.user.email) return false;

        const {error} = await supabase.auth.signInWithPassword({
            password: oldPassword,
            email: $currentSession.user.email
        })

        if (error) {
            info = {
                color: "text-error-500",
                text: "Authentication failed"
            }
            return false;
        }

        return true;
    }

    async function isPasswordValid() {
        if (newPassword !== confirmPassword) {
            info.color = "text-error-500";
            info.text = "Passwords do not match";
            return false;
        }

        if (newPassword.length < 8) {
            info.color = "text-error-500";
            info.text = "Password must be at least 8 characters long";
            return false;
        }

        return true;
    }

    async function updatePassword() {
        if (!await isUserValid()) return;
        if (!await isPasswordValid()) return;

        const {error} = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            info.color = "text-error-500";
            info.text = error.message;
        } else {
            info.color = "text-success-500";
            info.text = "Password updated successfully";

            setTimeout(() => {
                info.text = "";
                goto("/")
            }, 1000);
        }
    }

    onMount(() => {
        if (!$currentSession) goto("/");
    })
</script>

<div class="h-screen grid items-center">
    <div>
        <div class="card max-w-2xl w-full p-3 px-8 m-auto">
            <div class="mb-10 mt-4">
                <h1 class="text-4xl font-bold">Update your password</h1>
            </div>

            <form>
                <div class="label mb-6">
                    <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="Old Password"
                           bind:value={oldPassword}/>
                </div>

                <div class="label mb-6">
                    <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="New Password"
                           bind:value={newPassword}/>
                </div>

                <div class="label mb-8">
                    <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="Confirm Password"
                           bind:value={confirmPassword}/>
                </div>

                <div class="mb-6">
                    <button type="submit" class="btn variant-filled-primary w-full rounded-md hover:shadow-2xl duration-200"
                            on:click={updatePassword}>
                        Update
                    </button>

                    <p class="{info.color} text-center mt-2">
                        {info.text}
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>