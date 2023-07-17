<script lang="ts">
    import {ProgressRadial} from "@skeletonlabs/skeleton";

    export let src: string;
    export let alt: string;
    let type: "video" | "embed";
    let loading = true;
    let oldSrc = "";

    $: updateVideo(src);

    async function updateVideo(videoSrc) {
        if (oldSrc === videoSrc) return;
        oldSrc = videoSrc;
        loading = true;

        if (!videoSrc || videoSrc.trim() === "") return;
        else if (
            videoSrc.endsWith(".mp4") ||
            videoSrc.endsWith(".ogg") ||
            videoSrc.endsWith(".webm") ||
            videoSrc.endsWith(".mkv")
        ) {
            type = "video";
        } else if (
            videoSrc.includes("youtube.com") ||
            videoSrc.includes("youtu.be")
        ) {
            let videoId = videoSrc.split("v=")[1];
            if (!videoId) videoId = videoSrc.split("youtu.be/")[1];
            if (!videoId) videoId = videoSrc.split("embed/")[1];
            if (!videoId) throw new Error("Invalid youtube url");
            if (videoId.includes("&")) videoId = videoId.split("&")[0];
            src = `https://www.youtube.com/embed/${videoId}`;
            oldSrc = src;
            type = "embed";
        } else {
            src = await getVideo()
            oldSrc = src;
            type = "video";
        }

        loading = false;
    }

    async function getVideo() {
        let blob = await fetch(src).then(r => r.blob());
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
            {#if type !== 'embed'}
                <video class="w-full h-full" controls>
                    <source src={src}>
                    Your browser does not support the video tag.
                </video>
            {:else}
                <iframe class="w-full h-full" src={src}>
                </iframe>
            {/if}
        {:else}
            <div class="flex justify-center items-center h-full w-full">
                <p>{alt}</p>
            </div>
        {/if}
    {/if}
</div>
