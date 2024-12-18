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

    
    console.log(cursor.x, cursor.y)
    console.log(event.clientX, event.clientY)
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
            const clickedObject = intersects[0].object;
        
            // Handle actions based on the clicked icon
            if (clickedObject === minimizePlane || clickedObject === minimizeBackground) {
              console.log('Minimize clicked');
              // Implement minimize logic (e.g., hide or reduce size of plane)
              model.scale.set(0, 0, 0);

            } else if (clickedObject === maximizePlane || clickedObject === maximizeBackground) {
              console.log('Maximize clicked');
              // Implement maximize logic (e.g., restore plane to original size)
              model.scale.set(5, 5, 5);
            } else if (clickedObject === closePlane || clickedObject === closeBackground) {
              console.log('Close clicked'); 
              // Implement close logic (e.g., remove the plane from the scene)
              scene.remove(model);
            }
          }
        }
        
    }, undefined, function (error) {
        console.error('An error happened while loading the GLB model:', error);
    });
}


// Function to add text in the center
function addCenterText(text, color, position) {
    const loader = new FontLoader();

    // Load a font
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 1.5, // Font size
            height: 0.1, // Font thickness
            curveSegments: 12,
            bevelEnabled: false,
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: color });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text at the center of the pie chart
        textMesh.position.set(position.x, position.y, position.z);
        textMesh.rotation.x = Math.PI * 2; // Align flat to face camera
        textMesh.rotation.y = Math.PI * 0.25;

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
            console.log("Intersects: ", intersects[0].object)
        
            // Handle actions based on the clicked icon
            if (clickedObject === minimizePlane || clickedObject === minimizeBackground) {
              console.log('Minimize clicked');
              // Implement minimize logic (e.g., hide or reduce size of plane)
              textMesh.scale.set(0, 0, 0);

            } else if (clickedObject === maximizePlane || clickedObject === maximizeBackground) {
              console.log('Maximize clicked');
              // Implement maximize logic (e.g., restore plane to original size)
              textMesh.scale.set(1, 1, 1);
            } else if (clickedObject === closePlane || clickedObject === closeBackground) {
              console.log('Close clicked');
              // Implement close logic (e.g., remove the plane from the scene)
              scene.remove(textMesh);
            }
          }
        }

        scene.add(textMesh);
    });
}



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
          const clickedObject = intersects[0].object;
      
          // Handle actions based on the clicked icon
          if (clickedObject === minimizePlane || clickedObject === minimizeBackground) {
            console.log('Minimize clicked');
            // Implement minimize logic (e.g., hide or reduce size of plane)
            curveObject.scale.set(0, 0, 0);

          } else if (clickedObject === maximizePlane || clickedObject === maximizeBackground) {
            console.log('Maximize clicked');
            // Implement maximize logic (e.g., restore plane to original size)
            curveObject.scale.set(1, 1, 1);
          } else if (clickedObject === closePlane || clickedObject === closeBackground) {
            console.log('Close clicked');
            // Implement close logic (e.g., remove the plane from the scene)
            scene.remove(curveObject);
          }
        }
      }

    return curveObject; // Return the created curve object for further use
}

// Purple curve
createCurve(
    [
        [10, -5, 0],
        [10, -6, 0],
        [10, -6.5, -0.5],
        [18, -3, -0.5],
    ],
    '#7c05b4',
    scene
);

// Grey curve
createCurve(
    [
        [-15, 2.8, 2.5],
        [-15, 4.5, 2.5],
        [-15, 5.5, 5],
        [-17, 4.8, 8],
    ],
    '#54c0b7',
    scene
);

const outerCurveUpper = createCurve(
    [
        [0, 6.75, 11],
        [0, 6.75, 13],
        [0, 6.70, 13],
        [0, 0.5, 13],
    ],
    '#4AA19D',
    scene
);

const outerCurveLower =createCurve(
    [
        [0, -1., 11],
        [0, -1., 13],
        [0, -0.5, 13],
        [0, 1.5, 13],
    ],
    '#4AA19D',
    scene
);

const outerCurveUpperChild = createCurve(
    [
        [0, 1.5, 10],
        [0, 1.5, 10.75],
        [0, 1.0, 10.75],
        [0, -1.0, 10.75],
    ],
    '#4AA19D',
    scene
);

const outerCurveLowerChild = createCurve(
    [
        [0, -3.0, 10],
        [0, -3.0, 10.75],
        [0, -2.5, 10.75],
        [0, -1.0, 10.75],
    ],
    '#4AA19D',
    scene
);

const outerCurveUpperRight = createCurve(
    [
        [0, 7.6, -13.8],
        [0, 7.6, -16.8],
        [0, 7.55, -16.8],
        [0, 0.5, -16.8],
    ],
    '#4AA19D',
    scene
);

const outerCurveLowerRight =createCurve(
    [
        [0, -2.5, -14.4],
        [0, -2.8, -16.8],
        [0, -2.0, -16.8],
        [0, 1.4, -16.8],
    ],
    '#4AA19D',
    scene
);

createCurve(
    [
        [0, 1.5, -12.2],
        [0, 1.5, -13.8],
        [0, 1.0, -13.8],
        [0, -1.0, -13.8],
    ],
    '#4AA19D',
    scene
);

