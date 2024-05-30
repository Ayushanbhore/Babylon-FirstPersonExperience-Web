// // Wait for the DOM to load
// window.addEventListener('DOMContentLoaded', function() {
//     // Get the canvas element
//     var canvas = document.getElementById('renderCanvas');
//     var meshNamesDiv = document.getElementById('meshNames');
//     var debugInfoDiv = document.getElementById('debugInfo');
//     var uiOverlay = document.getElementById('uiOverlay');
//     var crosshair = document.getElementById('crosshair');
//     var resetPositionButton = document.getElementById('resetPositionButton');
//     var resetDataButton = document.getElementById('resetDataButton');
//     var isUIVisible = false;

//     // Initialize Babylon scene and engine
//     var engine = new BABYLON.Engine(canvas, true);

//     // Create the scene
//     var createScene = function() {
//         var scene = new BABYLON.Scene(engine);

//         // Create a camera
//         var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 3, 50), scene);
//         camera.attachControl(canvas, true);

//         // Hide mouse pointer initially
//         canvas.style.cursor = 'none';

//         // Restore camera position and rotation from localStorage or set to initial position
//         var savedCameraData = localStorage.getItem('cameraData');
//         if (savedCameraData) {
//             var parsedData = JSON.parse(savedCameraData);
//             camera.position = BABYLON.Vector3.FromArray(parsedData.position);
//             camera.rotation = BABYLON.Vector3.FromArray(parsedData.rotation);
//         } else {
//             camera.position = new BABYLON.Vector3(0, 3, 50); // Initial position
//         }

//         // Update camera data when position or rotation changes
//         camera.onViewMatrixChangedObservable.add(function() {
//             saveCameraData(camera);
//         });

//         // Create a light
//         var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

//         // Create a directional light to simulate sunlight
//         var directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene);
//         directionalLight.position = new BABYLON.Vector3(0, 20, 0); // Adjust position as needed
//         directionalLight.intensity = 1.0; // Adjust intensity as needed

//         // Optionally, add shadows
//         var shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
//         shadowGenerator.useExponentialShadowMap = true; // Optional: You can use different shadow maps for better quality

//         // Import the GLB model
//         BABYLON.SceneLoader.Append("/Assets/", "HtU_Easy.glb", scene, function (scene) {
//             console.log("Model loaded");
//             updateMeshNames(scene);
//             hideMesh(scene, "COLLISON");
//             setupMeshClickActions(scene);
//             addCollisionToMesh(scene, "COLLISON");

//             // Add meshes to shadow generator
//             scene.meshes.forEach(function(mesh) {
//                 if (mesh.name !== "ground" && mesh.isVisible) {
//                     shadowGenerator.addShadowCaster(mesh);
//                 }
//             });

//             // Add collision to stairs mesh
//             addCollisionToMesh(scene, "Stairs.001_primitive0");
//         }, null, function(scene, message) {
//             console.error(message);
//         });

//         // Enable collisions and gravity on the camera
//         camera.checkCollisions = true;
//         camera.applyGravity = true;
//         camera.speed = 0.3; // Adjust camera movement speed as needed
//         camera.angularSensibility = 8000; // Adjust camera rotation sensitivity as needed
//         camera.minZ = 0.1;

//         // Set camera ellipsoid and ellipsoid offset for collision detection
//         camera.ellipsoid = new BABYLON.Vector3(1, 1, 1); // Size of the player's collision ellipsoid
//         camera.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0); // Offset of the ellipsoid from the player's position

//         // Set gravity to a higher value for better jumping and falling
//         scene.gravity = new BABYLON.Vector3(0, -0.8, 0);
//         scene.collisionsEnabled = true;

//         // Camera movement keys (WSAD)
//         camera.keysUp.push(87); // W
//         camera.keysDown.push(83); // S
//         camera.keysLeft.push(65); // A
//         camera.keysRight.push(68); // D

//         // Set step height to enable climbing stairs
//         camera.stepHeight = 0.5; // Adjust the step height as needed

//         // Handle jump and duck functionality
//         var isJumping = false;
//         var isDucking = false;
//         var jumpHeight = 2.5;
//         var jumpSpeed = 0.2;
//         var originalEllipsoidHeight = camera.ellipsoid.y;
//         var crouchHeight = originalEllipsoidHeight / 2;

