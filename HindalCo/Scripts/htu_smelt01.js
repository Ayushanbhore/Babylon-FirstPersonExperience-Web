// Wait for the DOM to load
window.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    var canvas = document.getElementById('renderCanvas');
    var meshNamesDiv = document.getElementById('meshNames');
    var debugInfoDiv = document.getElementById('debugInfo');
    var uiOverlay = document.getElementById('uiOverlay');
    var crosshair = document.getElementById('crosshair');
    var resetPositionButton = document.getElementById('resetPositionButton');
    var resetDataButton = document.getElementById('resetDataButton');
    var isUIVisible = false;
    var isPointerLocked = false;

    // Initialize Babylon scene and engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create the scene
    var createScene = function() {
        var scene = new BABYLON.Scene(engine);

        // Create a camera
        var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 3, 50), scene);
        camera.attachControl(canvas, true);

        // Hide mouse pointer initially
        canvas.style.cursor = 'none';

        // Restore camera position and rotation from localStorage or set to initial position
        var savedCameraData = localStorage.getItem('cameraData');
        if (savedCameraData) {
            var parsedData = JSON.parse(savedCameraData);
            camera.position = BABYLON.Vector3.FromArray(parsedData.position);
            camera.rotation = BABYLON.Vector3.FromArray(parsedData.rotation);
        } else {
            camera.position = new BABYLON.Vector3(0, 3, 50); // Initial position
        }

        // Update camera data when position or rotation changes
        camera.onViewMatrixChangedObservable.add(function() {
            saveCameraData(camera);
        });

        // Create a light
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        // Import the GLB model
        BABYLON.SceneLoader.Append("/New/", "CR3-Room.glb", scene, function (scene) {
            console.log("Model loaded");
            updateMeshNames(scene);
            hideMesh(scene, "colision");
            setupMeshClickActions(scene);
            // addCollisionToMesh(scene, "Plane");
            addCollisionToMesh(scene, "colision");

            // addCollisionToMesh(scene, "TOP_Low_primitive1"); // Reception Mesh
            // addCollisionToMesh(scene, "Stairs.001_primitive0"); // Admin Stairs
            
            scene.meshes.forEach(function(mesh) {
                if (mesh.name !== "ground" && mesh.isVisible) {
                    shadowGenerator.addShadowCaster(mesh);
                }
            });
        
        
        
        }, null, function(scene, message) {
            console.error(message);
        });

        // Create a directional light
        var directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene);

        // Adjust the light's position (optional)
        directionalLight.position = new BABYLON.Vector3(0, 20, 0);

        // Set the light intensity (optional)
        directionalLight.intensity = 1.0;

        // Optionally, add shadows
        var shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
        shadowGenerator.useExponentialShadowMap = true; //
        


        // Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
                skybox.position.y = 10;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/Skybox/environment.env", scene);
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skybox.material = skyboxMaterial;

        // Enable collisions and gravity on the camera
        camera.checkCollisions = true;
        camera.applyGravity = true;
        camera.speed = 0.3; // Adjust camera movement speed as needed
        camera.angularSensibility = 8000; // Adjust camera rotation sensitivity as needed
        camera.minZ = 0.1;

        // Save camera position and rotation before unloading the page
        window.addEventListener('beforeunload', function() {
            saveCameraData(camera);
        });

        // Handle Tab key to show/hide UI overlay
       // Handle Tab key to show/hide UI overlay
        window.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                event.preventDefault();
                isUIVisible = !isUIVisible;
                if (isUIVisible) {
                    uiOverlay.style.display = 'block';
                    crosshair.style.display = 'none';
                    canvas.style.cursor = 'default'; // Show mouse pointer
                    scene.getCameraByID('Camera').detachControl(canvas);
                } else {
                    uiOverlay.style.display = 'none';
                    crosshair.style.display = 'block';
                    canvas.style.cursor = 'none'; // Hide mouse pointer
                    scene.getCameraByID('Camera').attachControl(canvas, true);
                }
            }
        });


        // Update the debug info continuously
        scene.onBeforeRenderObservable.add(function() {
            updateDebugInfo(camera);
        });

        // Enable pointer lock on canvas click
        canvas.addEventListener("click", function () {
            canvas.requestPointerLock();
        });

        // Pointer lock change event
        var pointerLockChange = function () {
            isPointerLocked = document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas;

            if (isPointerLocked) {
                canvas.style.cursor = 'none'; // Hide mouse pointer
            } else {
                canvas.style.cursor = 'default'; // Show mouse pointer
            }
        };

        // Add pointer lock change event listeners
        document.addEventListener("pointerlockchange", pointerLockChange);
        document.addEventListener("mozpointerlockchange", pointerLockChange);
        document.addEventListener("webkitpointerlockchange", pointerLockChange);

        // Function to handle mouse movement
        var onMouseMove = function(event) {
            if (scene.inputManager && isPointerLocked) {
                var mouseX = event.movementX || event.mozMovementX || event.webkitMovementX || event.msMovementX || 0;
                var mouseY = event.movementY || event.mozMovementY || event.webkitMovementY || event.msMovementY || 0;

                var rotationX = camera.rotation.x + mouseY / 800;
                var rotationY = camera.rotation.y + mouseX / 800;

                // Clamp vertical rotation to avoid flipping
                rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));

                camera.rotation.x = rotationX;
                camera.rotation.y = rotationY;
            }
        };

        // Add mouse move event listener
        document.addEventListener("mousemove", onMouseMove);

        return scene;
    };

    var updateMeshNames = function(scene) {
        var meshNames = "Mesh Names:<br>";
        scene.meshes.forEach(function(mesh) {
            meshNames += mesh.name + "<br>";
        });
        meshNamesDiv.innerHTML = meshNames;
    };

    var hideMesh = function(scene, meshName) {
        var mesh = scene.getMeshByName(meshName);
        if (mesh) {
            mesh.isVisible = false;
            console.log("Mesh " + meshName + " hidden");
        } else {
            console.log("Mesh " + meshName + " not found");
        }
    };

    var setupMeshClickActions = function(scene) {
        scene.meshes.forEach(function(mesh) {
            mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(evt) {
                if (mesh.name === "TOP_Low.005") {
                    window.location.href = "recep.html";
                } else if (mesh.name === "Plane.009") { //01_Smelter_ABOUT
                    window.location.href = "smelter.html";
                } else {
                    alert("Clicked mesh: " + mesh.name);
                }
            }));
        });
    };

    var addCollisionToMesh = function(scene, meshName) {
        var mesh = scene.getMeshByName(meshName);
        if (mesh) {
            mesh.checkCollisions = true;
            console.log("Collision enabled for mesh " + meshName);
        } else {
            console.log("Mesh " + meshName + " not found");
        }
    };

    var resetPlayerPosition = function(camera) { //For Small Room
        camera.position = new BABYLON.Vector3(3.46, 2.01, 6.43);
        camera.rotation = new BABYLON.Vector3(-0.08, -3.16, 0); 
    }

    var resetCameraData = function() {
        localStorage.removeItem('cameraData');
        console.log("Camera data reset");
    };

    var saveCameraData = function(camera) {
        var cameraData = {
            position: camera.position.asArray(),
            rotation: camera.rotation.asArray()
        };
        localStorage.setItem('cameraData', JSON.stringify(cameraData));
    };

    var fastTravel = function(camera, location) {
        switch (location) {
            case 'reception':
                camera.position = new BABYLON.Vector3(-83, 1.97, 0.01);
                camera.rotation = new BABYLON.Vector3(0, -  Math.PI / 2, 0); // Adjust rotation as needed
                break;
            case 'admin':
                camera.position = new BABYLON.Vector3(-163, 1.97, -0.23);
                camera.rotation = new BABYLON.Vector3(-0.13, -Math.PI/2, 0); // Adjust rotation as needed
                break;
            case 'entrance':
                camera.position = new BABYLON.Vector3(40.38, 1.97, 0.16);
                camera.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0); // Adjust rotation as needed
                break;
            case 'smelter':
                camera.position = new BABYLON.Vector3(-173.83, 1.97, 49.78);
                camera.rotation = new BABYLON.Vector3(-0.23, 0, 0); // Adjust rotation as needed
                break;
        }
    };

    var updateDebugInfo = function(camera) {
        // Update the debug info with the current camera position and rotation
        debugInfoDiv.innerHTML = "Camera Position:<br>" +
                                 "X: " + camera.position.x.toFixed(2) + "<br>" +
                                 "Y: " + camera.position.y.toFixed(2) + "<br>" +
                                 "Z: " + camera.position.z.toFixed(2) + "<br>" +
                                 "Camera Rotation:<br>" +
                                 "X: " + camera.rotation.x.toFixed(2) + "<br>" +
                                 "Y: " + camera.rotation.y.toFixed(2) + "<br>" +
                                 "Z: " + camera.rotation.z.toFixed(2);
    };

    var scene = createScene();

    // Render the scene
    engine.runRenderLoop(function() {
        scene.render();
    });

    // Resize the engine on canvas resize
    window.addEventListener('resize', function() {
        engine.resize();
    });

    // Add event listeners to the reset buttons
    resetPositionButton.addEventListener('click', function() {
        // Call the resetPlayerPosition function with the camera as argument
        resetPlayerPosition(scene.getCameraByID('Camera'));
    });

    resetDataButton.addEventListener('click', function() {
        // Call the resetCameraData function to remove stored camera data
        resetCameraData();
    });

    // Add event listeners to the UI buttons
    document.querySelectorAll('.uiButton').forEach(function(button) {
        button.addEventListener('click', function() {
            var location = button.getAttribute('data-location');
            fastTravel(scene.getCameraByID('Camera'), location);
            // Hide the UI and reattach the camera controls
            isUIVisible = false;
            uiOverlay.style.display = 'none';
            crosshair.style.display = 'block';
            canvas.style.cursor = 'none'; // Hide mouse pointer
            scene.getCameraByID('Camera').attachControl(canvas, true);
        });
    });
});




