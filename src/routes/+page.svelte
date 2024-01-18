<style>

:root {
--cyber-orange: #ff4b17;
--cyber-green: #00ff00;
--cyber-blue: #00fed2;
--cyber-dark-blue: #0a5dff;
--cyber-black: #000;
--cyber-red: #fd1630;
--cyber-white: #cdcdcd;
--cyber-yellow: #fff901;
--cyber-purple: #ff399e;
}

 * { 
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   overflow: hidden;
  }

  .loading-wrapper{
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: pink; 
    color: #fff;
    font-size: 2rem;
    font-family: sans-serif;
  }
/* HTML: <div class="loader"></div> */
.loader {
  width: fit-content;
  font-size: 17px;
  font-family: monospace;
  line-height: 1.4;
  scale: 5;
  font-weight: bold;
  background: 
    linear-gradient(#000 0 0) left ,
    linear-gradient(#000 0 0) right;
  background-repeat: no-repeat; 
  border-right: 5px solid #0000;
  border-left: 5px solid #0000;
  background-origin: border-box;
  position: relative;
  animation: l9-0 2s infinite;
  transition: all 0.5s;
}

.loader::before {
  content:"Loading";
}

.loader::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  width: 22px;
  height: 60px;
  background: 
   linear-gradient(90deg,#000 4px,#0000 0 calc(100% - 4px),#000 0) bottom            /22px 20px,
   linear-gradient(90deg,red  4px,#0000 0 calc(100% - 4px),red  0) bottom 10px left 0/22px 6px,
   linear-gradient(#000 0 0) bottom 3px left 0  /22px 8px,
   linear-gradient(#000 0 0) bottom 0   left 50%/8px  16px;
 background-repeat: no-repeat;
 animation: l9-1 2s infinite;
}
 
@keyframes l9-0{
  0%,25%    {background-size: 50% 100%}
  25.1%,75% {background-size: 0 0,50% 100%}
  75.1%,100%{background-size: 0 0,0 0}
}

@keyframes l9-1{
  25%   { background-position:bottom, bottom 54px left 0,bottom 3px left 0,bottom 0 left 50%;left:0}
  25.1% { background-position:bottom, bottom 10px left 0,bottom 3px left 0,bottom 0 left 50%;left:0}
  50%   { background-position:bottom, bottom 10px left 0,bottom 3px left 0,bottom 0 left 50%;left:calc(100% - 22px)}
  75%   { background-position:bottom, bottom 54px left 0,bottom 3px left 0,bottom 0 left 50%;left:calc(100% - 22px)}
  75.1% { background-position:bottom, bottom 10px left 0,bottom 3px left 0,bottom 0 left 50%;left:calc(100% - 22px)}
}

 .canvas{
    opacity: 0%;
    width: 100vw;
    height: 100vh;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    transition: all 4s;
 }

 .slider{
 width: 35vw; 
 height: 60vh;
 position: fixed;
 top: 20vh;
 left: 60vw;
 pointer-events: none;
 z-index: 100;
 background: black;
 opacity: 65%;
 transition: all 1s;
 border: 5px solid var(--cyber-blue);
 border-radius: 10px;
 scale: 0;
 }

.slider-canvas {
scale: 0;
position: fixed;
z-index: 1000;
 top: 20vh;
 left: 60vw;
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
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../app.css';

const initialCameraPosition = new THREE.Vector3( 5, 2, 0 );

// unhide slider element

let canvasMounted = false;

let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  leftClick: false,
  rightClick: false
}

let pointerControls;
let mixer;
let clips;
let camera;
let isEventListenerSet = false;
let objects = {
  payload: null,
}

onMount(()=>{
canvasMounted = true;
const scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas"), antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.physicallyCorrectLights = true
document.body.appendChild( renderer.domElement );


const briefScene = new THREE.Scene();
const briefCamera = new THREE.PerspectiveCamera(55, (window.innerWidth * 0.35) / (window.innerHeight * 0.60), 0.1, 1000)
const briefRenderer = new THREE.WebGLRenderer({canvas: document.getElementById('slider-canvas'), antialias: true});
briefRenderer.setSize(window.innerWidth*0.35, window.innerHeight * 0.60);
briefRenderer.physicallyCorrectLights = true;
document.body.appendChild( briefRenderer.domElement)

// const controls = new OrbitControls( camera, renderer.domElement );
 let fpvControls = new FirstPersonControls( camera, renderer.domElement );
fpvControls.heightMax = 0.001;
fpvControls.heightMin = 0;
fpvControls.lookSpeed = 0.003;
fpvControls.movementSpeed = 0.03;
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

  document.addEventListener( 'mousedown', function ( event ) {
    switch ( event.button ) {
      case 0: // left
        keys.leftClick = true;
        break;
      case 2: // right
        keys.rightClick = true;
        break;
    }
  }, false );

  document.addEventListener( 'mouseup', function ( event ) {
    switch ( event.button ) {
      case 0: // left
        keys.leftClick = false;
        break;
      case 2: // right
        keys.rightClick = false;
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

let cameraPosition = new THREE.Vector3( initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z );

camera.position.set( cameraPosition.x, cameraPosition.y, cameraPosition.z );
// controls.update();
let loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
  // console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

loadingManager.onLoad = function ( ) {
  // console.log( 'Loading complete!');
  document.querySelector('.loading-wrapper').style.display = 'none';
  document.querySelector('.canvas').style.opacity = '100%';
};
  
const loader = new GLTFLoader(loadingManager);
const rgbLoader = new RGBELoader(loadingManager)
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/' );
dracoLoader.setDecoderConfig( { type: 'js' } );
loader.setDRACOLoader( dracoLoader );

let skyGeo = new THREE.SphereGeometry( 900, 25, 25 );
let skyMat = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
let skyMesh = new THREE.Mesh( skyGeo, skyMat );
scene.add( skyMesh );
let briefSkyMesh = new THREE.Mesh( skyGeo, skyMat );
briefScene.add( briefSkyMesh );

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const slider = document.getElementById('slider');

// function onMouseMove (event) {
//   pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//   pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//
//   raycaster.setFromCamera( pointer, camera );
//   const intersects = raycaster.intersectObjects( scene.children );
//
//     for ( let i = 0; i < intersects.length; i ++ ) {
//       // console.log(intersects[0].object.name)
//       switch (intersects[0].object.name) {
//         case 'Payload1868':
//         case 'Payload1868_3':
//         case 'Payload1868_2':
//         case 'Payload1868_1':
//           slider.style.transform = 'scale(1)';
//           break;
//         default:
//           slider.style.transform = 'scale(0)';
//           break;
//       }
//     }
//   }
//
// document.addEventListener( 'mousemove', onMouseMove);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild( labelRenderer.domElement );

const p = document.createElement('p');
p.textContent = 'Hello World!';
// const label = new CSS2DObject( p );
// scene.add( label );
// label.position.set( 5, 2, -5 );

const divWrapper = document.createElement('div');
// divWrapper.appendChild(p);
divWrapper.innerHTML = `
<div>
  <h3>PayLoad</h3>
  <p>
    Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea   </p>
</div>
`
// divWrapper.className = 'label-wrapper';
// const labelWrapper = new CSS2DObject( divWrapper );
// labelWrapper.position.set( -2, 6, -35 );
// scene.add( labelWrapper );

function createStar() {
  // Create star geometry (adjust radius for desired size)
  var starGeo = new THREE.SphereGeometry( 1.2, 4, 4 );

  // Create material with random color and emissive values
  var starMat = new THREE.MeshBasicMaterial( {
    color: 0xffffff * Math.random(), // Random white-tinted color
    emissive: 0x111111 * Math.random(), // Random subtle glow
  } );

  // Create star object, position it randomly within the sky sphere
  var star = new THREE.Mesh( starGeo, starMat );
  star.position.set(
    Math.random() * 2000 - 1000, // Random x-coordinate
    Math.random() * 2000 - 1000, // Random y-coordinate
    Math.random() * 1000 - 500   // Random z-coordinate (depth)
  );

  return star;
}

// Create a number of stars (adjust as needed)
var numStars = 200;
var stars = [];
for (var i = 0; i < numStars; i++) {
  var star = createStar();
  scene.add(star);
  stars.push(star);
}

const pathToEnv = './hdris/sunset.hdr';
const pathToGlb = './models/scene.glb';

loader.load( pathToGlb, function ( gltf ) {
  scene.add( gltf.scene );
  mixer = new THREE.AnimationMixer( gltf.scene );
  clips = gltf.animations;
  const earthAnim = THREE.AnimationClip.findByName( clips, 'Take 001_Earth');
  const earthAction = mixer.clipAction( earthAnim );
  earthAction.play();
  const cloudAnim = THREE.AnimationClip.findByName( clips, 'Take 001_EarthClouds');
  const cloudAction = mixer.clipAction( cloudAnim );
  cloudAction.play();
});


loader.load( pathToGlb, function ( gltf ) {
  objects.payload = gltf.scene.children[107]; 
  objects.payload.position.set( 0, 0, -5 );
  briefScene.add(gltf.scene.children[107])
});

rgbLoader.load( pathToEnv, function ( texture ) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
  briefScene.background = texture;
  briefScene.environment = texture;
   
  render();
});

const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame( animate );
  // const target = controls.target;
  // controls.update();
  // controlTrack.target.set( target.x, target.y, target.z );
  // controlTrack.update();
  fpvControls.update(0.5);
  if(mixer){
        mixer.update(clock.getDelta());
    }
  if(objects.payload){
    objects.payload.rotation.y += 0.01;
    objects.payload.rotation.x -= 0.01;
    objects.payload.rotation.z += 0.01;
  }
  labelRenderer.render( scene, camera );
  briefRenderer.render( briefScene, briefCamera );
	renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
  alert( 'WebGL is not available.');
}
})

$: {
  if(canvasMounted && mixer && clips){
    if(keys.w || keys.a || keys.s || keys.d || keys.rightClick || keys.leftClick){
      if(camera.position.z < -8){
        const openLeftDoor = THREE.AnimationClip.findByName( clips, 'open_door_left' );
        const openRightDoor = THREE.AnimationClip.findByName( clips, 'open_door_right' );
        const logoExit = THREE.AnimationClip.findByName( clips, 'logo_exit' );
        const openLeftDoorAction = mixer.clipAction( openLeftDoor );
        const openRightDoorAction = mixer.clipAction( openRightDoor );
        const logoExitAction = mixer.clipAction( logoExit );
        openLeftDoorAction.play();
        openRightDoorAction.play();
        logoExitAction.play();
        openLeftDoorAction.loop = THREE.LoopOnce;
        openRightDoorAction.loop = THREE.LoopOnce;
        logoExitAction.loop = THREE.LoopOnce;

        if(!isEventListenerSet){
          mixer.addEventListener('finished', function (e) {
            const openedLeftDoor = THREE.AnimationClip.findByName( clips, 'opened_door_left' );
            const openedRightDoor = THREE.AnimationClip.findByName( clips, 'opened_door_right' );
            const exitedLogo = THREE.AnimationClip.findByName( clips, 'exited_logo' );
            const openedLeftDoorAction = mixer.clipAction( openedLeftDoor );
            const openedRightDoorAction = mixer.clipAction( openedRightDoor );
            const exitedLogoAction = mixer.clipAction( exitedLogo );
            openedLeftDoorAction.play();
            openedRightDoorAction.play();
            exitedLogoAction.play();
          })
          isEventListenerSet = true;
        }
      }
    }
  }
}
</script>


<div class="loading-wrapper">
<div class="loader">
</div>
</div>

<div class="canvas-wrapper">
<canvas class="canvas" id="canvas"></canvas>
</div>

<div class="slider" id="slider">
<canvas class="slider-canvas" id="slider-canvas">
</canvas>
</div>