//         window.addEventListener('keydown', function(event) {
//             if (event.key === ' ') {
//                 if (!isJumping) {
//                     isJumping = true;
//                     var jumpAnimation = new BABYLON.Animation("jump", "camera.position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
//                     var keys = [];
//                     keys.push({ frame: 0, value: camera.position.y });
//                     keys.push({ frame: 10, value: camera.position.y + jumpHeight });
//                     keys.push({ frame: 20, value: camera.position.y });
//                     jumpAnimation.setKeys(keys);
//                     camera.animations = [jumpAnimation];
//                     scene.beginAnimation(camera, 0, 20, false, 1, function() {
//                         isJumping = false;
//                     });
//                 }
//             }
//             if (event.key === 'c') {
//                 if (!isDucking) {
//                     isDucking = true;
//                     camera.ellipsoid.y = crouchHeight;
//                     camera.ellipsoidOffset.y = crouchHeight / 2;
//                 }
//             }
//         });

//         window.addEventListener('keyup', function(event) {
//             if (event.key === 'c') {
//                 isDucking = false;
//                 camera.ellipsoid.y = originalEllipsoidHeight;
//                 camera.ellipsoidOffset.y = originalEllipsoidHeight / 2;
//             }
//         });

//         // Save camera position and rotation before unloading the page
//         window.addEventListener('beforeunload', function() {
//             saveCameraData(camera);
//         });

//         // Handle Tab key to show/hide UI overlay
//         window.addEventListener('keydown', function(event) {
//             if (event.key === 'Tab') {
//                 event.preventDefault();
//                 isUIVisible = !isUIVisible;
//                 if (isUIVisible) {
//                     uiOverlay.style.display = 'block';
//                     crosshair.style.display = 'none';
//                     canvas.style.cursor = 'default'; // Show mouse pointer
//                     camera.detachControl(canvas);
//                 } else {
//                     uiOverlay.style.display = 'none';
//                     crosshair.style.display = 'block';
//                     canvas.style.cursor = 'none'; // Hide mouse pointer
//                     camera.attachControl(canvas, true);
//                 }
//             }
//         });

//         // Update the debug info continuously
//         scene.onBeforeRenderObservable.add(function() {
//             updateDebugInfo(camera);
//         });

//         // Enable pointer lock on canvas click
//         canvas.addEventListener("click", function () {
//             canvas.requestPointerLock();
//         });

//         // Pointer lock change event
//         var pointerLockChange = function () {
//             if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas) {
//                 // Mouse is locked
//                 canvas.addEventListener("mousemove", onMouseMove);
//             } else {
//                 // Mouse is unlocked
//                 canvas.removeEventListener("mousemove", onMouseMove);
//             }
//         };

//         // Add pointer lock change event listeners
//         document.addEventListener("pointerlockchange", pointerLockChange);
//         document.addEventListener("mozpointerlockchange", pointerLockChange);
//         document.addEventListener("webkitpointerlockchange", pointerLockChange);

//         // Function to handle mouse movement
//         var onMouseMove = function(event) {
//             if (scene.inputManager && scene.inputManager.isPointerLocked) {
//                 var mouseX = event.movementX || event.mozMovementX || event.webkitMovementX || event.msMovementX || 0;
//                 var mouseY = event.movementY || event.mozMovementY || event.webkitMovementY || event.msMovementY || 0;

//                 var rotationX = camera.rotation.x + mouseY / 800;
//                 var rotationY = camera.rotation.y + mouseX / 800;

//                 // Clamp vertical rotation to avoid flipping
//                 rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));

//                 camera.rotation.x = rotationX;
//                 camera.rotation.y = rotationY;
//             }
//         };

//         return scene;
//     };

//     var updateMeshNames = function(scene) {
//         var meshNames = "Mesh Names:<br>";
//         scene.meshes.forEach(function(mesh) {
//             meshNames += mesh.name + "<br>";
//         });
//         meshNamesDiv.innerHTML = meshNames;
//     };

//     var hideMesh = function(scene, meshName) {
//         var mesh = scene.getMeshByName(meshName);
//         if (mesh) {
//             mesh.isVisible = false;
//             console.log("Mesh " + meshName + " hidden");
//         } else {
//             console.log("Mesh " + meshName + " not found");
//         }
//     };

