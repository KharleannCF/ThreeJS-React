import React, { useRef, useEffect, useState } from "react";
import "./canvas.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

const FirstScene = () => {
	const mount = useRef(null);
	const [isAnimating, setAnimating] = useState(true);

	const generateHeight = (width, height) => {
		var size = width * height,
			data = new Uint8Array(size),
			perlin = new ImprovedNoise(),
			quality = 1,
			z = Math.random() * 100;

		for (var j = 0; j < 4; j++) {
			for (var i = 0; i < size; i++) {
				var x = i % width,
					y = ~~(i / width);
				data[i] += Math.abs(
					perlin.noise(x / quality, y / quality, z) * quality * 1.75
				);
			}

			quality *= 5;
		}

		return data;
	};

	useEffect(() => {
		let width = mount.current.clientWidth;
		let height = mount.current.clientHeight;
		let frameId;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);
		const controls = new OrbitControls(camera, mount.current);
		controls.update();
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		let geometry = new THREE.BoxGeometry(1, 1, 1);
		let material = new THREE.MeshLambertMaterial({
			color: 0xff00ff,
			reflectivity: 0.5,
		});
		let light = new THREE.SpotLight(0xff00ff, 1);
		light.position.set(0, 10, 40);

		const cube = new THREE.Mesh(geometry, material);
		light.target = cube;
		geometry = new THREE.PlaneBufferGeometry(
			100,
			100,
			width - 1,
			height - 1
		);
		material = new THREE.MeshLambertMaterial({
			color: 0x00aaaa,
			side: THREE.DoubleSide,
			reflectivity: 0.1,
		});

		let vertices = geometry.attributes.position.array;
		//const data = generateHeight(width, height);

		//	for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
		//		vertices[j + 1] = data[i] * 0.2;
		//	}

		const floor = new THREE.Mesh(geometry, material);

		floor.position.y = -5;
		floor.rotation.x = -Math.PI / 2;
		camera.position.z = -10;
		camera.position.y = 10;

		scene.add(light);
		scene.add(cube);
		scene.add(floor);
		renderer.setClearColor("#000000");
		renderer.setSize(width, height);

		const renderScene = () => {
			renderer.render(scene, camera);
		};

		const handleResize = () => {
			width = mount.current.clientWidth;
			height = mount.current.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderScene();
		};

		const animate = () => {
			controls.update();
			renderScene();
			frameId = window.requestAnimationFrame(animate);
		};

		const start = () => {
			if (!frameId) {
				frameId = requestAnimationFrame(animate);
			}
		};

		const stop = () => {
			cancelAnimationFrame(frameId);
			frameId = null;
		};

		mount.current.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		start();

		return () => {
			stop();
			window.removeEventListener("resize", handleResize);
			mount.current.removeChild(renderer.domElement);

			scene.remove(cube);
			geometry.dispose();
			material.dispose();
		};
	}, []);

	return <div className="canvas" ref={mount} />;
};
export default FirstScene;
