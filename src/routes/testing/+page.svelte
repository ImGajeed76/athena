<script lang="ts">
    import type {AthenaTaskSimulation} from "$lib/athenaTask";
    import Simulation_Viewer from "../../modules/Simulation_Viewer.svelte";

    let simulation: AthenaTaskSimulation = {
        variables: [],
        engine: null,
        renderer: null,
    };
</script>

<div class="w-full h-full p-10">
    <Simulation_Viewer athenaSimulation={simulation}/>
</div>
