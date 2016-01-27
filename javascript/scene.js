// Generated by CoffeeScript 1.7.1
(function() {
  var geometry, mainLight, lightVisualizer, material, render, renderer;
  var leapBall, billboard;

  var dropables = [];
  var pickupables = [];
  var canPickup = true;
  var ballCollision = false;
  var cubeCollision = false;

  var leapBallHome = new THREE.Vector3(-4, .125, -4);


  var colors = {
    white: 0xffffff,
    magenta: 0xff0bf6,
    blue: 0x17e1ff,
    yellow: 0xffec17,
    red: 0xff0042,
    green: 0x2cff16,
    purple: 0x7200ff
  };

  window.scope = {
    x: 0,
    y: 0,
    color: 0x0000ff,
    mainLightposition: new THREE.Vector3(1, 10, 1),
    cubePosition: new THREE.Vector3(-3, .5, 3),
    pickupInit: false,
    grabActive: false,
    leapPosition: new THREE.Vector3(-4, .125, -4)
  };

  window.scene = new THREE.Scene();

  window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  window.camera.position.set(5, 5, 10);

  var axes = new THREE.AxisHelper(5);
  scene.add(axes);

  var origin = new THREE.Vector3(0, 0, 0);
  window.camera.lookAt(origin);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMapEnabled = true;

  document.body.appendChild(renderer.domElement);

  // FLOOR
  var noiseSize = 256;
  var size = noiseSize * noiseSize;
  var data = new Uint8Array( 4 * size );
  for ( var i = 0; i < size * 4; i ++ ) {
      data[ i ] = Math.random() * 255 | 0;
  }
  var dt = new THREE.DataTexture( data, noiseSize, noiseSize, THREE.RGBAFormat );
  dt.wrapS = THREE.RepeatWrapping;
  dt.wrapT = THREE.RepeatWrapping;
  dt.needsUpdate = true;
  dt.repeat.set( 4, 4 );


  var floorMaterial = new THREE.MeshBasicMaterial( { map: dt, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);


  leapBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshLambertMaterial({color: colors.white, wireframe: true})
  );
  leapBall.castShadow = false;
  leapBall.receiveShadow = false;

  leapBall.position = scope.leapPosition;

  scene.add(leapBall);

  // Object Blocks
  var ob1 = make_block({color: colors.white});
  ob1.position.set(2, .5, 2);
  scene.add(ob1);

  var ob2 = make_block({color: colors.white});
  ob2.position.set(-2, .5, 2);
  scene.add(ob2);

  pickupables.push(ob1, ob2);

  billboard = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, .25),
    new THREE.MeshLambertMaterial({color: colors.white})
  );
  billboard.position.set(0, 3, -4);
  scene.add(billboard);

  // Drop target blocks
  var t1 = make_block({color: colors.green});
  t1.position.set(2, .5, 0);
  scene.add(t1);

  t2 = make_block({color: colors.yellow});
  t2.position.set(-2, .5, 0);
  scene.add(t2);

  dropables.push(t1, t2);

  //camera.position.fromArray([0, 3, 10]);

  //camera.lookAt(new THREE.Vector3(0, 0, 0));

  mainLight = new THREE.DirectionalLight(0xffffff, 3.5, 10);
  mainLight.castShadow = true;
  mainLight.position = scope.mainLightposition;

  scene.add(mainLight);

  render = function() {

    //var originPoint = block.position.clone();
    var originPoint = leapBall.position.clone();

    var collisionTargets = pickupables; //dropables;

    //ballCollision = false;
    var block_col = false;
    var cube_col = false;

    if(scope.pickupInit && canPickup) {
    /* Collide with dropables
      for (var vertexIndex = 0; vertexIndex < leapBall.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = leapBall.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( leapBall.matrix );
        var directionVector = globalVertex.sub( leapBall.position );

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( collisionTargets );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          block_col = true;
          ballCollision = collisionResults[0];
        }
      }
      */

      for (var vertexIndex = 0; vertexIndex < leapBall.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = leapBall.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( leapBall.matrix );
        var directionVector = globalVertex.sub( leapBall.position );

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( pickupables );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          block_col = true;
          // Put ball somewhere
          leapBall.position = leapBallHome

          ballCollision = collisionResults[0];
          ballCollision.object.position = scope.leapPosition;
          canPickup = false;
        }
      }

    }

    // Look for collisions between target and object blocks
    if(scope.pickupInit && ballCollision) {
      var currentCarry = ballCollision.object;
      var carryPoint = currentCarry.position.clone();
      for (var vertexIndex = 0; vertexIndex < currentCarry.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = currentCarry.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( currentCarry.matrix );
        var directionVector = globalVertex.sub( currentCarry.position );

        var ray = new THREE.Raycaster( carryPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( dropables );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          //block_col = true;
          // Put ball somewhere
          //leapBall.position = leapBallHome

          cube_col = true;

          cubeCollision = collisionResults[0];

          //ballCollision = collisionResults[0];
          //ballCollision.object.position = scope.leapPosition;
        }
      }
    }


    if(block_col) {
      billboard.material.color.setHex(colors.red);
      //block.position = targetBlock.position;
    } else {
      billboard.material.color.setHex(colors.white);
      if(scope.pickupInit) billboard.material.color.setHex(colors.blue);
      if(scope.pickupActive) billboard.material.color.setHex(colors.purple);
      //scope.canCarryBlock = true;
    }

    if(scope.grabActive) {
      billboard.material.color.setHex(colors.green);
    }

    if(cube_col) {
      //billboard.material.color.setHex(colors.yellow);
    } else {
      //billboard.material.color.setHex(colors.white);
    }


    // Drop cube
    if(ballCollision && !scope.grabActive) {
      console.log('Matrix=', ballCollision.object.matrix);
      var collisionPos = ballCollision.object.position.clone();
      var plusOne = collisionPos.add( new THREE.Vector3(0, 1, 0) );
      //block.position.set(plusOne.x, plusOne.y, plusOne.z);
      ballCollision.object.position = scope.leapPosition.clone();
      ballCollision.object.position.setY(0.5);
      //blockAttached = true;
    }



    if(cubeCollision && ballCollision && !scope.grabActive) {
      console.log('Connect Cubes=', cubeCollision.object.matrix);
      var targetPos = cubeCollision.object.position.clone();
      var plusOne = targetPos.add( new THREE.Vector3(0, 1, 0) );
      ballCollision.object.position.set(plusOne.x, plusOne.y, plusOne.z);

      cubeCollision = false;
      ballCollision = false;
      //ballCollision.object.position = scope.leapPosition.clone();
      //ballCollision.object.position.setY(0.5);
      //blockAttached = true;
    }

    if(!scope.grabActive) {
      ballCollision = false;
      cubeCollision = false;
      leapBall.position = leapBallHome;
      //scope.leapPosition = leapBallHome;
      setTimeout(function(){
        leapBall.position = scope.leapPosition;
        canPickup = true;
      }, 1000);
    }



    renderer.render(scene, camera);
    return requestAnimationFrame(render);
  };

  render();

  function make_block(config) {
    var b = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial(config)
    );
    b.castShadow = true;
    b.receiveShadow = true;

    return b;
  }

}).call(this);
