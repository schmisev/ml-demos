<script>
	import { randint } from "$lib";
	import WumpusWorldViz from "$lib/components/WumpusWorldViz.svelte";
	import { WumpusWorld } from "$lib/wumpus.svelte";

  let world = new WumpusWorld(4);

  function reset() {
    world = new WumpusWorld(randint(4, 8));
  }
</script>
<div class="flex flex-col gap-2 p-2">
  <h1>Wumpus world | <a href="../">back</a></h1>
  <div class="flex flex-row">
  <div class="grid grid-cols-3 grid-rows-3">
    <div></div>
    <button class="border" onclick={() => world.move_up()}>up</button>
    <div></div>
    <button class="border" onclick={() => world.move_left()}>left</button>
    <div></div>
    <button class="border" onclick={() => world.move_right()}>right</button>
    <div></div>
    <button class="border" onclick={() => world.move_down()}>down</button>
    <div></div>
  </div>
  
  </div>
  <div class="flex flex-row items-center">
    <button class="border" onclick={reset}>reset</button>
  </div>
  <WumpusWorldViz {world}></WumpusWorldViz>
  <table>
    <tbody>
      <tr>
        <th>Hero KB</th><td>{world.hero_kb_text}</td>
      </tr>
      <tr>
        <th>Local rules</th><td>{world.local_rule}</td>
      </tr>
      <tr>
        <th>Current observation</th><td>{world.local_state}</td>
      </tr>
      <tr>
        <th>Local hero CNF</th><td>{world.local_cnf}</td>
      </tr>
    </tbody>
  </table>

  <div class="pl-2 pr-2">Test:</div>
</div>