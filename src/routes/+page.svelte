<style>
 * { 
   margin: 0;
   padding: 0;
  box-sizing: border-box;
  }
 .canvas{
    width: 100vw;
    height: 100vh;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
 }
</style>

<script>
import { onMount } from 'svelte';
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

let canvasMounted = false;

let keys = {
  w: false,
  a: false,
  s: false,
  d: false
}
var pointerControls;

onMount(()=>{
canvasMounted = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas"), antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.physicallyCorrectLights = true
document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls( camera, renderer.domElement );
 let fpvControls = new FirstPersonControls( camera, renderer.domElement );
fpvControls.heightMax = 0.001;
fpvControls.heightMin = 0;
fpvControls.lookSpeed = 0.003;
fpvControls.movementSpeed = 0.5;
fpvControls.constrainVertical = true;
fpvControls.verticalMin = 1.0;
fpvControls.verticalMax = 2.0;
pointerControls = new PointerLockControls( camera, renderer.domElement );
// document.addEventListener( 'click', function () {
//   pointerControls.lock();
// })
pointerControls.pointerSpeed = 2;

document.addEventListener( 'keydown', function ( event ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      keys.w = true;
      break;
    case 37: // left
    case 65: // a
      keys.a = true;
      break;
    case 40: // down
    case 83: // s
      keys.s = true;
      break;
    case 39: // right
    case 68: // d
      keys.d = true;
      break;
  }
}, false );

document.addEventListener( 'keyup', function ( event ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      keys.w = false;
      break;
    case 37: // left
    case 65: // a
      keys.a = false;
      break;
    case 40: // down
    case 83: // s
      keys.s = false;
      break;
    case 39: // right
    case 68: // d
      keys.d = false;
      break;
  }
}, false );

// controls.enableZoom = false;
// controls.enablePan = true;
// controls.minDistance = 0.1;
// controls.maxDistance = 10;
// controls.zoomSpeed = 0.1;
//controls.update() must be called after any manual changes to the camera's transform

const controlTrack = new TrackballControls( camera, renderer.domElement );
controlTrack.noRotate = true;
controlTrack.noPan = true;
controlTrack.noZoom = false;
controlTrack.zoomSpeed = 0.8;

let cameraPosition = new THREE.Vector3( 5, 2, 0 );


camera.position.set( cameraPosition.x, cameraPosition.y, cameraPosition.z );
// controls.update();
const loader = new GLTFLoader();
const rgbLoader = new RGBELoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/' );
dracoLoader.setDecoderConfig( { type: 'js' } );
loader.setDRACOLoader( dracoLoader );

const pathToEnv = './hdris/sunset.hdr';
const pathToGlb = './models/without_texture_painting.glb';
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
  // const target = controls.target;
  // controls.update();
  // controlTrack.target.set( target.x, target.y, target.z );
  // controlTrack.update();
    fpvControls.update(0.1);
	renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
  alert( 'WebGL is not available.');
}
})

$: {
  if(canvasMounted){

  if(keys.w){
    pointerControls.moveForward(0.1);
  }
  if(keys.a){
    pointerControls.moveRight(-0.1);
  }
  if(keys.s){
    pointerControls.moveForward(-0.1);
  }
  if(keys.d){
    pointerControls.moveRight(0.1);
  };
  }
}
</script>

<canvas class="canvas" id="canvas"></canvas>
