<script lang="ts">
	import { rand, randint } from '$lib';
	import Data3DView from '$lib/components/Data3DView.svelte';
	import { ClassND, PlaneND, SampleND } from '$lib/data';
	import { m_print } from '$lib/matrix';

  const N_classes = 5;
  const classes: ClassND[] = [];

  for (let c = 0; c < N_classes; c++) {
    const v1 = rand(0, 5);
    const v2 = rand(0, 5);
    const v3 = rand(0, 5);
    const cv_01 = rand(-0.5, 0.5);
    const cv_02 = rand(-0.5, 0.5);
    const cv_12 = rand(-0.5, 0.5);
    
    const cls = new ClassND(
      c,
      [rand(-5, 5), rand(-5, 5), rand(-5, 5)],
      [
        [v1, cv_01, cv_02],
        [cv_01, v2, cv_12],
        [cv_02, cv_12, v3]
      ]
    )

    classes.push(cls);
  }

  const planes: PlaneND[] = [];
  for (let p = 0; p < N_classes-1; p++) {
    planes.push(new PlaneND(p, 0, [rand(-1, 1), rand(-1, 1), rand(-1, 1)]));
  } 

  const samples: SampleND[] = [];
  for (let i = 0; i < 100; i++) {
    const cls = classes[randint(0, classes.length)];
    const s = cls.draw_sample();
    samples.push(s);
  }
</script>

<div class="flex flex-col gap-2 p-2">
	<h2>Linear classification</h2>
  <Data3DView colormap={[0x00FF00, 0xFF0000, 0x0000FF, 0x00FFFF, 0xFFFF00, 0xFF00FF]} w={500} h={500} data={samples} planes={planes}></Data3DView>
</div>