createCurve(
    [
        [0, -5.2, -12.2],
        [0, -5.5, -13.8],
        [0, -5.0, -13.8],
        [0, 0.0, -13.8],
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
            document.body.style.cursor = 'pointer'; // Change to pointer
          } else {
            document.body.style.cursor = 'default'; // Revert to default
          }

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;        
          // Handle actions based on the clicked icon
          if (clickedObject === minimizePlane || clickedObject === minimizeBackground) {
            console.log('Minimize clicked');
            // Implement minimize logic (e.g., hide or reduce size of plane)
            
            roundedRectangle.scale.set(0,0,0)

          } else if (clickedObject === maximizePlane || clickedObject === maximizeBackground) {
            console.log('Maximize clicked');

            roundedRectangle.scale.set(1,1,1)    
            
        } else if (clickedObject === closePlane || clickedObject === closeBackground) {
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
    width: 2,
    height: 0.6,
    radius: 0.3,
    color: "#7c05b4", // Red
    text: "75% User",
    textColor: 0xffffff, // White
    textSize: 0.28,
    textPosition: { x: -0.88, y: 0.08, z: 0.5 }, // Position of text relative to the rectangle
    position: { x: 18, y: -3.1, z: 0.5 }, // Position of rectangle in the scene
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 }, // Rotation of rectangle
});

const greyRoundedRect = createRoundedRectangleWithText({
    width: 6,
    height: 1.5,
    radius: 0.7,
    color: "#54c0b7", // Grey color
    text: "25% User",
    textColor: 0xffffff, // White
    textSize: 0.8,
    textPosition: { x: -2.2, y: -0.3, z: 0.5 },
    position: { x: -16, y: 4.8, z: 9.5 },
    rotation: { x: 0, y: Math.PI * 0.35, z: 0 },
});


// Create the base plane
const planeGeometry = new THREE.PlaneGeometry(22, 2);
const planeMaterial = new THREE.MeshBasicMaterial({ color: "#004d69", side: THREE.DoubleSide, transparent: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI * 0.4;
plane.position.y = 7.2;
scene.add(plane);

// Create a canvas for text
const textCanvas = document.createElement('canvas');
textCanvas.width = 1024; // Canvas resolution
textCanvas.height = 256;
const context = textCanvas.getContext('2d');

// Add a white rectangle as the background for the text
context.fillStyle = '#19dcdb'; // Background color
const margin = 1; // Margin around the text
const rectWidth = textCanvas.width - 2 * margin;
const rectHeight = textCanvas.height - 2 * margin;
context.fillRect(margin, margin, rectWidth, rectHeight); // Fill the rectangle

// Add text to the rectangle
context.font = 'bold 120px Sans'; // Font size and style
context.fillStyle = 'black'; // Text color
context.textAlign = 'left';
context.textBaseline = 'middle';
context.fillText('TOTAL USERS', margin + 20, textCanvas.height / 2); // Add text with margin

// Create a texture from the canvas
const textTexture = new THREE.CanvasTexture(textCanvas);

// Create a material with the texture
const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });

// Create a new plane to hold the text
const textPlaneGeometry = new THREE.PlaneGeometry(8, 1.5); // Adjust size to fit text and leave margins
const textPlane = new THREE.Mesh(textPlaneGeometry, textMaterial);

// Position the text plane inside the main plane with margin
textPlane.position.set(-6.5, 0, 0.01); // Offset slightly in Z to avoid z-fighting
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
minimizeBackground.position.set(5.75, 0.02, 0.02); // Position behind minimize icon
plane.add(minimizeBackground);

const maximizeBackground = new THREE.Mesh(new THREE.PlaneGeometry(iconBackgroundSize, iconBackgroundSize), iconBackgroundMaterial);
maximizeBackground.position.set(7.75, 0.02, 0.02); // Position behind maximize icon
plane.add(maximizeBackground);

const closeBackground = new THREE.Mesh(new THREE.PlaneGeometry(iconBackgroundSize, iconBackgroundSize), iconBackgroundMaterial);
closeBackground.position.set(9.75, 0.02, 0.02); // Position behind close icon
plane.add(closeBackground);

const minimizePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), minimizeMaterial);
minimizePlane.position.set(5.75, 0.1, 0.04); // Adjust the position of the minimize icon inside the main plane
plane.add(minimizePlane);

const maximizePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), maximizeMaterial);
maximizePlane.position.set(7.75, 0.1, 0.04); // Position maximize icon
plane.add(maximizePlane);

const closePlane = new THREE.Mesh(new THREE.PlaneGeometry(iconSize, iconSize), closeMaterial);
closePlane.position.set(9.75, 0.1, 0.04); // Position close icon
plane.add(closePlane);



// Load the GLB model for the pie chart segments
loadGLBModel('./1PieChart.glb', new THREE.Vector3(0, 0, 0), 5);

addCenterText("75%", 0xffffff, new THREE.Vector3(2, -2.25, 1.75)); // Slight offset adjustment

const bgGeometry = new THREE.PlaneGeometry(40, 25);
const bgMaterial = new THREE.MeshBasicMaterial({
  color: "#26336B", // Set the background color (green in this case)
  side: THREE.DoubleSide,
  transparent: true, // Enable transparency
  opacity: 0.3, // Adjust opacity (1.0 is fully opaque, 0 is fully transparent)
});
const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
bgPlane.rotation.y = Math.PI * 0.4;
bgPlane.position.z = 0.0;
bgPlane.position.y = -2.0;
bgPlane.position.x = -6.;
scene.add(bgPlane);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(ambientLight, directionalLight);



const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
camera.position.set(30.93563109244617, 2.581085025998235, 9.102246280191748);
camera.lookAt(0, 0, 0);
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
// // controls.enabled= false
controls.enableDamping = true
controls.enableZoom = false;  // Disable zoom
controls.enablePan = false;   // Disable panning
controls.enableRotate = false; // Disable rotation


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
    //controls.update()

    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)


}

tick()


