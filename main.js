import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.physicallyCorrectLights = true
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = true;
controls.enablePan = true;
controls.minDistance = 0.1;
controls.maxDistance = 10;
controls.zoomSpeed = 0.1;
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();
const loader = new GLTFLoader();
const rgbLoader = new RGBELoader();
const pathToEnv = './hdris/hdri.hdr';
const pathToGlb = './models/scene.glb';
loader.load( pathToGlb, function ( gltf ) {
  scene.add( gltf.scene );
});
rgbLoader.load( pathToEnv, function ( texture ) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
  render();
});

function animate() {
	requestAnimationFrame( animate );
  controls.update();
	renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
  alert( 'WebGL is not available.');
}
