<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<div class="p-2">
  <h1>ML demos</h1>
  <div>Disclaimer: these demos are in no way optimized and just here for my own amusement</div>
  <h2>Classification</h2>
  <h3><a href="{resolve(`/kNN`)}">kNN & DT</a></h3>
  <h2>Probabilistic Inference</h2>
  <h3><a href="{resolve(`/coin-toss`)}">Coin flips</a></h3>
  <h3><a href="{resolve(`/football-goals`)}">Football goals</a></h3>
  <h2>Linear regression</h2>
  <h3><a href="{resolve(`/linear-regression`)}">Linear regression</a></h3>
  <h2>Search algorithms</h2>
 <h3><a href="{resolve(`/search`)}">Graph search</a></h3>
  <h3><a href="{resolve(`/SAT`)}">Constraint satisfyability problems</a></h3>
</div>