//Collected Data

// Reception Doors
/* 
1) TOP_Low.005
2) TOP_Low.005




*/



// var setupMeshClickActions = function(scene) {
//     scene.meshes.forEach(function(mesh) {
//         mesh.actionManager = new BABYLON.ActionManager(scene);
//         mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(evt) {
//             if (mesh.name === "04HTU_Low.007") { //Index
//                 window.location.href = "index.html";               
//             } else if (mesh.name === "04HTU_Low.006") { //01_Smelter_ABOUT
//                 window.location.href = "01_smelter_about.html";
//             } else if (mesh.name === "05HTU_Low.003") { //02_Smelter_ABOUT
//                 //window.location.href = "smelter.html";
//             } else if (mesh.name === "04HTU_Low.006") { //03_Smelter_ABOUT
//                 //window.location.href = "smelter.html";
//             } else if (mesh.name === "04HTU_Low.006") { //04_Smelter_ABOUT
//                 //window.location.href = "smelter.html";
//             } else if (mesh.name === "04HTU_Low.006") { //05_Smelter_ABOUT
//                 //window.location.href = "smelter.html";
//             } else if (mesh.name === "04HTU_Low.006") { //06_Smelter_ABOUT
//                 //window.location.href = "smelter.html";
//             } else {
//                 alert("Clicked mesh: " + mesh.name);
//             }
//         }));
//     });
// };

// // Import the GLB model
// BABYLON.SceneLoader.Append("/Assets/", "Halllway.glb", scene, function (scene) {
//     console.log("Model loaded");
//     updateMeshNames(scene);
//     setupMeshClickActions(scene);
//     hideMesh(scene, "COLLISON");
//     hideMesh(scene, "HTU High Resolution");
    
// }, null, function(scene, message) {
//     console.error(message);
// });