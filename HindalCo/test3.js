// Get the canvas element
const canvas = document.getElementById("renderCanvas");

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // Add a camera
    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 1.8, -10), scene);
    camera.attachControl(canvas, true);

    // Add a light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Add a ground plane
    const ground = BABYLON.MeshBuilder.CreateGround("plane1", {width: 20, height: 20}, scene);
    ground.position.y = 0;

    // Add a sloped plane (stairs)
    const stairs = BABYLON.MeshBuilder.CreatePlane("plane2", {width: 4, height: 8}, scene);
    stairs.rotation.x = Math.PI / 4; // 45 degree angle
    stairs.position = new BABYLON.Vector3(0, 2, 0);

    // WSAD control implementation
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
    }));

    scene.onBeforeRenderObservable.add(() => {
        let speed = 0.1;
        let moveDirection = new BABYLON.Vector3.Zero();

        if (inputMap["w"] || inputMap["W"]) {
            moveDirection.addInPlace(camera.getForwardRay().direction.scale(speed));
        }
        if (inputMap["s"] || inputMap["S"]) {
            moveDirection.addInPlace(camera.getForwardRay().direction.scale(-speed));
        }
        if (inputMap["a"] || inputMap["A"]) {
            moveDirection.addInPlace(camera.getRightRay().direction.scale(-speed));
        }
        if (inputMap["d"] || inputMap["D"]) {
            moveDirection.addInPlace(camera.getRightRay().direction.scale(speed));
        }

        // Basic collision detection
        let newPosition = camera.position.add(moveDirection);

        // Check if the new position is within the boundaries of the ground plane
        if (Math.abs(newPosition.x) < 10 && Math.abs(newPosition.z) < 10) {
            camera.position.addInPlace(moveDirection);
        }

        // Check for collision with the stairs
        if (newPosition.x >= -2 && newPosition.x <= 2 && newPosition.z >= -4 && newPosition.z <= 4) {
            if (newPosition.z >= 0) {
                newPosition.y = newPosition.z / Math.tan(Math.PI / 4); // Adjust y position to match the slope
            }
            camera.position = newPosition;
        }
    });

    return scene;
};

// Create the scene
const scene = createScene();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(() => {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", () => {
    engine.resize();
});
