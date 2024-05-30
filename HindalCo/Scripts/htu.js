// // Wait for the DOM to load
// window.addEventListener('DOMContentLoaded', function() {
//     // Get the canvas element
//     var canvas = document.getElementById('renderCanvas');
//     var meshNamesDiv = document.getElementById('meshNames');

//     // Initialize Babylon scene and engine
//     engine = new BABYLON.Engine(canvas, true);

//     // Create the scene
//     var createScene = function() {
//         var scene = new BABYLON.Scene(engine);

//         // Create a camera
//         var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
//         camera.attachControl(canvas, true);

//         // Restore camera position and rotation from localStorage or set to initial position
//         var savedCameraData = localStorage.getItem('cameraData');
//         if (savedCameraData) {
//             var parsedData = JSON.parse(savedCameraData);
//             camera.position = BABYLON.Vector3.FromArray(parsedData.position);
//             camera.rotation = BABYLON.Vector3.FromArray(parsedData.rotation);
//         } else {
//             camera.position = new BABYLON.Vector3(5, 0, 0); // Initial position
//         }

//         // Update camera data when position or rotation changes
//         camera.onViewMatrixChangedObservable.add(function() {
//             saveCameraData(camera);
//         });

//         // Create a light
//         var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

//         // Import the GLB model
//         BABYLON.SceneLoader.Append("/Assets/", "HtU_Easy.glb", scene, function (scene) {
//             console.log("Model loaded");
//             updateMeshNames(scene);
//             hideMesh(scene, "COLLISON");
//             setupMeshClickActions(scene);
//             addCollisionToMesh(scene, "COLLISON");
//         }, null, function(scene, message) {
//             console.error(message);
//         });

//         // Enable collisions and gravity on the camera
//         camera.checkCollisions = true;
//         camera.applyGravity = true;
//         camera.speed = 0.3; // Adjust camera movement speed as needed
//         camera.angularSensibility = 8000; // Adjust camera rotation sensitivity as needed
//         camera.minZ = 0.1;

//         // Save camera position and rotation before unloading the page
//         window.addEventListener('beforeunload', function() {
//             saveCameraData(camera);
//         });

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
//             console.log("Collision enabled for mesh: " + meshName);
//         } else {
//             console.error("Mesh " + meshName + " not found for collision.");
//         }
//     };

//     var saveCameraData = function(camera) {
//         // Save camera position and rotation in local storage
//         var cameraData = {
//             position: camera.position.asArray(),
//             rotation: camera.rotation.asArray()
//         };
//         localStorage.setItem('cameraData', JSON.stringify(cameraData));
//     };

//     var resetPlayerPosition = function(camera) {
//         // Set camera position to the initial position
//         camera.position = new BABYLON.Vector3(0, 3, 0);
//         camera.rotation = new BABYLON.Vector3(0, 2, 0); // Reset rotation if needed
//     };

//     var resetCameraData = function() {
//         // Remove stored camera data
//         localStorage.removeItem('cameraData');
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

//     // Get the reset button elements
//     var resetPositionButton = document.getElementById('resetPositionButton');
//     var resetDataButton = document.getElementById('resetDataButton');

//     // Add event listeners to the reset buttons
//     resetPositionButton.addEventListener('click', function() {
//         // Call the resetPlayerPosition function with the camera as argument
//         resetPlayerPosition(scene.getCameraByID('Camera'));
//     });

//     resetDataButton.addEventListener('click', function() {
//         // Call the resetCameraData function to remove stored camera data
//         resetCameraData();
//     });
// });


// Wait for the DOM to load

window.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    var canvas = document.getElementById('renderCanvas');
    var meshNamesDiv = document.getElementById('meshNames');

    // Initialize Babylon scene and engine
    engine = new BABYLON.Engine(canvas, true);

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

            // Add a sloping mesh that the user can climb
            var slope = BABYLON.MeshBuilder.CreateBox("slope", {height: 1, width: 5, depth: 10}, scene);
            slope.position = new BABYLON.Vector3(10, 0.5, 0);
            slope.rotation.x = BABYLON.Tools.ToRadians(30); // Adjust the angle of the slope
            slope.checkCollisions = true;

            // Add a crosshair in the center of the screen
            var crosshair = document.createElement('div');
            crosshair.style.position = 'absolute';
            crosshair.style.top = '50%';
            crosshair.style.left = '50%';
            crosshair.style.transform = 'translate(-50%, -50%)';
            crosshair.style.width = '10px';
            crosshair.style.height = '10px';
            crosshair.style.borderRadius = '50%';
            crosshair.style.background = 'white';
            crosshair.style.zIndex = '100';
            document.body.appendChild(crosshair);

            // Raycasting to detect "Plane.055" and change crosshair color
            scene.registerBeforeRender(function() {
                var ray = new BABYLON.Ray(camera.position, camera.getForwardRay().direction, 100);
                var hit = scene.pickWithRay(ray);
                if (hit.pickedMesh && hit.pickedMesh.name === "Plane.055") {
                    crosshair.style.background = 'red';
                } else {
                    crosshair.style.background = 'white';
                }
            });
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
            console.log("Collision enabled for mesh: " + meshName);
        } else {
            console.error("Mesh " + meshName + " not found for collision.");
        }
    };

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
