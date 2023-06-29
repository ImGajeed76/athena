<script lang="ts">
    import {writable} from "svelte/store";
    import Login from "./login.svelte";
    import SignUp from "./signup.svelte";

    let slider;
    let selected = writable(1);
    selected.subscribe((value) => {
        if (!slider) return;
        if (value === 0) slider.style.transform = `translateX(0%)`;
        else if (value === 1) slider.style.transform = `translateX(100%)`;

        // do the same with slide animation

    });
</script>

<div class="absolute w-[50%] h-full bg-surface-800 shadow-xl z-10"
     style="transition: transform 0.3s ease-in-out; transform: translateX(100%);"
     bind:this={slider}></div>

<div class="h-full grid grid-cols-2 items-center">
    <div>
        <div class="card p-4 w-96 text-token space-y-4 m-auto">
            <Login selected={selected}/>
        </div>
    </div>

    <div>
        <div class="card p-4 w-96 text-token space-y-4 m-auto">
            <SignUp selected={selected}/>
        </div>
    </div>
</div>