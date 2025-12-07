<script lang="ts">
	import { Descenter, type ObjectiveFunction } from '$lib/grad-descent.svelte';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { onMount } from 'svelte';
	import * as three from 'three';
	import { vlen, vv, type Vec2D } from '$lib/vector';

	let {
		w,
		h,
    descenter,
    squeeze_z = 0.2,
	}: {
		w: number;
		h: number;
    descenter: Descenter;
    squeeze_z: number;
	} = $props();

	let container: HTMLDivElement;
	let mesh: three.Mesh;
	let camera: three.Camera;
	let renderer: three.WebGLRenderer;
	let scene: three.Scene;
	let controls: OrbitControls;
  let start_point: three.Mesh;
  let grad_arrow: three.ArrowHelper;
  let route: three.Group;

  function map_onto_fn(fn: ObjectiveFunction, v: Vec2D): [number, number, number] {
    return [v.x1, fn(v) * squeeze_z, v.x2];
  }

  function view_to_xy(v: three.Vector3): Vec2D {
    return {x1: v.x, x2: v.z};
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

  export function update_route() {
    scene.remove(route);
    route = create_route(descenter.fn, descenter.step_points);
    scene.add(route);

    scene.remove(grad_arrow);
    grad_arrow = create_grad_arrow();
    scene.add(grad_arrow);
  }

  function create_grad_arrow(): three.ArrowHelper {
    return new three.ArrowHelper(
      new three.Vector3(-descenter.grad_curr.x1, 0, -descenter.grad_curr.x2),
      new three.Vector3(...map_onto_fn(descenter.fn, descenter.p_curr)),
      Math.log(vlen(descenter.grad_curr)+1),
      0xffff00,
      undefined,
      0.3
    )
  }

	function create_function_surface(fn: ObjectiveFunction, size = 10, segments = 100) {
		const geometry = new three.PlaneGeometry(size, size, segments, segments);
		geometry.rotateX(-Math.PI / 2);

		const positions = geometry.attributes.position;

		for (let i = 0; i < positions.count; i++) {
			const x = positions.getX(i);
			const y = positions.getZ(i);
      positions.setXYZ(i, ...map_onto_fn(fn, {x1: x, x2: y}));
		}

		positions.needsUpdate = true;
		geometry.computeVertexNormals();

		const material = new three.MeshMatcapMaterial({
			color: 0x88DDFF,
			wireframe: false,
			side: three.DoubleSide,
		});

    return new three.Mesh(geometry, material);
	}

  function create_route(fn: ObjectiveFunction, points: Vec2D[]) {
    const group = new three.Group();

    const material = new three.MeshBasicMaterial({color: 0xFF0000});
    const material_2 = new three.MeshBasicMaterial({color: 0xFFFF00});
    const line_material = new three.LineBasicMaterial({color: 0xFF0000})

    const stops: three.Vector3[] = [];

    for (const [i, p] of points.entries()) {
      const is_last = i === points.length-1;
      
      const geometry = new three.SphereGeometry(is_last ? 0.15 : 0.1);
      const mesh = new three.Mesh(geometry, is_last ? material_2 : material);
      const coords = map_onto_fn(fn, p);
      mesh.position.set(...coords);

      group.add(mesh);

      // line
      stops.push(new three.Vector3(coords[0], coords[1]+0.1, coords[2]));
    }

    const line_geometry = new three.BufferGeometry().setFromPoints(stops);
    const line = new three.Line(line_geometry, line_material);
    group.add(line);

    return group;
  }

	function init() {
		const ASPECT_RATIO = w / h;

		camera = new three.PerspectiveCamera(75, ASPECT_RATIO, 0.1, 1000);
		camera.position.y = 15;
    camera.position.x = -6;
    camera.position.z = -6;

		scene = new three.Scene();
		scene.background = new three.Color(0x000022);
		
    const dirLight = new three.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(3, 10, 0);
    scene.add(dirLight);

    const dirLight2 = new three.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(3, -10, 0);
    scene.add(dirLight2);

    const ambient = new three.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    mesh = create_function_surface(descenter.fn, 12, 150);
    scene.add(mesh);

    const axes = new three.AxesHelper(50);
    scene.add(axes);

		renderer = new three.WebGLRenderer({
      antialias: true
    });
		renderer.setPixelRatio(1);
		renderer.setSize(w, h);
		renderer.setAnimationLoop(animate);
		renderer.shadowMap.enabled = true;

		container.appendChild(renderer.domElement);
		controls = new OrbitControls(camera, renderer.domElement);

    const geo_box = new three.SphereGeometry(0.2);
    const mat_box = new three.MeshBasicMaterial({color: 0xFF5555});

    start_point = new three.Mesh( geo_box, mat_box );
    start_point.position.set(...map_onto_fn(descenter.fn, descenter.init_point))
    scene.add(start_point);

    descenter.clear(descenter.init_point);

    grad_arrow = create_grad_arrow();
    scene.add(grad_arrow);
	}

	function animate() {
		controls.update();
		renderer.render(scene, camera);
	}
</script>

<div bind:this={container}></div>