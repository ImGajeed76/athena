<script lang="ts">
    import {onMount} from "svelte";
    import Matter from "matter-js";
    import type {AthenaTaskSimulation} from "$lib/athenaTask";
    import {writable} from "svelte/store";

    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    export let athenaSimulation: AthenaTaskSimulation = {
        variables: [],
        engine: null,
        renderer: null
    }
    let canvas: HTMLDivElement;

    let engine;
    let render;
    let runner;

    let simulating = writable(false);

    let allBodies;


    onMount(() => {
        if (!canvas) return;
        engine = athenaSimulation.engine || Engine.create();
        render = athenaSimulation.renderer || Render.create({
            element: canvas,
            engine: engine,
            options: {
                wireframes: false,
                width: canvas.clientWidth,
                height: canvas.clientHeight,
            }
        });
        runner = Runner.create();

        const boxA = Bodies.rectangle(canvas.clientWidth / 2, 200, 80, 80);
        const boxB = Bodies.rectangle(canvas.clientWidth / 2 + 50, 50, 80, 80);
        const ground = Bodies.rectangle(canvas.clientWidth / 2, canvas.clientHeight, canvas.clientWidth, 60, { isStatic: true });

        Composite.add(engine.world, [boxA, boxB, ground]);
        Render.run(render);

        allBodies = Composite.allBodies(engine.world);
    })

    simulating.subscribe(value => {
        if (!engine || !render || !runner) return;
        if (value) {
            Runner.run(runner, engine);
        } else {
            Runner.stop(runner);
        }
    })

    function reset() {
        if (!engine || !render || !runner) return;
        Runner.stop(runner);

        Composite.clear(engine.world, false);
        Composite.add(engine.world, allBodies);
    }
</script>

<div class="w-full h-full grid grid-rows-[auto_1fr_auto]">
    <div class="w-full flex mb-2">
        {#if $simulating}
            <button class="bg-red-500 text-white px-3 py-1 rounded" on:click={() => $simulating = false}>Stop ■</button>
        {:else}
            <button class="bg-green-500 text-white px-3 py-1 rounded" on:click={() => $simulating = true}>Start ▶</button>
        {/if}
        <button class="bg-blue-500 text-white px-3 py-1 rounded ml-2" on:click={reset}>Reset ↺</button>
    </div>

    <div class="w-full h-full rounded overflow-hidden">
        <div class="w-full h-full" bind:this={canvas}></div>
    </div>

    <div class="mt-5">
        Doesnt work yet
    </div>
</div>