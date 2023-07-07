<script lang="ts">
    import {onMount} from "svelte";
    import {createClass, getClasses} from "$lib/database";

    onMount(async () => {
        setTimeout( async () => {
            console.log(await getClasses())
        }, 1000)
    })
</script>

<button class="btn variant-filled-primary" on:click={() => {createClass("Test", "Some test class")}}>Create Class</button>