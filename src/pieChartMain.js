import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap  from 'gsap'
import * as dat from 'dat.gui';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'



// Debug

const debugObject = {}
const gltfLoader = new GLTFLoader()

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.height - 0.5)

    
    // console.log(cursor.x, cursor.y)
    // console.log(event.clientX, event.clientY)
})

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect  = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

const scene = new THREE.Scene()
  

function loadGLBModel(url, position, scale) {
    const loader = new GLTFLoader();

    loader.load(url, function (gltf) {
        const model = gltf.scene;
        console.log(model)
        // Position and scale the model
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale, scale, scale);

        // Traverse the model and apply materials without overriding
        model.traverse(function (child) {
            if (child.isMesh) {
                // Ensure the model's materials are correctly applied
                child.material = child.material || new THREE.MeshBasicMaterial();
            }

        });
        // Add the model to the scene
        scene.add(model);
        
        window.addEventListener('click', onMouseClick, false);
        function onMouseClick(event) {
            // Normalize mouse coordinates to range [-1, 1]
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
              
            // Update the raycaster with the mouse coordinates
            raycaster.setFromCamera(mouse, camera);
              
            // Check for intersections with the icons
            const intersects = raycaster.intersectObjects(plane.children);
          
            if (intersects.length > 0) {
              const clickedObject = intersects[0].object ;
              console.log(clickedObject)
          
              // Handle actions based on the clicked icon
              if (clickedObject === minimizePlane ) {
                console.log('Minimize clicked');
                // Implement minimize logic (e.g., hide or reduce size of plane)
                model.scale.set(0, 0, 0);
    
              } else if (clickedObject === maximizePlane ) {
                console.log('Maximize clicked');
                // Implement maximize logic (e.g., restore plane to original size)
                model.scale.set(5, 5, 5);
              } else if (clickedObject === closePlane ) {
                console.log('Close clicked');
                // Implement close logic (e.g., remove the plane from the scene)
                scene.remove(model);
              }
            }
        }        
        return model
    }, undefined, function (error) {
        console.error('An error happened while loading the GLB model:', error);
    });
}

// Load the GLB model for the pie chart segments
const piechart = loadGLBModel('Pie Chart .glb', new THREE.Vector3(0, 0, 0), 5);



function createCurve(controlPoints, color, scene) {
    // Create the curve using the provided control points
    const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(...controlPoints[0]),
        new THREE.Vector3(...controlPoints[1]),
        new THREE.Vector3(...controlPoints[2]),
        new THREE.Vector3(...controlPoints[3])
    );

    // Generate points along the curve
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create the material for the curve
    const material = new THREE.LineBasicMaterial({ color });

    // Create the final curve object and add it to the scene
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);

    // Add a point (sphere) at the start of the curve
    const startPointGeometry = new THREE.SphereGeometry(0.08, 16, 16); // Small sphere
    const startPointMaterial = new THREE.MeshBasicMaterial({ color: color });
    const startPoint = new THREE.Mesh(startPointGeometry, startPointMaterial);

    // Set the position of the sphere relative to the curve
    const startPosition = curve.getPoint(0); // Point at t = 0
    startPoint.position.copy(startPosition);

    // Make the start point a child of the curve object
    curveObject.add(startPoint);
    

    window.addEventListener('click', onMouseClick, false);
    function onMouseClick(event) {
        // Normalize mouse coordinates to range [-1, 1]
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
        // Update the raycaster with the mouse coordinates
        raycaster.setFromCamera(mouse, camera);
          
        // Check for intersections with the icons
        const intersects = raycaster.intersectObjects(plane.children);
      
        if (intersects.length > 0) {
          const clickedObject = intersects[0].object ;
          console.log(clickedObject)
      
          // Handle actions based on the clicked icon
          if (clickedObject === minimizePlane ) {
            console.log('Minimize clicked');
            // Implement minimize logic (e.g., hide or reduce size of plane)
            curveObject.scale.set(0, 0, 0);

          } else if (clickedObject === maximizePlane ) {
            console.log('Maximize clicked');
            // Implement maximize logic (e.g., restore plane to original size)
            curveObject.scale.set(1, 1, 1);
          } else if (clickedObject === closePlane) {
            console.log('Close clicked');
            // Implement close logic (e.g., remove the plane from the scene)
            scene.remove(curveObject);
          }
        }
      }

    return curveObject; // Return the created curve object for further use
}

// Example usage:

// Purple curve
createCurve(
    [
        [10, -4, 0],
        [10, -6, 0],
        [10, -6.5, -0.5],
        [17, -3.7, -0.1],
    ],
    '#7c05b4',
    scene
);

