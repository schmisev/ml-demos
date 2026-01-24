<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<head>
	<title>ML/AI demos</title>
</head>

<div class="p-2">
	<h1>ML/AI demos</h1>
	<div class="light-border m-2">Disclaimer: these demos are in no way optimized and just here for my own amusement.<br>Not tested on Firefox & Internet Explorer or Mobile Browsers. Should run reasonably well in Chrome & Edge on PC.</div>
	<h2>Classification</h2>
	<h3><a href={resolve(`/kNN`)}>kNN & DT</a></h3>
	<h2>Probabilistic Inference</h2>
	<h3><a href={resolve(`/coin-toss`)}>Coin flips</a></h3>
	<h3><a href={resolve(`/football-goals`)}>Football goals</a></h3>
	<h2>Stochastic Processes</h2>
	<h3><a href={resolve(`/bayesian-networks`)}>Bayesian Networks (Monte-Carlo)</a></h3>
	<h3><a href={resolve(`/markov-chains`)}>Hidden Markov Models</a></h3>
	<h2>Linear classification & regression</h2>
	<h3><a href={resolve(`/linear-classification`)}>Linear classification</a> (WIP)</h3>
	<h2>Optimization</h2>
	<h3><a href={resolve(`/grad-descent`)}>Gradient descent</a></h3>
	<h2>Search algorithms</h2>
	<h3><a href={resolve(`/search`)}>Graph search</a></h3>
	<h3><a href={resolve(`/SAT`)}>CSPs</a></h3>
	<h2>Logical agents</h2>
	<h3><a href={resolve(`/wumpus`)}>Wumpus-World</a></h3>
	<h3><a href={resolve(`/scheduling`)}>Scheduling via resolution</a></h3>
	<h3><a href={resolve(`/q-functions`)}>Q-Functions</a> (WIP) </h3>
  <h2>Robotics</h2>
  <h3><a href={resolve(`/robot-arm`)}>Robot arm</a> (WIP) </h3>
  
  <div class="light-border m-2">
    <h2>Utilities</h2>
    <div>Pages for testing</div>
	<h3><a href={resolve(`/utils/graphing-hui`)}>Hui graph</a></h3>
  </div>
</div>
