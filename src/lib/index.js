import * as THREE from "three";

const satelliteParts = {
  solar_panel_1: ["Motor_Panel_0004_1", "Motor_Panel_0004"],
  solar_panel_2: ["Motor_Panel_0005_1", "Motor_Panel_0005"],
  side_panel: ["side_panel"],
  bottom_mid_pannel: ["mid_panel-2"],
  battery: ["Mesh011", "Mesh011_1", "Mesh011_2", "Mesh011_3", "Mesh011_4", "Mesh001_5"],
  mid_mid_panel: ["thin_panel_2"],
  magnetometer: ["Magnetometer001", "Magnetometer002"],
  top_mid_panel: ["thin_panel_1"],
  payload: ["Payload001"]
}

function setScaleToOne(canvas) {
  canvas.style.transform = "scale(1)";
} 

function setScaleToZero(canvas) {
  canvas.style.transform = "scale(0)";
}


let objectPositionAndScale = {
  payload: {
    position: new THREE.Vector3(0, 0, -5),
    scale: new THREE.Vector3(0.025, 0.025, 0.025)
  },
  battery: {
    position: new THREE.Vector3(0, 0, -4),
    scale: new THREE.Vector3(0.020, 0.020, 0.020)
  },
  side_panel: {
    position: new THREE.Vector3(0, 0, -8),
    scale: new THREE.Vector3(0.020, 0.020, 0.020)
  },
  magnetometer: {
    position: new THREE.Vector3(0, 0, -2),
    scale: new THREE.Vector3(0.020, 0.020, 0.020)
  },
  solar_panel_1: {
    position: new THREE.Vector3(0, 0, -10),
    scale: new THREE.Vector3(0.020, 0.020, 0.020)
  },
}


export { satelliteParts, setScaleToOne, setScaleToZero}
