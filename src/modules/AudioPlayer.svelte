<script lang="ts">
    import {ProgressRadial} from "@skeletonlabs/skeleton";

    export let src: string;
    export let alt: string;
    let loading = true;
    let oldSrc = "";

    $: updateAudio(src);

    async function updateAudio(audioSrc) {
        if (oldSrc === audioSrc) return;
        oldSrc = audioSrc
        loading = true;

        if (!audioSrc || audioSrc.trim() === "") return;
        else if (
            !audioSrc.endsWith(".mp3") &&
            !audioSrc.endsWith(".ogg") &&
            !audioSrc.endsWith(".wav")
        ) {
            src = await loadAudio();
            oldSrc = src;
        }

        loading = false;
    }

    async function loadAudio() {
        let blob = await fetch(src).then((r) => r.blob());
        return URL.createObjectURL(blob);
    }
</script>

<div class="h-full w-full">
    {#if loading}
        <div class="flex justify-center items-center h-full w-full">
            <ProgressRadial value={undefined}/>
        </div>
    {:else}
        {#if src}
            <audio controls class="w-[95%] m-auto">
                <source src={src}>
            </audio>
        {:else}
            <div class="flex justify-center items-center h-full w-full">
                <p>{alt}</p>
            </div>
        {/if}
    {/if}
</div>