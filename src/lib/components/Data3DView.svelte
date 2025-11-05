<script lang="ts">
	import type { PlaneND, SampleND } from '$lib/data';
	import { m_to_vec } from '$lib/matrix';

  let {
    w = 500,
    h = 500,
    data,
    planes,
    colormap,
  }: {
    w: number,
    h: number,
    data: SampleND[],
    planes: PlaneND[],
    colormap: number[]
  } = $props();


	import { onMount } from 'svelte';
	import * as three from 'three';
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";

  let container: HTMLDivElement;
  let mesh: three.Mesh;
  let camera: three.Camera;
  let renderer: three.WebGLRenderer;
  let scene: three.Scene;
  let controls: OrbitControls;

  onMount(() => {
    init();
  });

	function init() {
		const ASPECT_RATIO = w / h;

    camera = new three.PerspectiveCamera(75, ASPECT_RATIO, 0.1, 1000);
    camera.position.z = 5;

	  scene = new three.Scene();
    scene.background = new three.Color(0xDDEFEF);
		scene.add(new three.AmbientLight(0xFFFFFF));

		const light = new three.DirectionalLight(0xffffff, 3);
		light.position.set(0.5, 0.5, 1);
		light.castShadow = true;
		light.shadow.camera.zoom = 4;
		// scene.add(light);

    for (const sample of data){

      const geo_box = new three.SphereGeometry(0.1);
      const mat_box = new three.MeshPhongMaterial({color: colormap[sample.y % colormap.length]});

      mesh = new three.Mesh( geo_box, mat_box );
      mesh.position.set(sample.x(0), sample.x(1), sample.x(2));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    for (const plane of planes) {
      const geo_plane = new three.Plane(new three.Vector3(...m_to_vec(plane.w)), plane.w0);
      scene.add(new three.PlaneHelper(geo_plane, 500, colormap[plane.normal_y % colormap.length]));
    }

    renderer = new three.WebGLRenderer();
    renderer.setPixelRatio(1);
    renderer.setSize(w, h);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
	}

  function animate() {
    controls.update();
    renderer.render(scene, camera);
  }
</script>

<div bind:this={container}></div>
