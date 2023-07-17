<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import {currentSession} from "$lib/database";
    import {LightSwitch, modeCurrent, modeOsPrefers, modeUserPrefers} from "@skeletonlabs/skeleton";
    import {onMount} from "svelte";

    $: console.log($currentSession);

    const theme: "light" | "dark" = "dark";

    onMount(() => {
        $modeOsPrefers = theme === "light";
        $modeUserPrefers = theme === "light";
        $modeCurrent = theme === "light";
    })
</script>

<div class="absolute">
    <LightSwitch/>
</div>
<slot/>