// Grey curve
createCurve(
    [
        [0, 3.0, 6.0],
        [10, 3.5,7.0],
        [10, 3.7, 7.0],
        [0, 4., 9.0],
    ],
    '#54c0b7',
    scene
);

// Orange curve
const orange = createCurve(
    [
        [12.5, -3.3, -0.4],
        [10, -4.5, 0],
        [10, -4.9, -1],
        [17, -5.5, -0],
    ],
    '#B16D1F',
    scene
);
orange.position.x = -8
orange.position.y = -0.5
orange.rotation.x = Math.PI * 0.75

// Red Curve
const red = createCurve(
    [
        [10, -4.0, 0],
        [5, -6, 0],
        [10, -6, -1],
        [15, -6.1, -0],
    ],
    '#A8192A',
    scene
);
red.position.z = 6.75
red.position.y = 0.6
red.position.x = 0
red.rotation.x = Math.PI * 0.75

const maroon = createCurve(
    [
        [5,-3.2, 6],
        [5,-5,6],
        [5,-5,7],
        [5, -4.7, 9],
    ],
    '#178ce5',
    scene
);

const outerCurveUpper = createCurve(
    [
        [0, 9.5, 12],
        [0, 9.5, 15],
        [0, 7.5, 15],
        [0, 1.5, 15],
    ],
    '#4AA19D',
    scene
);

const outerCurveLower =createCurve(
    [
        [0, -0.5, 12],
        [0, -0.5, 15],
        [0, 1.5, 15],
        [0, 1.5, 15],
    ],
    '#4AA19D',
    scene
);

createCurve(
    [
        [0, 1.5, 11],
        [0, 1.5, 11.75],
        [0, 1.0, 11.75],
        [0, -1.0, 11.75],
    ],
    '#4AA19D',
    scene
);

createCurve(
    [
        [0, -3.0, 11],
        [0, -3.0, 11.75],
        [0, -2.5, 11.75],
        [0, -1.0, 11.75],
    ],
    '#4AA19D',
    scene
);

function createRoundedRectangleWithText({
    width,
    height,
    radius,
    color,
    text,
    textColor,
    textSize,
    textPosition = { x: 0, y: 0, z: 0 },
    depth = 0.1,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
}) {
    // Step 1: Create the rounded rectangle shape
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + radius, height / 2);
    shape.lineTo(width / 2 - radius, height / 2); // Top edge
    shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius); // Top-right corner
    shape.lineTo(width / 2, -height / 2 + radius); // Right edge
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2); // Bottom-right corner
    shape.lineTo(-width / 2 + radius, -height / 2); // Bottom edge
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius); // Bottom-left corner
    shape.lineTo(-width / 2, height / 2 - radius); // Left edge
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2); // Top-left corner

    // Step 2: Extrude the shape to make it 3D
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: false,
    });
    const material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
    const roundedRectangle = new THREE.Mesh(geometry, material);

    // Set position and rotation of the rectangle
    roundedRectangle.position.set(position.x, position.y, position.z);
    roundedRectangle.rotation.set(rotation.x, rotation.y, rotation.z);

    // Step 3: Load a font and create text geometry
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: textSize,
            height: 0.01, // Thin text
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text
        textMesh.position.set(textPosition.x, textPosition.y, textPosition.z);
        roundedRectangle.add(textMesh); // Attach text to the rectangle
    });
    
    scene.add(roundedRectangle);

    window.addEventListener('click', onMouseClick, false);
    function onMouseClick(event) {
        // Normalize mouse coordinates to range [-1, 1]
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
        // Update the raycaster with the mouse coordinates
        raycaster.setFromCamera(mouse, camera);
          
        // Check for intersections with the icons
        const intersects = raycaster.intersectObjects(plane.children);
      
        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
      
          // Handle actions based on the clicked icon
          if (clickedObject === minimizePlane) {
            console.log('Minimize clicked');
            // Implement minimize logic (e.g., hide or reduce size of plane)
            roundedRectangle.scale.set(0, 0, 0);

          } else if (clickedObject === maximizePlane) {
            console.log('Maximize clicked');
            // Implement maximize logic (e.g., restore plane to original size)
            roundedRectangle.scale.set(1, 1, 1);
          } else if (clickedObject === closePlane) {
            console.log('Close clicked');
            // Implement close logic (e.g., remove the plane from the scene)
            scene.remove(roundedRectangle);
          }
        }
      }
    
    return roundedRectangle;
}
// Create "75% User" Rounded Rectangle
const roundedRect = createRoundedRectangleWithText({
    width: 1.8,
    height: 0.5,
    radius: 0.2,
    color: "#7c05b4", // Red
    text: "75% JZX 01",
    textColor: 0xffffff, // White
    textSize: 0.2,
    textPosition: { x: -0.9, y: 0.08, z: 0.5 }, // Position of text relative to the rectangle
    position: { x: 18, y: -3.39, z: -0.50 }, // Position of rectangle in the scene
    rotation: { x: Math.PI * 2, y: Math.PI * 0.40, z: 0 }, // Rotation of rectangle
});