//     var setupMeshClickActions = function(scene) {
//         scene.meshes.forEach(function(mesh) {
//             mesh.actionManager = new BABYLON.ActionManager(scene);
//             mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(evt) {
//                 if (mesh.name === "TOP_Low.005") {
//                     window.location.href = "recep.html";
//                 } else if (mesh.name === "Plane.009") { //01_Smelter_ABOUT
//                     window.location.href = "smelter.html";
//                 } else {
//                     alert("Clicked mesh: " + mesh.name);
//                 }
//             }));
//         });
//     };

//     var addCollisionToMesh = function(scene, meshName) {
//         var mesh = scene.getMeshByName(meshName);
//         if (mesh) {
//             mesh.checkCollisions = true;
//             console.log("Collision enabled for mesh " + meshName);
//         } else {
//             console.log("Mesh " + meshName + " not found");
//         }
//     };

//     var resetPlayerPosition = function(camera) {
//         camera.position = new BABYLON.Vector3(0, 3, 50);
//         camera.rotation = new BABYLON.Vector3(0, 0, 0); // Reset rotation if needed
//     };

//     var resetCameraData = function() {
//         localStorage.removeItem('cameraData');
//         console.log("Camera data reset");
//     };

//     var saveCameraData = function(camera) {
//         var cameraData = {
//             position: camera.position.asArray(),
//             rotation: camera.rotation.asArray()
//         };
//         localStorage.setItem('cameraData', JSON.stringify(cameraData));
//     };

//     var fastTravel = function(camera, location) {
//         switch (location) {
//             case 'reception':
//                 camera.position = new BABYLON.Vector3(-83, 1.97, 0.01);
//                 camera.rotation = new BABYLON.Vector3(0, -  Math.PI / 2, 0); // Adjust rotation as needed
//                 break;
//             case 'admin':
//                 camera.position = new BABYLON.Vector3(-163, 1.97, -0.23);
//                 camera.rotation = new BABYLON.Vector3(-0.13, -Math.PI/2, 0); // Adjust rotation as needed
//                 break;
//             case 'entrance':
//                 camera.position = new BABYLON.Vector3(40.38, 1.97, 0.16);
//                 camera.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0); // Adjust rotation as needed
//                 break;
//             case 'smelter':
//                 camera.position = new BABYLON.Vector3(-173.83, 1.97, 49.78);
//                 camera.rotation = new BABYLON.Vector3(-0.23, 0, 0); // Adjust rotation as needed
//                 break;
//         }
//     };

//     var updateDebugInfo = function(camera) {
//         // Update the debug info with the current camera position and rotation
//         debugInfoDiv.innerHTML = "Camera Position:<br>" +
//                                  "X: " + camera.position.x.toFixed(2) + "<br>" +
//                                  "Y: " + camera.position.y.toFixed(2) + "<br>" +
//                                  "Z: " + camera.position.z.toFixed(2) + "<br>" +
//                                  "Camera Rotation:<br>" +
//                                  "X: " + camera.rotation.x.toFixed(2) + "<br>" +
//                                  "Y: " + camera.rotation.y.toFixed(2) + "<br>" +
//                                  "Z: " + camera.rotation.z.toFixed(2);
//     };

//     var scene = createScene();

//     // Render the scene
//     engine.runRenderLoop(function() {
//         scene.render();
//     });

//     // Resize the engine on canvas resize
//     window.addEventListener('resize', function() {
//         engine.resize();
//     });

//     // Add event listeners to the reset buttons
//     resetPositionButton.addEventListener('click', function() {
//         // Call the resetPlayerPosition function with the camera as argument
//         resetPlayerPosition(scene.getCameraByID('Camera'));
//     });

//     resetDataButton.addEventListener('click', function() {
//         // Call the resetCameraData function to remove stored camera data
//         resetCameraData();
//     });

//     // Add event listeners to the UI buttons
//     document.querySelectorAll('.uiButton').forEach(function(button) {
//         button.addEventListener('click', function() {
//             var location = button.getAttribute('data-location');
//             fastTravel(scene.getCameraByID('Camera'), location);
//             // Hide the UI and reattach the camera controls
//             isUIVisible = false;
//             uiOverlay.style.display = 'none';
//             crosshair.style.display = 'block';
//             canvas.style.cursor = 'none'; // Hide mouse pointer
//             scene.getCameraByID('Camera').attachControl(canvas, true);
//         });
//     });
// });


