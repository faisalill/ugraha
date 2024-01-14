import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.physicallyCorrectLights = true
document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls( camera, renderer.domElement );
const pointerControls = new PointerLockControls( camera, renderer.domElement );
document.addEventListener( 'click', function () {
  pointerControls.isLocked = !pointerControls.isLocked;  
})
pointerControls.pointerSpeed = 2;
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

document.addEventListener( 'keydown', function ( event ) {
// make sure to prevent anti ghosting too
const key = event.key;
if ( key === 'w' ) {
  pointerControls.moveForward( 0.2 );
  }
if ( key === 's' ) {
  pointerControls.moveForward( -0.2 );
  }
if ( key === 'a' ) {
  pointerControls.moveRight( -0.2 );
  }
if ( key === 'd' ) {
  pointerControls.moveRight( 0.2 );
  }
});

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
	renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
  alert( 'WebGL is not available.');
}
