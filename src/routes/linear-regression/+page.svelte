<script lang="ts">
	import { generate_linear_2d_samples } from "$lib/linreg";
	import { m_id, m_mat, m_vec, mmult, mprint, mscale } from "$lib/matrix";
  import P5, { type p5 } from "p5-svelte";

  const M2 = mprint(m_mat([[1, 2], [1, 0], [1, 0]]));
  const M = mprint(mscale(m_id(3, 3), 4))
  const v = mprint(m_vec([1, 1, 5]))
  const e = mprint(mmult(M, M2))

  const data = generate_linear_2d_samples(200, 100, 1, 0, 10);

  const L = 400;
  const W = 400;
  const H = 300;

  let w0 = $state(0);
  let w1 = $state(0);
  let w2 = $state(0);

  const sketch = (p5: p5) => {
    p5.setup = () => {
      p5.createCanvas(600, 600, "webgl");
      p5.background(0);
      p5.stroke(0);
    }

    p5.draw = () => {
      p5.orbitControl();

      p5.background(0);

      p5.push();

      p5.push();
      p5.noFill();
      p5.stroke(255);
      p5.box(L, H, W);
      p5.pop();

      p5.noStroke();
      for (let s of data.samples) {
        p5.push();
        if (s.y === data.y_min) {
          p5.fill(0, 0, 255);
        } else if (s.y === data.y_max) {
          p5.fill(0, 255, 0);
        } else {
          p5.fill(255, 0, 0);
        }

        p5.translate(s.X.x * L, -(s.y - data.y_min), s.X.y * W);
        p5.sphere(3, 3);
        p5.pop();
      }

      p5.pop();

      
      // p5.push();
      // p5.translate(0, H/2, 0);
      // p5.noStroke();
      // p5.rotateX(Math.PI / 2)
      // p5.fill(255, 128);
      // p5.plane(L, W);
      // p5.pop();

      p5.push();
      // draw quad representing fit
      const step = 0.05;

      for (let x = -0.5; x <= 0.5-step; x += step) {
        for (let y = -0.5; y <= 0.5-step; y += step) {
          const x11 = x;
          const x21 = y;
          const x12 = x + step;
          const x22 = y + step;

          const y11 = w0 + w1*x11 + w2*x21;
          const y12 = w0 + w1*x11 + w2*x22;
          const y21 = w0 + w1*x12 + w2*x21;
          const y22 = w0 + w1*x12 + w2*x22;

          p5.quad(
            x11 * L, -(y11), x21 * W,
            x11 * L, -(y12), x22 * W, 
            x12 * L, -(y22), x22 * W, 
            x12 * L, -(y21), x21 * W, 
          )
        }
      }

      p5.pop();
    }
  }
</script>

<div class="flex flex-col gap-2 p-2">
	<h1>2D Linear regression | <a href="../">back</a></h1>
  <div>
    <P5 sketch={sketch}></P5>
  </div>
  <label>w0 = <input type="range" min="-100" max="100" bind:value={w0}> = {w0 - data.y_min}</label>
  <label>w1 = <input type="range" min="-100" max="100" bind:value={w1}> = {w1}</label>
  <label>w2 = <input type="range" min="-100" max="100" bind:value={w2}> = {w2}</label>
</div> 