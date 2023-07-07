<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    export let content = writable({});
    let container: HTMLDivElement;

    onMount(() => {
        import("quill").then(({default: Quill}) => {
            let editor = new Quill(container, {
                modules: {},
                placeholder: 'Nothing to see here... ¯\\_(ツ)_/¯',
                theme: 'bubble'
            });

            if (!editor) return;

            editor.on("text-change", () => {
                if (!container) return;
                const element = container.getElementsByClassName("katex-html")[0];
                if (element) element.remove();
            });

            editor.setContents($content);
            editor.enable(false);

            content.subscribe(value => {
                if (editor) editor.setContents(value);
            });
        });
    });


</script>

<div class="w-full h-full bg-transparent prose">
    <div class="w-full h-full bg-surface-200 rounded" bind:this={container}></div>
</div>
