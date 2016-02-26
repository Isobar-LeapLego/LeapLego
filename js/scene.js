window.scope = window.scope || {};
(function(scope){
  var container;
  var camera, scene, renderer;
  var plane;

  var mouse, raycaster, isShiftDown, rotationControls = false;
  var mouse3D, isMouseDown = false, onMouseDownPosition,
  radious = 1600, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;


  var rollOverMesh, rollOverMaterial;

  var cubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
  var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );

  scope.leapPosition = new THREE.Vector3(0,0,0);

  var objects = [];

  init();
  render();

  function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
    camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();

    // roll-over helpers

    rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // Scene movement

    onMouseDownPosition = new THREE.Vector2();

    // Grid

    var size = 500, step = 50;

    var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

      geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

      geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
      geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );

    //

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    objects.push( plane );

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0x808080 );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );
    //document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

  }

  function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    if( isMouseDown && rotationControls ) {

      theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
      phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

      phi = Math.min( 180, Math.max( 0, phi ) );

      camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
      camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
      camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
      camera.updateMatrix();
      //camera.lookAt(0,0,0);
    }

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
      rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    }

    render();

  }

  function onDocumentMouseDown( event ) {

    event.preventDefault();

    isMouseDown = true;

    onMouseDownTheta = theta;
    onMouseDownPhi = phi;
    onMouseDownPosition.x = event.clientX;
    onMouseDownPosition.y = event.clientY;

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      if ( isShiftDown ) {

        if ( intersect.object != plane ) {

          scene.remove( intersect.object );

          objects.splice( objects.indexOf( intersect.object ), 1 );

        }

      } else {

        var voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );
        voxel.position.copy( intersect.point ).add( intersect.face.normal );
        voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        scene.add( voxel );

        objects.push( voxel );

      }

      render();

    }

  }

  function onDocumentMouseUp( event ) {

    event.preventDefault();

    isMouseDown = false;

    onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
    onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
  }

  function onDocumentKeyDown( event ) {

    switch( event.keyCode ) {

      case 16: isShiftDown = true; break;

    }

  }

  function onDocumentKeyUp( event ) {

    switch( event.keyCode ) {

      case 16: isShiftDown = false; break;

    }
  }

  function save() {

    window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
    return false;

  }

  function render() {

    var leapOut = document.getElementById('leapoutput');
    console.log("hand-->", scope.leapPosition);

    renderer.render( scene, camera );

  }

  scope.scene = scene;
  scope.camera = camera;
  scope.save = save;

})(window.scope);