// Wait for the DOM to load
window.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    var canvas = document.getElementById('renderCanvas');
    var meshNamesDiv = document.getElementById('meshNames');
    var crosshair = document.getElementById('crosshair');

    // Initialize Babylon scene and engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create the scene
    var createScene = function() {
        var scene = new BABYLON.Scene(engine);

        // Create a camera
        var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        // Restore camera position and rotation from localStorage or set to initial position
        var savedCameraData = localStorage.getItem('cameraData');
        if (savedCameraData) {
            var parsedData = JSON.parse(savedCameraData);
            camera.position = BABYLON.Vector3.FromArray(parsedData.position);
            camera.rotation = BABYLON.Vector3.FromArray(parsedData.rotation);
        } else {
            camera.position = new BABYLON.Vector3(5, 0, 0); // Initial position
        }

        // Update camera data when position or rotation changes
        camera.onViewMatrixChangedObservable.add(function() {
            saveCameraData(camera);
        });

        // Create a light
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        // Import the GLB model
        BABYLON.SceneLoader.Append("/Assets/", "HtU_Easy.glb", scene, function (scene) {
            console.log("Model loaded");
            updateMeshNames(scene);
            hideMesh(scene, "COLLISON");
            setupMeshClickActions(scene);
            addCollisionToMesh(scene, "COLLISON");
            addSlopeMesh(scene);
        }, null, function(scene, message) {
            console.error(message);
        });

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

        // Add central crosshair and check for Plane.055
        scene.onBeforeRenderObservable.add(function() {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit && pickResult.pickedMesh.name === "Plane.055") {
                crosshair.style.backgroundColor = "red";
            } else {
                crosshair.style.backgroundColor = "white";
            }
        });

        return scene;
    };
    // scene.enablePhysivd()

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
            console.log("Collision enabled for mesh: " + meshName);
        } else {
            console.error("Mesh " + meshName + " not found for collision.");
        }
    };

    // var addSlopeMesh = function(scene) {
    //     var slope = BABYLON.MeshBuilder.CreateBox("slope", { width: 5, height: 1, depth: 10 }, scene);
    //     slope.position = new BABYLON.Vector3(0, 0.5, 0);
    //     slope.rotation.x = BABYLON.Tools.ToRadians(30);
    //     slope.checkCollisions = true;
    //     console.log("Slope mesh created and collision enabled");
    // };

    var addSlopeMesh = function(scene) {
        var slope = BABYLON.MeshBuilder.CreateBox("slope", { width: 5, height: 1, depth: 10 }, scene);
        slope.position = new BABYLON.Vector3(0, 0.5, 0);
        slope.rotation.x = BABYLON.Tools.ToRadians(30);
        slope.checkCollisions = true;
        slope.physicsImpostor = new BABYLON.PhysicsImpostor(slope, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
        console.log("Slope mesh created and collision enabled");
    }

    // Enable physics in the scene
    //scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    var saveCameraData = function(camera) {
        // Save camera position and rotation in local storage
        var cameraData = {
            position: camera.position.asArray(),
            rotation: camera.rotation.asArray()
        };
        localStorage.setItem('cameraData', JSON.stringify(cameraData));
    };

    var resetPlayerPosition = function(camera) {
        // Set camera position to the initial position
        camera.position = new BABYLON.Vector3(0, 3, 0);
        camera.rotation = new BABYLON.Vector3(0, 2, 0); // Reset rotation if needed
    };

    var resetCameraData = function() {
        // Remove stored camera data
        localStorage.removeItem('cameraData');
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

    // Get the reset button elements
    var resetPositionButton = document.getElementById('resetPositionButton');
    var resetDataButton = document.getElementById('resetDataButton');

    // Add event listeners to the reset buttons
    resetPositionButton.addEventListener('click', function() {
        // Call the resetPlayerPosition function with the camera as argument
        resetPlayerPosition(scene.getCameraByID('Camera'));
    });

    resetDataButton.addEventListener('click', function() {
        // Call the resetCameraData function to remove stored camera data
        resetCameraData();
    });
});
