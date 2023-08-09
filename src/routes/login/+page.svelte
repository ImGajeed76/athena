<script lang="ts">
    import {writable} from "svelte/store";
    import Login from "./login.svelte";
    import SignUp from "./signup.svelte";
    import {onMount} from "svelte";
    import {currentSession} from "$lib/database";
    import {goto} from "$app/navigation";

    let slider: HTMLElement;
    let image: HTMLImageElement;
    let memes = [
        "https://i.giphy.com/media/3ornk57KwDXf81rjWM/giphy.webp",
        "https://i.giphy.com/media/Lli7gFJYYUcrYw2wHA/giphy.webp"
    ]

    let selected = writable(1);
    selected.subscribe((value) => {
        if (!slider) return;
        if (value === 0) slider.style.transform = `translateX(0%)`;
        else if (value === 1) slider.style.transform = `translateX(100%)`;
    });

    selected.subscribe((value) => {
        if (!image) return;
        image.src = memes[value];
    });


    onMount(() => {
        if ($currentSession) goto("/");
    })
</script>

<div class="fixed w-[50%] h-full bg-surface-800 shadow-2xl z-20"
     style="transition: transform 0.3s ease-in-out; transform: translateX(100%);"
     bind:this={slider}>
    <div class="h-full grid items-center">
        <div class="m-auto">
            <img class="rounded-md border-2 border-surface-900 duration-200" src="https://i.giphy.com/media/Lli7gFJYYUcrYw2wHA/giphy.webp"
                 alt=""
                 bind:this={image}
            >
        </div>
    </div>
</div>


<div class="h-full w-full">
    <div class="h-full grid grid-cols-2 items-center z-10">
        <div>
            <div class="card p-4 w-96 text-token space-y-4 m-auto shadow-2xl">
                <Login selected={selected}/>
            </div>
        </div>

        <div>
            <div class="card p-4 w-96 text-token space-y-4 m-auto shadow-2xl">
                <SignUp selected={selected}/>
            </div>
        </div>
    </div>
</div>
