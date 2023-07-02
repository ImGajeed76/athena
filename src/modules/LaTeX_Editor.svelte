<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    export let content = writable("");
    let container: HTMLDivElement;
    let editor;

    onMount(() => {
        import("quill").then(({default: Quill}) => {
            editor = new Quill(container, {
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'formula'],
                    ]
                },
                placeholder: 'Write some text...',
                theme: 'snow'
            });

            editor.on("text-change", () => {
                if (!container) return;

                const element = container.getElementsByClassName("katex-html")[0];
                if (element) element.remove();

                content.set(editor.getContents());
            });
        })
    })
</script>

<div class="w-full h-full bg-white text-black prose">
    <div class="w-full h-full bg-white" bind:this={container}></div>
</div>
