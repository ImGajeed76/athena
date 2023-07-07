<script lang='ts'>
    import '../theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import '../app.postcss';
    import {currentSession} from "$lib/database";
    import {LightSwitch} from "@skeletonlabs/skeleton";

    $: console.log($currentSession);
</script>

<div class="absolute">
    <LightSwitch/>
</div>
<slot/>
