// Copyright (c) Hao
// 1044504787@qq.com

	let iter = 0;
	
	let cols = 144//288;
	let rows = 74//148;
	let grid;
	
	let openSet;
	let closedSet;
	let start;
	let end;
	let w, h;
	let path;
	
	let do_diagonal = false;
	let grid_spawn_rate = 0.27;
	
	let found_path = false;

	var grid_item;

	var Wall = true;
	var end_past_x;
	var end_past_y;

	if (Wall ){
		function mousePressed() {
			end_past_x = Math.floor(cols*mouseX/windowWidth);
			end_past_y = Math.floor(rows*mouseY/windowHeight);
			end = grid[end_past_x][end_past_y];
			iter--;
			redraw(); 
			}
	}
	else{
		;
	}


	function generateNewBoard() {
		// reset global variables
		grid = [];
		openSet = [];
		closedSet = [];
		path = [];
		found_path = false;
		
		// 2d array + create spots
		for(let i = 0; i < cols; i++) {
			grid[ i ] = [];
			
			for(let j = 0; j < rows; j++) {
				grid[ i ][ j ] = new Spot(i, j);
			}
		}
		
		// set neighbors
		for(let i = 0; i < cols; i++) {
			for(let j = 0; j < rows; j++) {
				grid[ i ][ j ].addNeighbors(grid);
			}
		}
		
		//// random start+end:
		start = grid[ Math.round(random(0, (cols - 1))) ][ Math.round(random(0, (rows - 1))) ];
		end_past_x = Math.round(random(0, (cols - 1)));
		end_past_y = Math.round(random(0, (rows - 1)));
		end = grid[ end_past_x ][ end_past_y ];



		// start_0 = grid[ Math.round(Math.random(0, (cols - 1))) ][ Math.round(Math.random(0, (rows - 1))) ];
		// corners start+end:
		//start = grid[0][0];
		//end = grid[(cols - 1)][(rows - 1)];


		
		// make sure start and end aren't walls
		start.wall = false;
		// start_0.wall = false;
		end.wall = false;
		
		openSet.push(start);
		// openSet.push(start_0);
		
		iter++;
		
		loop();
	}
	
	function removeFromArray(arr, elt) {
		for(let i = (arr.length - 1); i >= 0; i--) {
			if(arr[ i ] == elt) {
				arr.splice(i, 1);
			}
		}
	}
	
	function heuristic(a, b) {
		// euclidean distance
		let d = dist(a.i, a.j, b.i, b.j);
		// manhattan distance
		//let d = abs( a.i - b.i ) + abs( a.j - b.j );
		
		return d;
	}
	
	function Spot(i, j) {
		this.i = i;
		this.j = j;
		this.f = 0;
		this.g = 0;
		this.h = 0;
		this.neighbors = [];
		this.previous = undefined;
		this.wall = false;
		
		if(random(1) < grid_spawn_rate) {
			this.wall = true;
		}
		
		this.show = function(col) {
			noStroke();
			
			stroke(col);
			fill(col);
			
			if(this.wall) {
				//stroke(45, 45, 45);
				fill(141, 131, 131);
				ellipse((this.i * w), (this.j * h), 0.47*w, 0.47*h);
			}
			
			//rect((this.i * w), (this.j * h), (w - 1), (h - 1));
			if(!this.wall) {
				ellipse((this.i * w), (this.j * h), 0.87*w, 0.87*h);
			}
		};
		
		this.addNeighbors = function(grid) {
			let i = this.i;
			let j = this.j;
			
			// left
			if(i < (cols - 1)) {
				this.neighbors.push(grid[ i + 1 ][ j     ]);
			}
			
			// right
			if(i > 0) {
				this.neighbors.push(grid[ i - 1 ][ j     ]);
			}
			
			// above
			if(j < (rows - 1)) {
				this.neighbors.push(grid[ i     ][ j + 1 ]);
			}
			
			// below
			if(j > 0) {
				this.neighbors.push(grid[ i     ][ j - 1 ]);
			}
			
			// if(do_diagonal) {
			// 	// diag top left
			// 	if((i > 0) && (j > 0)) {
			// 		this.neighbors.push(grid[ i - 1 ][ j - 1 ]);
			// 	}
				
			// 	// diag top right
			// 	if((i < (cols - 1)) && (j > 0)) {
			// 		this.neighbors.push(grid[ i + 1 ][ j - 1 ]);
			// 	}
				
			// 	// diag bottom left
			// 	if((i > 0) && (j < (rows - 1))) {
			// 		this.neighbors.push(grid[ i - 1 ][ j + 1 ]);
			// 	}
				
			// 	// diag bottom right
			// 	if((i < (cols - 1)) && (j < (cols - 1))) {
			// 		this.neighbors.push(grid[ i + 1 ][ j + 1 ]);
			// 	}
			// }
		};
	}
	
	// create canvas of viewport size
	function setup() {
		var cnv = createCanvas(windowWidth, windowHeight);
		cnv.parent('container');
		w = (width / cols);
		h = (height / rows);
		generateNewBoard();
	}

	function windowResized() {
		resizeCanvas(windowWidth, windowHeight);
	}

	// create canvas of fixed size.
	/*function setup() {
		createCanvas(600, 600);
		
		w = (width / cols);
		h = (height / rows);
		
		generateNewBoard();
	}
	*/	
	function draw() {
		var current;
		let solved_this_round = false;


		if(openSet.length > 0) {
			// keep going
			let winner = 0;
			
			for(let i = 0; i < openSet.length; i++) {
				if(openSet[ i ].f < openSet[ winner ].f) {
					winner = i;
				}
			}
			
			current = openSet[ winner ];
			
			if(current === end) {
				noLoop();
				
				// start new board
				window.setTimeout(function() {
					generateNewBoard();
				}, 1000);
				
				solved_this_round = true;
				found_path = true;
			}
			
			if(!solved_this_round) {
				removeFromArray(openSet, current);
				closedSet.push(current);
				
				let neighbors = current.neighbors;
				
				for(let i = 0; i < neighbors.length; i++) {
					let neighbor = neighbors[ i ];
					

					if(!closedSet.includes(neighbor) && !neighbor.wall) {
						let tempG = current.g + 1;
						
						let newPath = false;
						
						if(openSet.includes(neighbor)) {
							if(tempG < neighbor.g) {
								neighbor.g = tempG;
								newPath = true;
							}
						} else {
							neighbor.g = tempG;
							newPath = true;
							openSet.push(neighbor);
						}
						
						if(newPath) {
							neighbor.h = heuristic(neighbor, end);
							neighbor.f = (0.7*neighbor.g + 1.3*neighbor.h);
							neighbor.previous = current;
						}
					}
				}
			}
		} else {
			// no solution
			noLoop();
			
			// start new board
			window.setTimeout(function() {
				generateNewBoard();
			}, 1000);
			
			return;
		}
		
		background(39,39,39);
		
		for(let i = 0; i < cols; i++) {
			for(let j = 0; j < rows; j++) {
				grid[ i ][ j ].show(color(39));
			}
		}
		
		for(let i = 0; i < closedSet.length; i++) {
			closedSet[ i ].show(color(227, 178, 61));
		}
		
		for(let i = 0; i < openSet.length; i++) {
			openSet[ i ].show(color(165, 47, 67));
		}
		
		
		// draw the current best path
		path = [];
		let temp = current;
		path.push(temp);
		while(temp.previous) {
			path.push(temp.previous);
			temp = temp.previous;
		}
		
		let start_color = color(47, 165, 147);
		let end_color = color(255, 251, 251);
		
		let dist_startEnd = dist(start.i, start.j, end.i, end.j);
		// let dist_startEnd_0 = dist(start_0.i, start_0.j, end.i, end.j);

		for(let i = 0; i < path.length; i++) {
			let dist_startPathPoint = dist(start.i, start.j, path[ i ].i, path[ i ].j);
			// let dist_startPathPoint_0 = dist(start_0.i, start_0.j, path[ i ].i, path[ i ].j);
			path[ i ].show(lerpColor(start_color, end_color, (dist_startPathPoint / dist_startEnd)));
			// path[ i ].show(lerpColor(start_color, end_color, (dist_startPathPoint_0 / dist_startEnd_0)));
		}
		
		
		// draw start + end
		start.show(start_color);
		// start_0.show(start_color);
		end.show(end_color);

	}
