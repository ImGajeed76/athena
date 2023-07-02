<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    export let content = writable("");
    let container: HTMLDivElement;
    let editor;

    onMount(() => {
        import("quill").then(({default: Quill}) => {
            editor = new Quill(container, {
                modules: {},
                placeholder: 'Nothing to see here... ¯\\_(ツ)_/¯',
                theme: 'bubble'
            });

            editor.on("text-change", () => {
                if (!container) return;
                const element = container.getElementsByClassName("katex-html")[0];
                if (element) element.remove();
            });

            editor.setContents($content);
            editor.enable(false);
        });
    });

    content.subscribe(value => {
        if (editor) {
            editor.setContents(value);
        }
    });
</script>

<div class="w-full h-full bg-white text-black prose">
    <div class="w-full h-full bg-white" bind:this={container}></div>
</div>
