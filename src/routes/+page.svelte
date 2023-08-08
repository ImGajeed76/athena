<script lang="ts">
    import {onMount} from "svelte";
    import {currentSession} from "$lib/database";
    import {writable} from "svelte/store";

    const getStartedURL = writable("/login")

    onMount(() => {
        if ($currentSession) {
            getStartedURL.set("/classes")
        }

        const blob = document.getElementById("blob")
        if (!blob) return

        document.body.onpointermove = (e) => {
            const {clientX, clientY} = e

            blob.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, {
                duration: 500,
                fill: "forwards"
            })
        }
    })
</script>

<style>
    .btn-glow {
        box-shadow: 0 0 30px 0 rgba(67, 155, 255, 0.89);
    }

    @keyframes rotate {
        from {
            rotate: 0deg;
        }

        50% {
            scale: 1 1.5;
        }

        to {
            rotate: 360deg;
        }
    }

    #blob {
        z-index: 1;
        height: 500px;
        aspect-ratio: 1;
        position: absolute;
        left: 50%;
        top: 50%;
        translate: -50% -50%;
        border-radius: 50%;
        background: linear-gradient(
                to right,
                aquamarine,
                mediumpurple
        );
        animation: rotate 20s infinite;
        opacity: 40%;
    }

    #blur {
        height: 100%;
        width: 100%;
        position: absolute;
        z-index: 2;
        backdrop-filter: blur(200px);
    }
</style>

<div class="h-full bg-[#020405]">
    <div class="absolute w-full h-[93%] overflow-hidden">
        <div id="blob"></div>
        <div id="blur"></div>
    </div>

    <div class="w-full grid items-center h-full">
        <div class="m-auto w-full z-10">
            <h1 class="text-7xl font-bold text-center">
                Create. Solve. Improve.
            </h1>

            <p class="mt-8 text-xl max-w-2xl text-center mx-auto text-[#838383]">
                Athena is a platform for teachers and students to create and solve tasks, so that they can improve their
                skills.
            </p>

            <div class="w-full grid justify-center">
                <div class="flex space-x-4 mt-8">
                    <a href={$getStartedURL} class="btn bg-primary-500 text-white rounded-lg font-bold w-44 btn-glow">
                        Get Started
                    </a>

                    <a href="/editor"
                       class="btn bg-[#020405] border-2 text-white rounded-lg font-bold w-44 hover:bg-white hover:text-black duration-200">
                        Editor
                    </a>
                </div>
            </div>
        </div>
    </div>

</div>

