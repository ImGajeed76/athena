<script lang="ts">
    import type {Writable} from "svelte/store";
    import {createUser} from "$lib/database";
    import {validateEmail} from "$lib/utils";

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
    let confirmPassword = "";

    async function isEmailValid() {
        const isValid = validateEmail(email);
        if (!isValid) {
            info.color = "text-error-500";
            info.text = "Email is invalid";
        }
        return isValid;
    }

    async function isPasswordValid() {
        if (password !== confirmPassword) {
            info.color = "text-error-500";
            info.text = "Passwords do not match";
            return false;
        }

        if (password.length < 8) {
            info.color = "text-error-500";
            info.text = "Password must be at least 8 characters long";
            return false;
        }

        return true;
    }

    async function signUp() {
        info.text = "";

        if (!await isEmailValid()) return;
        if (!await isPasswordValid()) return;

        const {error} = await createUser(email, password);

        if (error) {
            info.color = "text-error-500";
            info.text = error.message;
        } else {
            info.color = "text-success-500";
            info.text = "Account created successfully";

            setTimeout(() => {
                info.text = "";
                selected.set(1);
            }, 1000);
        }
    }
</script>

<div class="mb-12 mt-4">
    <h1 class="text-4xl font-bold">Get started!</h1>
    <p>Create a new account</p>
</div>

<form>
    <div class="label mb-6">
        <input class="input rounded-md hover:shadow-2xl duration-200" type="email" placeholder="Email"
               bind:value={email}/>
    </div>

    <div class="label mb-6">
        <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="Password"
               bind:value={password}/>
    </div>

    <div class="label mb-8">
        <input class="input rounded-md hover:shadow-2xl duration-200" type="password" placeholder="Confirm Password"
               bind:value={confirmPassword}/>
    </div>

    <div class="mb-14">
        <button type="submit" class="btn variant-filled-primary w-full rounded-md hover:shadow-2xl duration-200"
                on:click={signUp}>
            Sign Up
        </button>

        <p class="{info.color} text-center">
            {info.text}
        </p>
    </div>

    <p class="text-center text-md">
        Already have an account?
        <button class="text-secondary-500" on:click={() => selected.set(1)}>Login</button>
    </p>
</form>