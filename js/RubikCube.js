"use strict";

class RubikCube {
  
  constructor(cubeLength) {
    this.cubeLength = cubeLength;
    
    // Colors defined in order (right, left, bottom, top, rear, front)
    this.colors = [
      0xFF851B, // orange
      0xFF0000, // red,
      0x0000FF,  // blue
      0x00FF00, // green
      0xFFDC00, // yellow
      0xFFFFFF // white 
    ];
    
    this.squares = [];
    this.flatSquares = [];
    
    for (let col = 0; col < this.cubeLength; col++) {
      this.squares[col] = [];
      
      for (let row = 0; row < this.cubeLength; row++) {
        this.squares[col][row] = [];
        
        for (let dep = 0; dep < this.cubeLength; dep++) {
          // geometry faces (in order) are: right, left, top, bottom, front, rear
              
          var l = this.cubeLength - 1;      
          var square = new RubikSquare(col, row, dep, [
            col === l ? this.colors[0] : null,
            col === 0 ? this.colors[1] : null,
            row === l ? this.colors[3] : null,
            row === 0 ? this.colors[2] : null,
            dep === l ? this.colors[5] : null,
            dep === 0 ? this.colors[4] : null
          ], this.cubeLength);
          
          this.squares[col][row][dep] = square;
          this.flatSquares.push(square);
        }
      }
    }
  }
  
  spinSquares(group, polarity, number) {
    if (number >= this.cubeLength) {
      throw new Error("Given `number` is larger than the cube length");
    }
    
    let squares = this.flatSquares.filter(s => 
      (group === 'col' && s.currentCol === number) ||
      (group === 'row' && s.currentRow === number) ||
      (group === 'dep' && s.currentDep === number));

    squares.forEach(s => s.spinAcross(group, polarity));
  }
  
  getSquareAt(col, row, dep) {
    return this.squares[col][row][dep];
  }
  
  
  prepRender() {
    var cube = new THREE.Object3D();
    
    this.flatSquares.forEach(s => cube.add(s.prepRender()));
    
    var cubeContainer = this._display = new THREE.Object3D();
    cubeContainer.add(cube);
    
    cubeContainer.add(buildAxes(10));
    
    return cubeContainer;
  }
  
  update() {
    for (let s of this.flatSquares) { 
      s.update();
    }
  }
}
