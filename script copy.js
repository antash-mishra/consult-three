import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap  from 'gsap'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';



// Debug
const gui = new GUI()
const debugObject = {}

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.height - 0.5)

    
    //console.log(cursor.x, cursor.y)
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

class CustomArcCurve extends THREE.Curve {
    constructor(startAngle = 0, endAngle = Math.PI * 2, radius = 10) {
        super();
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.radius = radius;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        // Ensure the curve stays on the XZ-plane (no tilt introduced)
        const angle = this.startAngle + t * (this.endAngle - this.startAngle);
        const tx = this.radius * Math.cos(angle);
        const ty = 0;  // Keep Y constant to eliminate tilt
        const tz = this.radius * Math.sin(angle);

        return optionalTarget.set(tx, ty, tz);
    }
}


// Create the path (arc) for each section of the pie chart with gaps
const outerRadius = 5;  // Outer radius of the donut
const innerRadius = 2;  // Inner radius (empty space in the middle)
const height = 1;  // Height of the tube
const radialSegments = 30;  // Number of segments along the arc
const gapSize = 0.07;  // Gap size between the segments (in radians)


// Create the material for purple (75%) and grey (25%) sections
const purpleMaterial = new THREE.MeshStandardMaterial({ color: '#7c05b4', side: THREE.DoubleSide});
const greyMaterial = new THREE.MeshStandardMaterial({ color: '#4d5157', side: THREE.DoubleSide});

// Create the paths for the purple (75%) and grey (25%) sections, with gaps
const purplePath = new CustomArcCurve(0, Math.PI * 1.5 - gapSize / 2, outerRadius);  // Adjusted arc for purple
const greyPath = new CustomArcCurve(Math.PI * 1.5 + gapSize / 2, Math.PI * 2 - gapSize, outerRadius);  // Adjusted arc for grey


// Create TubeGeometries for each segment
const purpleGeometry = new THREE.TubeGeometry(purplePath, radialSegments, height, 4, false);
const greyGeometry = new THREE.TubeGeometry(greyPath, radialSegments, height, 4, false);


// Create meshes from the geometries
const purpleMesh = new THREE.Mesh(purpleGeometry, purpleMaterial);
const greyMesh = new THREE.Mesh(greyGeometry, greyMaterial);

// Add edge lines to both segments
const purpleEdges = new THREE.EdgesGeometry(purpleGeometry);
const greyEdges = new THREE.EdgesGeometry(greyGeometry);

const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
const purpleEdgeLines = new THREE.LineSegments(purpleEdges, edgeMaterial);
const greyEdgeLines = new THREE.LineSegments(greyEdges, edgeMaterial);


// Rotate the meshes to align flat side to camera and correct tilt
purpleMesh.rotation.x =  Math.PI / 2;  // 90 degrees around X-axis
purpleMesh.rotation.z = Math.PI;     // Adjust tilt around Z-axis

greyMesh.rotation.x = Math.PI / 2;
greyMesh.rotation.z = Math.PI;

purpleEdgeLines.rotation.x = Math.PI / 2;
purpleEdgeLines.rotation.z = Math.PI;

greyEdgeLines.rotation.x = Math.PI / 2;
greyEdgeLines.rotation.z = Math.PI;

// Add meshes and edges to the scene
scene.add(purpleMesh);
scene.add(greyMesh);


// Function to add text in the center
function addCenterText(text, color, position) {
    const loader = new FontLoader();

    // Load a font
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 1, // Font size
            height: 0.1, // Font thickness
            curveSegments: 12,
            bevelEnabled: false,
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: color });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text at the center of the pie chart
        textMesh.position.set(position.x, position.y, position.z);
        // textMesh.rotation.x = Math.PI; // Align flat to face camera

        scene.add(textMesh);
    });
}

// Function to create labels with curved lines
function createLabel(text, startAngle, endAngle, radius, color) {
    const labelPosition = new THREE.Vector3();
    const midAngle = (startAngle + endAngle) / 2;
    const labelOffset = 1.2; // Adjust this to move the label away from the pie chart

    // Calculate label position along the curve
    labelPosition.set(
        radius * Math.cos(midAngle) * labelOffset,
        0, // Keep the label at the same Y level as the pie chart
        radius * Math.sin(midAngle) * labelOffset
    );

    // Add label text using TextGeometry
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.6, // Font size
            height: 0.1, // Font thickness
            curveSegments: 12,
            bevelEnabled: false,
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: color });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text at the calculated position
        textMesh.position.set(labelPosition.x, labelPosition.y, labelPosition.z);
        scene.add(textMesh);
    });

    // Add a curved line connecting the label to the segment
    const curve = new THREE.CurvePath();
    const start = new THREE.Vector3(radius * Math.cos(midAngle), 0, radius * Math.sin(midAngle));
    const end = labelPosition;

    // Create a simple line (you could adjust it to be a smooth curve if needed)
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Parameters for the pie chart
const radius = 5+2;

// Add labels for each segment
createLabel("75%", 0, Math.PI * 1.5, radius, 0x800080); // Label for the purple segment
createLabel("25%", Math.PI * 1.5, Math.PI * 2, radius, 0x555555); // Label for the grey segment


addCenterText("75%", 0xffffff, new THREE.Vector3(-1.5, 0.1, 0)); // Slight offset adjustment

  

// Add ambient light (soft global light)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft light
scene.add(ambientLight);

// Add directional light for better highlights and shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(3, 3, 5); // Position the light
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add a point light for glowing effect
const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
pointLight.position.set(0, 0, 3); // Position near the camera
scene.add(pointLight);


const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
camera.position.z = 5;
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
// // controls.enabled= false
controls.enableDamping = true

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

    controls.update()

    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)


}

tick()