const greyRoundedRect = createRoundedRectangleWithText({
    width: 6,
    height: 1.5,
    radius: 0.7,
    color: "#54c0b7", // Grey color
    text: "25% JZX 01",
    textColor: 0xffffff, // White
    textSize: 0.7,
    textPosition: { x: -2.4, y: -0.3, z: 0.5 },
    position: { x: -30, y:5.25, z: 11.5 },
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 },
});

const orangeRoundedRect = createRoundedRectangleWithText({
    width: 1.6,
    height: 0.5,
    radius: 0.2,
    color: "#B16D1F", // Grey color 17, -5.7, -0.5
    text: "40% JZX 01",
    textColor: 0xffffff, // White
    textSize: 0.18,
    textPosition: { x: -0.74, y: -0.1, z: 0.5 }, // Position of text relative to the rectangle
    position: { x: 16, y: 3.08, z: 0.45 },
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 },
});

const redRoundedRect = createRoundedRectangleWithText({
    width:1.4,
    height: 0.4,
    radius: 0.2,
    color: "#A8192A", // Grey color 17, -5.7, -0.5
    text: "10% JZX 01",
    textColor: 0xffffff, // White
    textSize: 0.16,
    textPosition: { x: -0.6, y: -0.15, z: 0.5 }, // Position of text relative to the rectangle
    position: { x: 18, y: 4.55, z: 2.9 },
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 },
});

const maroonRoundedRect = createRoundedRectangleWithText({
    width: 3.6,
    height: 0.8,
    radius: 0.3,
    color: "#176ce5", // maroon
    text: "10% JZX 01",
    textColor: 0xffffff, // White
    textSize: 0.4,
    textPosition: { x: -1.2, y: 0.0, z: 0.6 }, // Position of text relative to the rectangle
    position: { x: 5, y: -4.58, z: 9.5 }, // Position of rectangle in the scene
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 }, // Rotation of rectangle  5, -4.5, 10
});

// Create the base plane
const planeGeometry = new THREE.PlaneGeometry(25, 2.5);
const planeMaterial = new THREE.MeshBasicMaterial({ color: "#004d69", side: THREE.DoubleSide, transparent: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI * 0.4;
plane.position.y = 10.2;
scene.add(plane);

// Create a canvas for text
const textCanvas = document.createElement('canvas');
textCanvas.width = 1093; // Canvas resolution
textCanvas.height = 256;
const context = textCanvas.getContext('2d');

// Add a white rectangle as the background for the text
context.fillStyle = '#19dcdb'; // Background color
const margin = 1; // Margin around the text
const rectWidth = textCanvas.width - 2 * margin;
const rectHeight = textCanvas.height - 2 * margin;
context.fillRect(margin, margin, rectWidth, rectHeight); // Fill the rectangle

// Add text to the rectangle
context.font = 'bold 124px Sans'; // Font size and style
context.fillStyle = 'black'; // Text color
context.textAlign = 'left';
context.textBaseline = 'middle';
context.fillText('USER ACTIVITY', margin + 20, textCanvas.height / 2); // Add text with margin

// Create a texture from the canvas
const textTexture = new THREE.CanvasTexture(textCanvas);

// Create a material with the texture
const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });

// Create a new plane to hold the text
const textPlaneGeometry = new THREE.PlaneGeometry(8, 1.7); // Adjust size to fit text and leave margins
const textPlane = new THREE.Mesh(textPlaneGeometry, textMaterial);

// Position the text plane inside the main plane with margin
textPlane.position.set(-8.0, 0, 0.01); // Offset slightly in Z to avoid z-fighting
plane.add(textPlane); // Attach the text plane to the main plane

const iconBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#19dcdb", transparent: true, opacity: 1 });


// Load icon textures (replace with your actual icon image paths)
const iconLoader = new THREE.TextureLoader();
const minimizeIcon = iconLoader.load('./minimize-sign.png');
const maximizeIcon = iconLoader.load('./maximize.png');
const closeIcon = iconLoader.load('./close.png');
// Create materials for the icons
const minimizeMaterial = new THREE.MeshBasicMaterial({ map: minimizeIcon, transparent: true });
const maximizeMaterial = new THREE.MeshBasicMaterial({ map: maximizeIcon, transparent: true });
const closeMaterial = new THREE.MeshBasicMaterial({ map: closeIcon, transparent: true });

// Create planes for the icons inside the main plane
const iconSize = 1.2;
const iconBackgroundSize = 1.6; // Adjust size of icons

