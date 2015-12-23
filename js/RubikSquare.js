"use strict";

class RubikSquare {
  
  constructor(col, row, dep, sideColors, cubeLength) {
    this.col = this.currentCol = col;
    this.row = this.currentRow = row;
    this.dep = this.currentDep = dep;
    this.sideColors = sideColors;
    
    this.squareLength = 1; 
    this.squareMargin = 0.2;
    
    // The offset amount that brings the middle square into cartesian (0,0,0) position 
    this.offset = (cubeLength - 1) / 2;
  }
  
  getColorForSide(side) {
    return this.sideColors[side];
  }
  
  updateCurrentPosition() {    
    /*
      To get the current (rotated) position relative to the entire cube
      make a vector relative to the center of the cube and rotate it using
      the display quaternion. The vector's position can then be transformed
      back into our system (where the 0,0,0 square is the bottom, left, rear)
    */
    let vector = new THREE.Vector3(
      this.col - this.offset,
      this.row - this.offset,
      this.dep - this.offset
    );
    vector.applyQuaternion(this.quaternion);

    this.currentCol = Math.round(vector.x + this.offset);
    this.currentRow = Math.round(vector.y + this.offset);
    this.currentDep = Math.round(vector.z + this.offset);
  }
  
  spinAcross(group, polarity) {
    /*
      Construct a Quaternion describing the rotation to happen
      and multiply that with the current rotation to get the 
      final resulting rotation. Set that to the display and voila!
      We have to use Quaternions to get around the "gimble lock" problem
      as it allows us to simply rotate in terms of the global axis
      regardless of any current rotation on this object 
    */
    
    let amount = Math.PI / 2 * polarity;
    let deltaEuler = new THREE.Euler(
      group === 'col' ? amount : 0,
      group === 'row' ? amount : 0,
      group === 'dep' ? amount : 0
    );
    
    let deltaQuat = new THREE.Quaternion();
    deltaQuat.setFromEuler(deltaEuler);
    
    let result = deltaQuat.multiply(this.quaternion);
    result.normalize();
    
    // We can start animating to the new position
    this.quaternion = result;
    this.animating = true;
    this._animationStart = Date.now();
    this._animationStartQuaternion = this._display.quaternion;
    
    // Update the current position of this square
    this.updateCurrentPosition();
  }

  
  prepRender() {
    var geometry = new THREE.BoxGeometry(this.squareLength, this.squareLength, this.squareLength);
    
    // geometry faces (in order) are: right, left, top, rear, front, bottom
    
    var cc = [];
    var d = 0x333333;
    cc[0] = cc[1] = this.sideColors[0] || d;
    cc[2] = cc[3] = this.sideColors[1] || d;
    cc[4] = cc[5] = this.sideColors[2] || d;
    cc[6] = cc[7] = this.sideColors[3] || d;
    cc[8] = cc[9] = this.sideColors[4] || d;
    cc[10] = cc[11] = this.sideColors[5] || d;
    
    // Color the sides - each face has 2 segments both which need to be colored
    for (var j = 0; j < geometry.faces.length; j++) {
      geometry.faces[j].color.setHex(cc[j]);
    }
    

    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
    
    // material.wireframe = !(this.col === 0 && this.row === 0 && this.dep === 0);
    
  	var cube = new THREE.Mesh( geometry, material );
    
    // Each cube is 1 across in all dimensions + 0.2 margin
    let l = this.squareLength + this.squareMargin;
    cube.position.x = l * (this.col - this.offset);
    cube.position.y = l * (this.row - this.offset);
    cube.position.z = l * (this.dep - this.offset);
    
    var rotBox = this._display = new THREE.Object3D();
    rotBox.add(cube);
    
    this.quaternion = rotBox.quaternion;
    
    return rotBox;
  }
  
  update() {
    if (this.animating) {
      // we need the progress
      let progress = (Date.now() - this._animationStart) / 2000; // 2 seconds
      progress  = Math.min(progress, 1);
      
      THREE.Quaternion.slerp(this._animationStartQuaternion, this.quaternion, this._display.quaternion, progress);
      
      if (progress >= 1) {
        this.animating = false;
      }
    }
  }
  
}
