<script>
import { onMount } from "svelte";
  import * as THREE from "three";
  import WebGL from "three/addons/capabilities/WebGL.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
  import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
  import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
  import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
  import {
    objects,
    objectInfo,
    objectPositionAndScale,
  } from "$lib/satellite.js";
  import "../app.css";

  const initialCameraPosition = new THREE.Vector3(5, 2, -3);

  // unhide slider element

  let canvasMounted = false;

  let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    leftClick: false,
    rightClick: false,
  };

  let mixer;
  let clips;
  let camera;
  let isEventListenerSet = false;

  let currentObject = null;

  onMount(() => {
    canvasMounted = true;

    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("canvas"),
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);

    const briefScene = new THREE.Scene();
    const briefCamera = new THREE.PerspectiveCamera(
      55,
      (window.innerWidth * 0.35) / (window.innerHeight * 0.6),
      0.1,
      1000
    );
    const briefRenderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("slider-canvas"),
      antialias: true,
    });
    briefRenderer.setSize(window.innerWidth * 0.35, window.innerHeight * 0.6);
    briefRenderer.physicallyCorrectLights = true;
    document.body.appendChild(briefRenderer.domElement);

    let fpvControls = new FirstPersonControls(camera, renderer.domElement);
    fpvControls.heightMax = 0.001;
    fpvControls.heightMin = 0;
    fpvControls.lookSpeed = 0.003;
    fpvControls.movementSpeed = 0.04;
    // fpvControls.constrainVertical = true;
    // fpvControls.verticalMin = 1.0;
    // fpvControls.verticalMax = 2.0;

    document.addEventListener(
      "keydown",
      function (event) {
        switch (event.keyCode) {
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
      },
      false
    );

    document.addEventListener(
      "keyup",
      function (event) {
        switch (event.keyCode) {
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
      },
      false
    );

    document.addEventListener(
      "mousedown",
      function (event) {
        switch (event.button) {
          case 0: // left
            keys.leftClick = true;
            break;
          case 2: // right
            keys.rightClick = true;
            break;
        }
      },
      false
    );

    document.addEventListener(
      "mouseup",
      function (event) {
        switch (event.button) {
          case 0: // left
            keys.leftClick = false;
            break;
          case 2: // right
            keys.rightClick = false;
            break;
        }
      },
      false
    );

    window.addEventListener( "resize" , function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    });

    let cameraPosition = new THREE.Vector3(
      initialCameraPosition.x,
      initialCameraPosition.y,
      initialCameraPosition.z
    );

    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    let loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
      // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      // console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    loadingManager.onLoad = function () {
      // console.log( 'Loading complete!');
      document.querySelector(".loading-wrapper").style.display = "none";
      document.querySelector(".canvas").style.opacity = "100%";
    };

    const loader = new GLTFLoader(loadingManager);
    const rgbLoader = new RGBELoader(loadingManager);
    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);

    let skyGeo = new THREE.SphereGeometry(900, 25, 25);
    let skyMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });
    let skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);
    let briefSkyMesh = new THREE.Mesh(skyGeo, skyMat);
    briefScene.add(briefSkyMesh);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const slider = document.getElementById("slider");
    const slider_canvas = document.getElementById("slider-canvas");
    const info = document.getElementById("info");

    let previousIntersectedObject = null;

    function onMouseMove(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      switch (intersects[0].object.name) {
        case "Mesh011":
        case "Mesh011_1":
        case "Mesh011_2":
        case "Mesh011_3":
        case "Mesh011_4":
        case "Mesh001_5":
          // console.log("Battery")
          info.innerHTML = `
          <h3>${objectInfo.battery.title}</h3>
          <p>${objectInfo.battery.description}</p>
          `;

          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.battery;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.battery.position.set(
            objectPositionAndScale.battery.position.x,
            objectPositionAndScale.battery.position.y,
            objectPositionAndScale.battery.position.z
          );
          objects.battery.scale.set(
            objectPositionAndScale.battery.scale.x,
            objectPositionAndScale.battery.scale.y,
            objectPositionAndScale.battery.scale.z
          );
          briefScene.add(objects.battery);
          previousIntersectedObject = objects.battery;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        case "Payload001":
        case "Payload001_3":
          // console.log("Payload")
          info.innerHTML = `
          <h3>${objectInfo.payload.title}</h3>
          <p>${objectInfo.payload.description}</p>
          `;
          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.payload;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.payload.position.set(
            objectPositionAndScale.payload.position.x,
            objectPositionAndScale.payload.position.y,
            objectPositionAndScale.payload.position.z
          );
          objects.payload.scale.set(
            objectPositionAndScale.payload.scale.x,
            objectPositionAndScale.payload.scale.y,
            objectPositionAndScale.payload.scale.z
          );
          briefScene.add(objects.payload);
          previousIntersectedObject = objects.payload;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        case "Motor_Panel_0004":
        case "Motor_Panel_0004_1":
        case "Motor_Panel_0005":
        case "Motor_Panel_0005_1":
          // console.log("Solar panel")
          info.innerHTML = `
          <h3>${objectInfo.solar_panel.title}</h3>
          <p>${objectInfo.solar_panel.description}</p>
          `;
          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.solar_panel_1;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.solar_panel_1.position.set(
            objectPositionAndScale.solar_panel_1.position.x,
            objectPositionAndScale.solar_panel_1.position.y,
            objectPositionAndScale.solar_panel_1.position.z
          );
          objects.solar_panel_1.scale.set(
            objectPositionAndScale.solar_panel_1.scale.x,
            objectPositionAndScale.solar_panel_1.scale.y,
            objectPositionAndScale.solar_panel_1.scale.z
          );
          briefScene.add(objects.solar_panel_1);
          previousIntersectedObject = objects.solar_panel_1;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        case "side_panel":
          // console.log("Side Panel");
          info.innerHTML = `
          <h3>${objectInfo.side_panel.title}</h3>
          <p>${objectInfo.side_panel.description}</p>
          `;
          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.side_panel;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.side_panel.position.set(
            objectPositionAndScale.side_panel.position.x,
            objectPositionAndScale.side_panel.position.y,
            objectPositionAndScale.side_panel.position.z
          );
          objects.side_panel.scale.set(
            objectPositionAndScale.side_panel.scale.x,
            objectPositionAndScale.side_panel.scale.y,
            objectPositionAndScale.side_panel.scale.z
          );
          briefScene.add(objects.side_panel);
          previousIntersectedObject = objects.side_panel;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        case "thin_panel_2":
        case "thin_panel_1":
          // console.log("Thin Panel")
          info.innerHTML = `
          <h3>${objectInfo.side_panel.title}</h3>
          <p>${objectInfo.side_panel.description}</p>
          `;
          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.side_panel;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.side_panel.position.set(
            objectPositionAndScale.side_panel.position.x,
            objectPositionAndScale.side_panel.position.y,
            objectPositionAndScale.side_panel.position.z
          );
          objects.side_panel.scale.set(
            objectPositionAndScale.side_panel.scale.x,
            objectPositionAndScale.side_panel.scale.y,
            objectPositionAndScale.side_panel.scale.z
          );
          briefScene.add(objects.side_panel);
          previousIntersectedObject = objects.side_panel;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        case "Magnetometer001":
        case "Magnetometer002":
          // console.log("Magnetometer");
          info.innerHTML = `
          <h3>${objectInfo.magnetometer.title}</h3>
          <p>${objectInfo.magnetometer.description}</p>
          `;
          info.style.transform = "scale(0)";
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          currentObject = objects.magnetometer;
          if (briefScene.children.length > 1) {
            briefScene.remove(briefScene.children[1]);
          }
          objects.magnetometer.position.set(
            objectPositionAndScale.magnetometer.position.x,
            objectPositionAndScale.magnetometer.position.y,
            objectPositionAndScale.magnetometer.position.z
          );
          objects.magnetometer.scale.set(
            objectPositionAndScale.magnetometer.scale.x,
            objectPositionAndScale.magnetometer.scale.y,
            objectPositionAndScale.magnetometer.scale.z
          );
          briefScene.add(objects.magnetometer);
          previousIntersectedObject = objects.magnetometer;
          slider.style.transform = "scale(1)";
          slider_canvas.style.transform = "scale(1)";
          info.style.transform = "scale(1)";
          break;
        default:
          slider.style.transform = "scale(0)";
          slider_canvas.style.transform = "scale(0)";
          info.style.transform = "scale(0)";
          break;
      }
    }

    document.addEventListener("mousemove", onMouseMove);

    function createStar() {
      // Create star geometry (adjust radius for desired size)
      var starGeo = new THREE.SphereGeometry(1.2, 4, 4);

      // Create material with random color and emissive values
      var starMat = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(), // Random white-tinted color
      });

      // Create star object, position it randomly within the sky sphere
      var star = new THREE.Mesh(starGeo, starMat);
      star.position.set(
        Math.random() * 2000 - 1000, // Random x-coordinate
        Math.random() * 2000 - 1000, // Random y-coordinate
        Math.random() * 1000 - 500 // Random z-coordinate (depth)
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

    const pathToEnv = "./hdris/sunset.hdr";
    const pathToGlb = "./models/scene.glb";

    loader.load(pathToGlb, function (gltf) {
      scene.add(gltf.scene);
      mixer = new THREE.AnimationMixer(gltf.scene);
      clips = gltf.animations;
      const earthAnim = THREE.AnimationClip.findByName(clips, "Take 001_Earth");
      const earthAction = mixer.clipAction(earthAnim);
      earthAction.play();
      const cloudAnim = THREE.AnimationClip.findByName(
        clips,
        "Take 001_EarthClouds"
      );
      const cloudAction = mixer.clipAction(cloudAnim);
      cloudAction.play();
    });

    loader.load(pathToGlb, function (gltf) {
      gltf.scene.children.forEach((child) => {
        if (child.name == "Motor_Panel_0") {
          objects.solar_panel_1 = child;
        }
        if (child.name == "Motor_Panel_0005") {
          objects.solar_panel_2 = child;
        }
        if (child.name == "side_panel") {
          objects.side_panel = child;
        }
        if (child.name == "battery") {
          objects.battery = child;
        }
        if (child.name == "magnetometer_1") {
          objects.magnetometer = child;
        }
        if (child.name == "payload") {
          objects.payload = child;
        }
      });
    });

    rgbLoader.load(pathToEnv, function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      briefScene.background = texture;
      briefScene.environment = texture;

      render();
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      // const target = controls.target;
      // controls.update();
      // controlTrack.target.set( target.x, target.y, target.z );
      // controlTrack.update();
      fpvControls.update(0.5);
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      if (currentObject) {
        currentObject.rotation.z += 0.005;
        currentObject.rotation.y += 0.005;
        currentObject.rotation.x -= 0.005;
      }
      briefRenderer.render(briefScene, briefCamera);
      renderer.render(scene, camera);
    }

    if (WebGL.isWebGLAvailable()) {
      animate();
    } else {
      alert("WebGL is not available.");
    }
  });

  $: {
    if (canvasMounted && mixer && clips) {
      if (
        keys.w ||
        keys.a ||
        keys.s ||
        keys.d ||
        keys.rightClick ||
        keys.leftClick
      ) {
        if (camera.position.z < -8) {
          const openLeftDoor = THREE.AnimationClip.findByName(
            clips,
            "open_door_left"
          );
          const openRightDoor = THREE.AnimationClip.findByName(
            clips,
            "open_door_right"
          );
          const logoExit = THREE.AnimationClip.findByName(clips, "logo_exit");
          const openLeftDoorAction = mixer.clipAction(openLeftDoor);
          const openRightDoorAction = mixer.clipAction(openRightDoor);
          const logoExitAction = mixer.clipAction(logoExit);
          openLeftDoorAction.play();
          openRightDoorAction.play();
          logoExitAction.play();
          openLeftDoorAction.loop = THREE.LoopOnce;
          openRightDoorAction.loop = THREE.LoopOnce;
          logoExitAction.loop = THREE.LoopOnce;

          if (!isEventListenerSet) {
            mixer.addEventListener("finished", function (e) {
              const openedLeftDoor = THREE.AnimationClip.findByName(
                clips,
                "opened_door_left"
              );
              const openedRightDoor = THREE.AnimationClip.findByName(
                clips,
                "opened_door_right"
              );
              const exitedLogo = THREE.AnimationClip.findByName(
                clips,
                "exited_logo"
              );
              const openedLeftDoorAction = mixer.clipAction(openedLeftDoor);
              const openedRightDoorAction = mixer.clipAction(openedRightDoor);
              const exitedLogoAction = mixer.clipAction(exitedLogo);
              openedLeftDoorAction.play();
              openedRightDoorAction.play();
              exitedLogoAction.play();
            });
            isEventListenerSet = true;
          }
        }
      }
    }
  }
</script>

<div class="loading-wrapper">
  <div class="loader"></div>
</div>

<div class="canvas-wrapper">
  <canvas class="canvas" id="canvas"></canvas>
</div>

<div class="slider" id="slider">
  <canvas class="slider-canvas" id="slider-canvas"> </canvas>
</div>

<div class="info" id="info"></div>
