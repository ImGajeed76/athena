<script lang="ts">
    export let title: string;
    export let description: string;
    export let image: string;
    export let uuid: string;
</script>

<a class="card card-hover overflow-hidden m-3" href="/classes/{uuid}">
    <header>
        <div class="w-full h-32 bg-cover" style="background-image: {`url(${image})`}"></div>
    </header>
    <div class="p-4 space-y-4">
        <h3 class="h3" data-toc-ignore>{title}</h3>
        <article>
            <p>
                {description}
            </p>
        </article>
    </div>
</a>