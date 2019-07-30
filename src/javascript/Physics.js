import CANNON, { Vec3 } from 'cannon'
import * as THREE from 'three'

export default class Physics
{
    constructor(_options)
    {
        this.debug = _options.debug
        this.time = _options.time

        // Set up
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('physics')
        }

        this.setWorld()
        this.setModels()
        this.setMaterials()
        this.setFloor()
        this.setCar()

        this.time.on('tick', () =>
        {
            this.world.step(1 / 60, this.time.delta, 3)
        })
    }

    setWorld()
    {
        this.world = new CANNON.World()
        this.world.gravity.set(0, - 1, 0)

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.world.gravity, 'y').step(0.001).min(- 5).max(5).name('gravity')
        }
    }

    setModels()
    {
        this.models = {}
        this.models.container = new THREE.Object3D()
        this.models.container.visible = true
        this.models.materials = {}
        this.models.materials.static = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
        this.models.materials.dynamic = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.models.container, 'visible')
        }
    }

    setMaterials()
    {
        this.materials = {}

        // All materials
        this.materials.items = {}
        this.materials.items.floor = new CANNON.Material('floorMaterial')
        this.materials.items.dummy = new CANNON.Material('dummyMaterial')
        this.materials.items.wheel = new CANNON.Material('wheelMaterial')

        // Contact between materials
        this.materials.contacts = {}

        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorDummy)

        this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(this.materials.items.dummy, this.materials.items.dummy, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.dummyDummy)

        this.materials.contacts.floorWheel = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.wheel, { friction: 0.5, restitution: 0, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorWheel)
    }

    setFloor()
    {
        this.floor = {}
        this.floor.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.materials.items.floor
        })

        this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)

        this.world.addBody(this.floor.body)
    }

    setCar()
    {
        this.car = {}

        // /**
        //  * Chassis
        //  */
        // this.car.chassis = {}
        // this.car.chassis.body = new CANNON.Body({ mass: 150 })
        // this.car.chassis.body.position.x = 3
        // this.car.chassis.body.position.y = 2
        // this.car.chassis.body.position.z = 3

        // this.car.chassis.shape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
        // this.car.chassis.body.addShape(this.car.chassis.shape)
        // // this.car.chassis.body.angularVelocity.set(0, 0, 0.5)

        // /**
        //  * Vehicle
        //  */
        // this.car.vehicle = new CANNON.RaycastVehicle({
        //     chassisBody: this.car.chassis.body,
        //     indexForwardAxis: 0,
        //     indexUpAxis: 1,
        //     indexRightAxis: 2
        // })

        // /**
        //  * Wheel
        //  */
        // this.car.wheels = {}
        // this.car.wheels.options = {
        //     radius: 1,
        //     directionLocal: new CANNON.Vec3(0, - 1, 0),
        //     suspensionStiffness: 30,
        //     suspensionRestLength: 0.3,
        //     frictionSlip: 5,
        //     dampingRelaxation: 1,
        //     dampingCompression: 1,
        //     maxSuspensionForce: 10000,
        //     rollInfluence:  0.01,
        //     axleLocal: new CANNON.Vec3(0, 0, 1),
        //     chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
        //     maxSuspensionTravel: 0.3,
        //     customSlidingRotationalSpeed: - 30,
        //     useCustomSlidingRotationalSpeed: true
        // }

        // this.car.wheels.options.chassisConnectionPointLocal.set(1.5, 0, 1.5)
        // this.car.vehicle.addWheel(this.car.wheels.options)

        // this.car.wheels.options.chassisConnectionPointLocal.set(1.5, 0, - 1.5)
        // this.car.vehicle.addWheel(this.car.wheels.options)

        // this.car.wheels.options.chassisConnectionPointLocal.set(- 1.5, 0, 1.5)
        // this.car.vehicle.addWheel(this.car.wheels.options)

        // this.car.wheels.options.chassisConnectionPointLocal.set(- 1.5, 0, - 1.5)
        // this.car.vehicle.addWheel(this.car.wheels.options)

        // this.car.vehicle.addToWorld(this.world)

        // this.car.wheels.bodies = []

        // for(const _wheelInfos of this.car.vehicle.wheelInfos)
        // {
        //     const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, _wheelInfos.radius / 2, 20)
        //     const body = new CANNON.Body({ mass: 1 })
        //     const quaternion = new CANNON.Quaternion()
        //     // quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2)

        //     body.type = CANNON.Body.KINEMATIC

        //     body.addShape(shape, new CANNON.Vec3(), quaternion)
        //     this.car.wheels.bodies.push(body)
        // }

        // this.world.addEventListener('postStep', () =>
        // {
        //     for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++)
        //     {
        //         this.car.vehicle.updateWheelTransform(i)
        //     }
        // })

        // Model
        this.car.model = {}
        this.car.model.container = new THREE.Object3D()
        this.models.container.add(this.car.model.container)

        this.car.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

        this.car.model.chassis = new THREE.Mesh(new THREE.BoxBufferGeometry(2 * 2, 1 * 2, 0.5 * 2), this.car.model.material)
        this.car.model.container.add(this.car.model.chassis)

        this.car.model.wheels = []

        const wheelGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)
        // wheelGeometry.rotateX(Math.PI * 0.5)

        for(let i = 0; i < 4; i++)
        {
            const wheel = new THREE.Mesh(wheelGeometry, this.car.model.material)
            this.car.model.container.add(wheel)
            this.car.model.wheels.push(wheel)
        }

        // this.time.on('tick', () =>
        // {
        //     this.car.model.chassis.position.x = this.car.chassis.body.position.x
        //     this.car.model.chassis.position.y = this.car.chassis.body.position.y
        //     this.car.model.chassis.position.z = this.car.chassis.body.position.z

        //     this.car.model.chassis.quaternion.x = this.car.chassis.body.quaternion.x
        //     this.car.model.chassis.quaternion.y = this.car.chassis.body.quaternion.y
        //     this.car.model.chassis.quaternion.z = this.car.chassis.body.quaternion.z
        //     this.car.model.chassis.quaternion.w = this.car.chassis.body.quaternion.w

        //     for(const _wheelKey in this.car.vehicle.wheelInfos)
        //     {
        //         const transform = this.car.vehicle.wheelInfos[_wheelKey].worldTransform
        //         const wheelMesh = this.car.model.wheels[_wheelKey]

        //         wheelMesh.position.x = transform.position.x
        //         wheelMesh.position.y = transform.position.y
        //         wheelMesh.position.z = transform.position.z

        //         wheelMesh.quaternion.x = transform.quaternion.x
        //         wheelMesh.quaternion.y = transform.quaternion.y
        //         wheelMesh.quaternion.z = transform.quaternion.z
        //         wheelMesh.quaternion.w = transform.quaternion.w
        //     }
        // })

        // // Keyboard
        // this.car.controls = {}

        // this.car.controls.maxSteerVal = 0.5
        // this.car.controls.maxForce = 1000
        // this.car.controls.brakeForce = 1000000

        // this.car.controls.up = false
        // this.car.controls.right = false
        // this.car.controls.down = false
        // this.car.controls.left = false

        // this.car.controls.events = {}
        // this.car.controls.events.down = (_event) =>
        // {
        //     this.car.vehicle.setBrake(0, 0)
        //     this.car.vehicle.setBrake(0, 1)
        //     this.car.vehicle.setBrake(0, 2)
        //     this.car.vehicle.setBrake(0, 3)

        //     if(_event.key === 'ArrowUp')
        //     {
        //         this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 0)
        //         this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 1)
        //         this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 2)
        //         this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 3)
        //         this.car.controls.up = true
        //     }
        //     else if(_event.key === 'ArrowRight')
        //     {
        //         this.car.vehicle.setSteeringValue(- this.car.controls.maxSteerVal, 0)
        //         this.car.vehicle.setSteeringValue(- this.car.controls.maxSteerVal, 1)
        //         this.car.controls.right = true
        //     }
        //     else if(_event.key === 'ArrowDown')
        //     {
        //         this.car.controls.down = true
        //     }
        //     else if(_event.key === 'ArrowLeft')
        //     {
        //         this.car.vehicle.setSteeringValue(this.car.controls.maxSteerVal, 0)
        //         this.car.vehicle.setSteeringValue(this.car.controls.maxSteerVal, 1)
        //         this.car.controls.left = true
        //     }
        // }

        // this.car.controls.events.up = (_event) =>
        // {
        //     this.car.vehicle.setBrake(0, 0)
        //     this.car.vehicle.setBrake(0, 1)
        //     this.car.vehicle.setBrake(0, 2)
        //     this.car.vehicle.setBrake(0, 3)

        //     if(_event.key === 'ArrowUp')
        //     {
        //         this.car.vehicle.applyEngineForce(0, 0)
        //         this.car.vehicle.applyEngineForce(0, 1)
        //         this.car.vehicle.applyEngineForce(0, 2)
        //         this.car.vehicle.applyEngineForce(0, 3)
        //         this.car.controls.up = false
        //     }
        //     else if(_event.key === 'ArrowRight')
        //     {
        //         this.car.vehicle.setSteeringValue(0, 0)
        //         this.car.vehicle.setSteeringValue(0, 1)
        //         this.car.controls.right = false
        //     }
        //     else if(_event.key === 'ArrowDown')
        //     {
        //         this.car.controls.down = false
        //     }
        //     else if(_event.key === 'ArrowLeft')
        //     {
        //         this.car.vehicle.setSteeringValue(0, 0)
        //         this.car.vehicle.setSteeringValue(0, 1)
        //         this.car.controls.left = false
        //     }
        // }

        // document.addEventListener('keydown', this.car.controls.events.down)
        // document.addEventListener('keyup', this.car.controls.events.up)



        // /**
        //  * Rigid Vehicle
        //  */
        // var mass = 1;

        // this.world.gravity.set(0, -20, 0);
        // this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        // this.world.defaultContactMaterial.friction = 0.2;

        // var groundMaterial = new CANNON.Material("groundMaterial");
        // var wheelMaterial = new CANNON.Material("wheelMaterial");
        // var wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        //     friction: 0.3,
        //     restitution: 0,
        //     contactEquationStiffness: 1000
        // });

        // // We must add the contact materials to the this.worl
        // this.world.addContactMaterial(wheelGroundContactMaterial);

        // var chassisShape;
        // var centerOfMassAdjust = new CANNON.Vec3(0, -1, 0);
        // chassisShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 2));
        // var chassisBody = new CANNON.Body({ mass: 1 });
        // chassisBody.addShape(chassisShape, centerOfMassAdjust);
        // chassisBody.position.set(0, 3, 0);

        // // Create the vehicle
        // var vehicle = new CANNON.RigidVehicle({
        //     chassisBody: chassisBody
        // });

        // var axisWidth = 7;
        // var wheelShape = new CANNON.Sphere(1.5);
        // var down = new CANNON.Vec3(0, -1, 0);

        // var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
        // wheelBody.addShape(wheelShape);
        // vehicle.addWheel({
        //     body: wheelBody,
        //     position: new CANNON.Vec3(5, 0, axisWidth/2).vadd(centerOfMassAdjust),
        //     axis: new CANNON.Vec3(0, 0, 1),
        //     direction: down
        // });

        // var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
        // wheelBody.addShape(wheelShape);
        // vehicle.addWheel({
        //     body: wheelBody,
        //     position: new CANNON.Vec3(5, 0, -axisWidth/2).vadd(centerOfMassAdjust),
        //     axis: new CANNON.Vec3(0, 0, -1),
        //     direction: down
        // });

        // var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
        // wheelBody.addShape(wheelShape);
        // vehicle.addWheel({
        //     body: wheelBody,
        //     position: new CANNON.Vec3(-5, 0, axisWidth/2).vadd(centerOfMassAdjust),
        //     axis: new CANNON.Vec3(0, 0, 1),
        //     direction: down
        // });

        // var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
        // wheelBody.addShape(wheelShape);
        // vehicle.addWheel({
        //     body: wheelBody,
        //     position: new CANNON.Vec3(-5, 0, -axisWidth/2).vadd(centerOfMassAdjust),
        //     axis: new CANNON.Vec3(0, 0, -1),
        //     direction: down
        // });

        // // Some damping to not spin wheels too fast
        // for(var i=0; i<vehicle.wheelBodies.length; i++){
        //     vehicle.wheelBodies[i].angularDamping = 0.4;
        // }

        // vehicle.addToWorld(this.world);

        // // // Ground
        // // var groundShape = new CANNON.Plane();
        // // var ground = new CANNON.Body({ mass: 0, material: groundMaterial });
        // // ground.addShape(groundShape);
        // // this.world.add(ground);

        // this.time.on('tick', () =>
        // {
        //     this.car.model.chassis.position.copy(chassisBody.position)
        //     this.car.model.chassis.quaternion.copy(chassisBody.quaternion)

        //     for(const _wheelKey in vehicle.wheelBodies)
        //     {
        //         const wheelBody = vehicle.wheelBodies[_wheelKey]
        //         const wheelMesh = this.car.model.wheels[_wheelKey]

        //         wheelMesh.position.copy(wheelBody.position)
        //         wheelMesh.quaternion.copy(wheelBody.quaternion)
        //     }
        // })

        // document.onkeydown = handler;
        // document.onkeyup = handler;

        // var maxSteerVal = Math.PI / 8.2;
        // var maxSpeed = 10;
        // var maxForce = 100;
        // function handler(event){
        //     var up = (event.type == 'keyup');

        //     if(!up && event.type !== 'keydown')
        //         return;

        //     switch(event.keyCode){

        //     case 38: // forward
        //         vehicle.setWheelForce(up ? 0 : maxForce, 2);
        //         vehicle.setWheelForce(up ? 0 : -maxForce, 3);
        //         break;

        //     case 40: // backward
        //         vehicle.setWheelForce(up ? 0 : -maxForce/2, 2);
        //         vehicle.setWheelForce(up ? 0 : maxForce/2, 3);
        //         break;

        //     case 39: // right
        //         vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
        //         vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
        //         break;

        //     case 37: // left
        //         vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
        //         vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
        //         break;

        //     }
        // }


        /**
         * Raycast Vehicle
         */
        var mass = 150;
        var vehicle;

        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.gravity.set(0, 0, -10);
        this.world.defaultContactMaterial.friction = 0;

        var groundMaterial = new CANNON.Material("groundMaterial");
        var wheelMaterial = new CANNON.Material("wheelMaterial");
        var wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000
        });

        // We must add the contact materials to the this.world
        this.world.addContactMaterial(wheelGroundContactMaterial);

        var chassisShape;
        chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.5));
        var chassisBody = new CANNON.Body({ mass: mass });
        chassisBody.addShape(chassisShape);
        chassisBody.position.set(0, 0, 4);
        chassisBody.angularVelocity.set(0, 0, 0.5);

        var options = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, 0, -1),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence:  0.01,
            axleLocal: new CANNON.Vec3(0, 1, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Create the vehicle
        vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
        });

        options.chassisConnectionPointLocal.set(1, 1, 0);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(1, -1, 0);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, 1, 0);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, -1, 0);
        vehicle.addWheel(options);

        vehicle.addToWorld(this.world);

        var wheelBodies = [];
        for(var i=0; i<vehicle.wheelInfos.length; i++){
            var wheel = vehicle.wheelInfos[i];
            var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
            var wheelBody = new CANNON.Body({ mass: 1 });
            var q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
            wheelBodies.push(wheelBody);
        }

        // Update wheels
        this.world.addEventListener('postStep', function(){
            for (var i = 0; i < vehicle.wheelInfos.length; i++) {
                vehicle.updateWheelTransform(i);
                var t = vehicle.wheelInfos[i].worldTransform;
                wheelBodies[i].position.copy(t.position);
                wheelBodies[i].quaternion.copy(t.quaternion);
            }
        });

        // Ground
        var groundShape = new CANNON.Plane();
        var ground = new CANNON.Body({ mass: 0, material: groundMaterial });
        ground.addShape(groundShape);
        this.world.add(ground);

        this.time.on('tick', () =>
        {
            this.car.model.chassis.position.copy(chassisBody.position)
            this.car.model.chassis.quaternion.copy(chassisBody.quaternion)

            for(const _wheelKey in wheelBodies)
            {
                const wheelBody = wheelBodies[_wheelKey]
                const wheelMesh = this.car.model.wheels[_wheelKey]

                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
        })

        document.onkeydown = handler;
        document.onkeyup = handler;

        var maxSteerVal = 0.5;
        var maxForce = 1000;
        var brakeForce = 1000000;
        function handler(event){
            var up = (event.type == 'keyup');

            if(!up && event.type !== 'keydown'){
                return;
            }

            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);

            switch(event.keyCode){

            case 38: // forward
                vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                break;

            case 40: // backward
                vehicle.applyEngineForce(up ? 0 : maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : maxForce, 3);
                break;

            case 66: // b
                vehicle.setBrake(brakeForce, 0);
                vehicle.setBrake(brakeForce, 1);
                vehicle.setBrake(brakeForce, 2);
                vehicle.setBrake(brakeForce, 3);
                break;

            case 39: // right
                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
                break;

            case 37: // left
                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
                break;

            }
        }
    }

    addObjectFromThree(_options)
    {
        // Set up
        const collision = {}

        collision.model = {}
        collision.model.meshes = []
        collision.model.container = new THREE.Object3D()
        this.models.container.add(collision.model.container)

        collision.children = []

        // Material
        const bodyMaterial = this.materials.items.dummy

        // Body
        collision.body = new CANNON.Body({
            position: new Vec3(_options.offset.x, _options.offset.y, _options.offset.z),
            mass: _options.mass,
            material: bodyMaterial
        })
        this.world.addBody(collision.body)

        // Center
        collision.center = new Vec3(0, 0, 0)

        // Shapes
        const shapes = []

        // Each mesh
        for(let i = 0; i < _options.meshes.length; i++)
        {
            const mesh = _options.meshes[i]

            // Define shape
            let shape = null

            if(mesh.name.match(/^cube[0-9]{0,3}?|box[0-9]{0,3}?$/i))
            {
                shape = 'box'
            }
            else if(mesh.name.match(/^cylinder[0-9]{0,3}?$/i))
            {
                shape = 'cylinder'
            }
            else if(mesh.name.match(/^sphere[0-9]{0,3}?$/i))
            {
                shape = 'sphere'
            }
            else if(mesh.name.match(/^center[0-9]{0,3}?$/i))
            {
                shape = 'center'
            }

            // Shape is the center
            if(shape === 'center')
            {
                collision.center.set(mesh.position.x, mesh.position.y, mesh.position.z)
            }

            // Other shape
            else if(shape)
            {
                // Geometry
                let shapeGeometry = null

                if(shape === 'cylinder')
                {
                    shapeGeometry = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.y, 8)
                }
                else if(shape === 'box')
                {
                    const halfExtents = new CANNON.Vec3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5)
                    shapeGeometry = new CANNON.Box(halfExtents)
                }
                else if(shape === 'sphere')
                {
                    shapeGeometry = new CANNON.Sphere(mesh.scale.x)
                }

                // Position
                const shapePosition = new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)

                // Quaternion
                const shapeQuaternion = new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
                if(shape === 'cylinder')
                {
                    // Rotate cylinder
                    shapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)
                }

                // Save
                shapes.push({ shapeGeometry, shapePosition, shapeQuaternion })

                // Create model object
                let modelGeometry = null
                if(shape === 'cylinder')
                {
                    modelGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)
                }
                else if(shape === 'box')
                {
                    modelGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
                }
                else if(shape === 'sphere')
                {
                    modelGeometry = new THREE.SphereBufferGeometry(1, 8, 8)
                }

                const modelMesh = new THREE.Mesh(modelGeometry, this.models.materials[_options.mass === 0 ? 'static' : 'dynamic'])
                modelMesh.position.copy(mesh.position)
                modelMesh.scale.copy(mesh.scale)
                modelMesh.quaternion.copy(mesh.quaternion)

                collision.model.meshes.push(modelMesh)
            }
        }

        // Update meshes to match center
        for(const _mesh of collision.model.meshes)
        {
            _mesh.position.x -= collision.center.x
            _mesh.position.y -= collision.center.y
            _mesh.position.z -= collision.center.z

            collision.model.container.add(_mesh)
        }

        // Update shapes to match center
        for(const _shape of shapes)
        {
            // Create physic object
            _shape.shapePosition.x -= collision.center.x
            _shape.shapePosition.y -= collision.center.y
            _shape.shapePosition.z -= collision.center.z

            collision.body.addShape(_shape.shapeGeometry, _shape.shapePosition, _shape.shapeQuaternion)
        }

        // Update body to match center
        collision.body.position.x += collision.center.x
        collision.body.position.y += collision.center.y
        collision.body.position.z += collision.center.z

        // Time tick update
        this.time.on('tick', () =>
        {
            collision.model.container.position.set(collision.body.position.x, collision.body.position.y, collision.body.position.z)
            collision.model.container.quaternion.set(collision.body.quaternion.x, collision.body.quaternion.y, collision.body.quaternion.z, collision.body.quaternion.w)
        })

        return collision
    }
}
