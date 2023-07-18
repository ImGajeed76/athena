<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    export let content = writable({});
    export let reload = writable(false);
    let container: HTMLDivElement;

    onMount(() => {
        import("quill").then(({default: Quill}) => {
            let editor = new Quill(container, {
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'formula'],
                    ]
                },
                placeholder: 'Write some text...',
                theme: 'snow'
            });

            if (!editor) return;

            editor.on("text-change", () => {
                if (!container) return;

                const element = container.getElementsByClassName("katex-html")[0];
                if (element) element.remove();

                content.set(editor.getContents());
            });

            editor.setContents($content);

            reload.subscribe((value) => {
                if (value) {
                    editor.setContents($content);
                    reload.set(false);
                }
            })
        })
    })
</script>

<div class="w-full h-full bg-surface-100 prose">
    <div class="w-full h-full bg-surface-200" bind:this={container}></div>
</div>
