
        var canvas = document.getElementById("renderCanvas"); // Get the canvas element
        var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

        var playerCollider;
        var SwitchToExterior;
        var SwitchTo360;
        var SwitchToPdf;
        var SwitchToVideo;
        
                
        BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
            if (document.getElementById("LoadingScreen")) {
                // Do not add a loading screen if there is already one
                document.getElementById("LoadingScreen").style.display = "initial";
                return;
            }
            // this._loadingDiv = document.createElement("div");
            // this._loadingDiv.id = "LoadingScreen";
            // this._loadingDiv.innerHTML = '<div class="loadingText"><h1 style="margin: auto; font-size:120px;">PLEASE WAIT...</h1><h7 style="font-size: 30px;">We are processing your request.</h7></div>';
            // var customLoadingScreenCss = document.createElement('style');
            // customLoadingScreenCss.type = 'text/css';
            // customLoadingScreenCss.innerHTML = `
            // #LoadingScreen{
            //     background-image: url('img/bg.html');
            //     color: white;
            //     text-align:center;
            //     height: 100%;
            // }
            // `;
            // document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
            // this._resizeLoadingUI();
            // window.addEventListener("resize", this._resizeLoadingUI);
            // document.body.appendChild(this._loadingDiv);
        };

        BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
            document.getElementById("LoadingScreen").style.display = "none";
        }

        const progressMap = {};
        const onProgress = (name, progress) => {
            progressMap[name] = +progress;
            // calc precentage
            const sum = Object.keys(progressMap).reduce((prev, curr) => {
                return prev + progressMap[curr];
            }, 0);
            console.log(`loading ${name}: ${progress}%`);
            document.getElementById("loadingText").innerHTML = "Loading : " + Math.round(sum / Object.keys(progressMap).length) + "%";
        }

        var CameraSetup = function(scene)
        {
            // Need a free camera for collisions
            camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(-14, 3, 0), scene);
            camera.rotation = new BABYLON.Vector3(0, 1.57079633, 0)
            camera.attachControl(canvas, true);

            //Then apply collisions and gravity to the active camera
            camera.checkCollisions = true;
            camera.applyGravity = true;
            camera.speed = 0.3;
            camera.angularSensibility = 8000;
            camera.minZ = 0.1;

            //Set the ellipsoid around the camera (e.g. your player's size)
            camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);

            camera.keysUp.push(87);
            camera.keysDown.push(83);
            camera.keysRight.push(68);
            camera.keysLeft.push(65);

            //Controls...Mouse
            //We start without being locked.
            // var isLocked = false;

            // On click event, request pointer lock
            // scene.onPointerDown = function (evt) {

            //     //true/false check if we're locked, faster than checking pointerlock on each single click.
            //     if (!isLocked) {
            //         canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            //         if (canvas.requestPointerLock) {
            //             canvas.requestPointerLock();
            //         }
            //     }

            // }; 


            playerCollider = BABYLON.MeshBuilder.CreateBox("collider", {size: 3}, scene);
            playerCollider.isVisible = false;
            playerCollider.parent = camera;

            playerCollider.actionManager = new BABYLON.ActionManager(scene);

        }
        
        var LightSetup = function(scene)
        {
            // // Lights
            // var light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);
            // var light1 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(2, -5, -2), scene);

            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

            // Default intensity is 1. Let's dim the light a small amount
            light.intensity = 1;
        }
        
        var CreateGround = function(scene)
        {
            //Ground
            var ground = BABYLON.Mesh.CreatePlane("ground", 200.0, scene);
            ground.material = new BABYLON.StandardMaterial("groundMat", scene);
            ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            ground.material.backFaceCulling = false;
            ground.position = new BABYLON.Vector3(5, 0, -15);
            ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
            ground.isVisible = false;            

            

            //finally, say which mesh will be collisionable
            ground.checkCollisions = true;
        }
        
        var ImportCustomMesh = function(scene)
        {

            BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "/New/",
                "Hallway.glb",
                scene,
                function (evt) {          
                    // onProgress
                    var loadedPercent = 0;
                    if (evt.lengthComputable) {
                        loadedPercent = (evt.loaded * 100 / evt.total).toFixed();
                    } else {
                        var dlCount = evt.loaded / (1024 * 1024);
                        loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
                    }
                    onProgress("dummy3", loadedPercent);
                    
                }
            ).then((mesh) => {
                xr = scene.createDefaultXRExperienceAsync({floorMeshes: [scene.getMeshByID(""), 
                scene.getMeshByID("")]});


                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "/models/",
                    "RECEPTIONIST.glb",
                    scene,
                    function (meshes) {
                        meshes[0].scaling = new BABYLON.Vector3(2, 2, 2);
                        meshes[0].position.x = 12.5;
                        meshes[0].rotation = new BABYLON.Vector3(0, 90, 0)
                    }
                );

                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "/models/",
                    "GROUP_3.glb",
                    scene,
                    function (meshes) {
                        meshes[0].scaling = new BABYLON.Vector3(1.75, 1.75, 1.75);
                        meshes[0].position.x = 0;
                        meshes[0].position.z = 5;
                        meshes[0].rotation = new BABYLON.Vector3(-1.5708, 0, 0)
                    }
                );

                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "/models/",
                    "GROUP_2.glb",
                    scene,
                    function (meshes) {
                        meshes[0].scaling = new BABYLON.Vector3(1.75, 1.75, 1.75);
                        meshes[0].position.x = 0;
                        meshes[0].position.z = -8;
                        meshes[0].rotation = new BABYLON.Vector3(-1.5708, 0, 0)
                    }
                );

                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "/models/",
                    "SIGNBOARD.glb",
                    scene,
                    function (meshes) {
                        meshes[0].scaling = new BABYLON.Vector3(1, 1, -1);
                        meshes[0].position.x = 3;
                        meshes[0].position.y = 0;
                        meshes[0].position.z = -12;
                        meshes[0].rotation = new BABYLON.Vector3(0, 1.5708, 0)
                        meshes[1].isVisible = false;
                    }
                );

                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "/models/",
                    "SIGNBOARD.glb",
                    scene,
                    function (meshes) {
                        meshes[0].scaling = new BABYLON.Vector3(1, 1, -1);
                        meshes[0].position.x = 3;
                        meshes[0].position.y = 0;
                        meshes[0].position.z = 12;
                        meshes[0].rotation = new BABYLON.Vector3(0, 1.5708, 0)
                        meshes[1].isVisible = false;
                    }
                );

                //adding Colliders
                scene.getMeshByID("Collider_1").checkCollisions = true;
                scene.getMeshByID("Collider_2").isVisible = false;
                scene.getMeshByID("Cube.002_Baked").checkCollisions = true;
                scene.getMeshByID("Cube.003_Baked").checkCollisions = true;
                scene.getMeshByID("Cube.001_Baked").checkCollisions = true;
                scene.getMeshByID("Cube.005_Baked").checkCollisions = true;
                scene.getMeshByID("Plane.002").isVisible = false;

                scene.getMeshByID("Main_door_Baked").actionManager = new BABYLON.ActionManager(scene);
                scene.getMeshByID("Door_low.002_Baked").actionManager = new BABYLON.ActionManager(scene);
                scene.getMeshByID("Door_low.002_Baked.001").actionManager = new BABYLON.ActionManager(scene);
                scene.getMeshByID("Door_low.002_Baked.002").actionManager = new BABYLON.ActionManager(scene);                    
                //video screen mesh
                screen = BABYLON.MeshBuilder.CreatePlane("ground", {width: 8, height: 4.5}, scene);
                screen.rotation = new BABYLON.Vector3(0, 1.57079633, 0);
                screen.position = new BABYLON.Vector3(19.25, 4, 0);

                //video
                var videoMaterial = new BABYLON.StandardMaterial("videoMaterial", scene);

                var videoTexture = new BABYLON.VideoTexture(
                    "video",
                    ["/videos/htu.mp4"],
                    scene,
                    false,
                    false,
                    BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
                    {
                        autoPlay:true,
                        loop: true,
                        autoUpdateTexture:true
                    }
                );

                videoMaterial.diffuseTexture = videoTexture;
                //videoMaterial.diffuseTexture.vScale = 1;
                screen.material = videoMaterial;
                
                scene.onPointerUp = () => {
                        videoTexture.video.play()
                        scene.onPointerUp = null
                    }

                let backToExterior = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Main_door_Baked")
                        }
                    },
                    (evt) => {
                        SwitchToExterior = true;
                    }
                );
                playerCollider.actionManager.registerAction(backToExterior);

                let backToExteriorXR = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnPickTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Main_door_Baked")
                        }
                    },
                    (evt) => {
                        SwitchToExterior = true;
                    }
                );
                scene.getMeshByID("Main_door_Baked").actionManager.registerAction(backToExteriorXR);

                let video360DoorAction = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked")
                        }
                    },
                    (evt) => {
                        SwitchTo360 = true;
                    }
                );
                playerCollider.actionManager.registerAction(video360DoorAction);

                let video360DoorActionXR = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnPickTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked")
                        }
                    },
                    (evt) => {
                        SwitchTo360 = true;
                    }
                );
                scene.getMeshByID("Door_low.002_Baked").actionManager.registerAction(video360DoorActionXR);

                let pdfDoorAction = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked.001")
                        }
                    },
                    (evt) => {
                        SwitchToPdf = true;
                    }
                );
                playerCollider.actionManager.registerAction(pdfDoorAction);

                let pdfDoorActionXR = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnPickTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked.001")
                        }
                    },
                    (evt) => {
                        SwitchToPdf = true;
                    }
                );
                scene.getMeshByID("Door_low.002_Baked.001").actionManager.registerAction(pdfDoorActionXR);

                let NormalVideoDoorAction = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked.002")
                        }
                    },
                    (evt) => {
                        SwitchToVideo = true;
                    }
                );
                playerCollider.actionManager.registerAction(NormalVideoDoorAction);

                let NormalVideoDoorActionXR = new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnPickTrigger, 
                        parameter: { 
                            mesh: scene.getMeshByID("Door_low.002_Baked.002")
                        }
                    },
                    (evt) => {
                        SwitchToVideo = true;
                    }
                );
                scene.getMeshByID("Door_low.002_Baked.002").actionManager.registerAction(NormalVideoDoorActionXR);

                engine.hideLoadingUI();
            });
              
        }

        var delayCreateScene = function () {
            
            engine.displayLoadingUI();
            var scene = new BABYLON.Scene(engine);

            const framesPerSecond = 60;
            const gravity = -9.81;
            scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);
            scene.collisionsEnabled = true;

            CameraSetup(scene);
            LightSetup(scene);
            CreateGround(scene);
            ImportCustomMesh(scene);
            
                
            return scene;
        };
        
        const scene = delayCreateScene(); //Call the createScene function

        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () 
        {
            scene.render();

            if(SwitchToExterior)
            {
                window.location.href = "index.html";
            }
            else if(SwitchTo360)
            {
                window.location.href = "Video360Player.html";
            }
            else if(SwitchToPdf)
            {
                window.location.href = "GUIPdf.html";
            }
            else if(SwitchToVideo)
            {
                window.location.href = "NormalVideo.html";
            }
            
        });

        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
                engine.resize();
        });
	
