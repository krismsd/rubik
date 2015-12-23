var cube;

function init() {
  "use strict";

  // Setup scene, camera + renderer
  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera( 80, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Controls
  let controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 2.0;
  controls.noZoom = true;
  controls.noPan = true;
  controls.noRotate = false;
  controls.staticMoving = true;

  
  var objects = [];
  cube = new RubikCube(3);
  objects.push(cube);
  // objects.push(new RubikCube());

  objects.forEach(o => scene.add(o.prepRender()));


  // Rendering loop
  (function render() {
  	requestAnimationFrame( render );
    objects.forEach(o => o.update());
    controls.update();
  	renderer.render(scene, camera);
  })();
}



/// Nifty axis drawer

function buildAxes( length ) {
	var axes = new THREE.Object3D();

	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

	return axes;

}

function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 0.5, gapSize: 0.5 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
	}

	geom.vertices.push( src.clone() );
	geom.vertices.push( dst.clone() );
	geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

	var axis = new THREE.Line( geom, mat, THREE.LinePieces );

	return axis;

}
  