const minimizeBackground = new THREE.Mesh(new THREE.PlaneGeometry(iconBackgroundSize, iconBackgroundSize), iconBackgroundMaterial);
minimizeBackground.position.set(6.5, 0.02, 0.02); // Position behind minimize icon
plane.add(minimizeBackground);

const maximizeBackground = new THREE.Mesh(new THREE.PlaneGeometry(iconBackgroundSize, iconBackgroundSize), iconBackgroundMaterial);
maximizeBackground.position.set(8.75, 0.02, 0.02); // Position behind maximize icon
plane.add(maximizeBackground);

const closeBackground = new THREE.Mesh(new THREE.PlaneGeometry(iconBackgroundSize, iconBackgroundSize), iconBackgroundMaterial);
closeBackground.position.set(11, 0.02, 0.02); // Position behind close icon
plane.add(closeBackground);

const minimizePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), minimizeMaterial);
minimizePlane.position.set(6.5, 0.1, 0.04); // Adjust the position of the minimize icon inside the main plane
plane.add(minimizePlane);

const maximizePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), maximizeMaterial);
maximizePlane.position.set(8.75, 0.1, 0.04); // Position maximize icon
plane.add(maximizePlane);

const closePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), closeMaterial);
closePlane.position.set(11, 0.1, 0.04); // Position close icon
plane.add(closePlane);

// Raycaster for detecting clicks on the icons



  // Create a CurvePath for the reverse L-shape with a curve
  const curvePath = new THREE.CurvePath();

  // 1. Top horizontal line
//   const line1 = new THREE.LineCurve3(
//     new THREE.Vector3(17.5, 4.8, 0),  // Start point
//     new THREE.Vector3(20, 4.5, 0)   // End point
//   );

  // 2. Curved corner (Bezier Curve)
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(17.5, 4.8, 0),
    new THREE.Vector3(19, 4.8, -2),   // Start of curve (corner)
    new THREE.Vector3(21, 3.5, -0.2),   // Control point (determines curvature)
    new THREE.Vector3(21, 1, -0.3)    // End of curve
  );


    // 2. Curved corner (Bezier Curve)
    const curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3(21, 0.8, -0),
        new THREE.Vector3(19, 0.8, -2),   // Start of curve (corner)
        new THREE.Vector3(21, 3.5, -0.2),   // Control point (determines curvature)
        new THREE.Vector3(21, 3.4, -0.2)    // End of curve
      );
  // Add all segments to the CurvePath

//  curvePath.add(curve);

  // Generate points from the curve path
  const points = curvePath.getPoints(50); // 50 points for smoothness

  // Create geometry from the points
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Line material
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });

  // Create the line
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const bgGeometry = new THREE.PlaneGeometry(40, 30);
  const bgMaterial = new THREE.MeshBasicMaterial({
    color: "#26336B", // Set the background color (green in this case)
    side: THREE.DoubleSide,
    transparent: true, // Enable transparency
    opacity: 0.3, // Adjust opacity (1.0 is fully opaque, 0 is fully transparent)
  });
  const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
  bgPlane.rotation.y = Math.PI * 0.4;
  bgPlane.position.z = 0.0;
  bgPlane.position.y = 0.0;
  bgPlane.position.x = -8.;
  scene.add(bgPlane);
  
  
  window.addEventListener('click', onMouseClick, false);
  function onMouseClick(event) {
      // Normalize mouse coordinates to range [-1, 1]
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
      // Update the raycaster with the mouse coordinates
      raycaster.setFromCamera(mouse, camera);
        
      // Check for intersections with the icons
      const intersects = raycaster.intersectObjects(plane.children);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer'; // Change to pointer
      } else {
        document.body.style.cursor = 'default'; // Revert to default
      }
    
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object ;
        console.log(clickedObject)
    
        // Handle actions based on the clicked icon
        if (clickedObject === minimizePlane ) {
          console.log('Minimize clicked');
          // Implement minimize logic (e.g., hide or reduce size of plane)
          bgPlane.scale.set(1,1,1)
        } else if (clickedObject === maximizePlane ) {
          console.log('Maximize clicked');
          // Implement maximize logic (e.g., restore plane to original size)
          
          bgPlane.scale.set(1., 1., 1.)
        } else if (clickedObject === closePlane ) {
          console.log('Close clicked');
          // Implement close logic (e.g., remove the plane from the scene)
          scene.remove(bgPlane);
        }
      }
  }      

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(ambientLight, directionalLight);



const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
camera.position.set(30.93563109244617, 2.581085025998235, 9.102246280191748);
camera.lookAt(0, 0, 0);
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)

// To remove blurry pixel
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

const clock = new THREE.Clock()

const tick = ()  => {
    const elapsedTime = clock.getElapsedTime()

    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)


}

tick()