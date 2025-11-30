<script lang="ts">
	import { GradientDescenter, type ObjectiveFunction, type ObjectiveGradient } from '$lib/grad-descent';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { onMount } from 'svelte';
	import * as three from 'three';
	import { vv, type Vector2 } from '$lib/vector';

	let {
		w,
		h,
		obj_fn,
		obj_grad,
    init_point,
	}: {
		w: number;
		h: number;
		obj_fn: ObjectiveFunction;
		obj_grad: ObjectiveGradient;
    init_point: Vector2,
	} = $props();

  let squeeze_z = 0.2;

	let container: HTMLDivElement;
	let mesh: three.Mesh;
	let camera: three.Camera;
	let renderer: three.WebGLRenderer;
	let scene: three.Scene;
	let controls: OrbitControls;
  let start_point: three.Mesh;
  let route: three.Group;
  let points: Vector2[];

  let descenter = new GradientDescenter(obj_fn, obj_grad, init_point, 0.2, 0.5, 0.1, 100);

  function map_onto_fn(v: Vector2): [number, number, number] {
    return [v.x, obj_fn(v) * squeeze_z, v.y];
  }

  function view_to_xy(v: three.Vector3): Vector2 {
    return {x: v.x, y: v.z};
  }

	onMount(() => {
		init();

    container.ondblclick = (ev) => {
      const rc = new three.Raycaster();
      const mx = 2 * ev.offsetX / w - 1;
      const my = 2 * ev.offsetY / h - 1;

      rc.setFromCamera(new three.Vector2(mx, -my), camera);
      const intersects = rc.intersectObjects([mesh], true);
      
      if (intersects.length > 0) {
        start_point.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        descenter.clear(view_to_xy(intersects[0].point));
        update_route();
      }
    }
	});

  function update_route() {
    scene.remove(route);
    route = create_route(obj_fn, descenter.step_points);
    scene.add(route);
  }

	function create_function_surface(fn: ObjectiveFunction, size = 10, segments = 100) {
		const geometry = new three.PlaneGeometry(size, size, segments, segments);
		geometry.rotateX(-Math.PI / 2);

		const positions = geometry.attributes.position;

		for (let i = 0; i < positions.count; i++) {
			const x = positions.getX(i);
			const y = positions.getZ(i);
      positions.setXYZ(i, ...map_onto_fn({x, y}));
		}

		positions.needsUpdate = true;
		geometry.computeVertexNormals();

		const material = new three.MeshStandardMaterial({
			color: 0x88DDFF,
			wireframe: false,
			side: three.DoubleSide,
      metalness: 0.1,
      roughness: 0.5
		});

    return new three.Mesh(geometry, material);
	}

  function create_route(fn: ObjectiveFunction, points: Vector2[]) {
    const group = new three.Group();

    for (const p of points) {
      const material = new three.MeshPhongMaterial({color: 0xFFEEEE});

      const geometry = new three.SphereGeometry(0.1);
      const mesh = new three.Mesh(geometry, material);
      mesh.position.set(...map_onto_fn(p));

      group.add(mesh);
    }

    return group;
  }

	function init() {
		const ASPECT_RATIO = w / h;

		camera = new three.PerspectiveCamera(75, ASPECT_RATIO, 0.1, 1000);
		camera.position.z = 5;

		scene = new three.Scene();
		scene.background = new three.Color(0xddefef);
		
    const dirLight = new three.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const ambient = new three.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    mesh = create_function_surface(obj_fn, 10, 150);
    scene.add(mesh);

		renderer = new three.WebGLRenderer();
		renderer.setPixelRatio(1);
		renderer.setSize(w, h);
		renderer.setAnimationLoop(animate);
		renderer.shadowMap.enabled = true;

		container.appendChild(renderer.domElement);
		controls = new OrbitControls(camera, renderer.domElement);

    const geo_box = new three.SphereGeometry(0.2);
    const mat_box = new three.MeshPhongMaterial({color: 0xFF5555});

    start_point = new three.Mesh( geo_box, mat_box );
    start_point.position.set(...map_onto_fn(init_point))
    scene.add(start_point);

    descenter.clear(init_point);
	}

	function animate() {
		controls.update();
		renderer.render(scene, camera);
	}
</script>

<div bind:this={container}></div>

<div>
  <button class="border" onclick={() => {
    descenter.step();
    update_route();
  }}>step!</button>
</div>