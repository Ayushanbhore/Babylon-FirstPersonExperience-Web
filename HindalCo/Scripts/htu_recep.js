// Wait for the DOM to load
window.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    var canvas = document.getElementById('renderCanvas');
    var meshNamesDiv = document.getElementById('meshNames');

    // Initialize Babylon scene and engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create the scene
    var createScene = function() {
        var scene = new BABYLON.Scene(engine);

        // Create a camera
        var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 1, -5), scene);
        camera.attachControl(canvas, true);

        // Create a light
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        // Import the GLB model
        BABYLON.SceneLoader.Append("/Assets/", "Reception.glb", scene, function (scene) {
            console.log("Model loaded");
            updateMeshNames(scene);
            setupMeshClickActions(scene);
            hideMesh(scene, "COLLISON");
            hideMesh(scene, "HTU High Resolution");
            
        }, null, function(scene, message) {
            console.error(message);
        });

        // Add keyboard controls
        var inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(function() {
            if (inputMap["w"]) {
                camera.position.addInPlace(camera.getDirection(BABYLON.Axis.Z).scale(0.1));
            }
            if (inputMap["s"]) {
                camera.position.addInPlace(camera.getDirection(BABYLON.Axis.Z).scale(-0.1));
            }
            if (inputMap["a"]) {
                camera.position.addInPlace(camera.getDirection(BABYLON.Axis.X).scale(-0.1));
            }
            if (inputMap["d"]) {
                camera.position.addInPlace(camera.getDirection(BABYLON.Axis.X).scale(0.1));
            }
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
                if (mesh.name === "model.004") {
                    window.location.href = "index.html";
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

    var scene = createScene();

    // Render the scene
    engine.runRenderLoop(function() {
        scene.render();
    });

    // Resize the engine on canvas resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
});


//Collected Data

// Reception Doors
/* 
1) TOP_Low.005
2) TOP_Low.005




*/
