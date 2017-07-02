//Part 3
//https://www.youtube.com/watch?v=jwRT4PCT6RU&index=8&list=PLRqwX-V7Uu6bePNiZLnglXUp2LXIjlCdb
var cols = 50;
var rows = 50;
var grid = new Array(cols);
var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];

function removeFromArray(arr, elt){
	for(var i = arr.length -1; i >=0; i--){
		if(arr[i] == elt){
			arr.splice(i, 1);
		}
	}
}

function heuristic(a, b){
	var d = dist(a.i, a.j, b.i, b.j);
	//var d = abs(a.i - b.i) + abs(a.j - b.j);

	return d;
}

function Spot(x, y){
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.i = x;
	this.j = y;
	this.previous = undefined;
	this.wall = false;

	if(random(0, 1) < 0.25){
		this.wall = true;
	}

	this.neighbors = [];

	this.addNeighbors = function(arr){

		if(this.i < cols -1){
			this.neighbors.push(arr[this.i + 1 ][this.j]);
		}
		if(this.i > 0){
			this.neighbors.push(arr[this.i - 1 ][this.j]);
		}
		if(this.j < rows -1){	
			this.neighbors.push(arr[this.i][this.j + 1]);
		}
		if(this.j > 0){
			this.neighbors.push(arr[this.i][this.j - 1]);
		}
		if(this.i > 0 && this.j > 0){
			this.neighbors.push(arr[this.i - 1][this.j - 1]);
		}
		if(this.i < cols - 1 && this.j > 0){
			this.neighbors.push(arr[this.i + 1][this.j - 1]);
		}
		if(this.i > 0 && this.j < rows - 1){
			this.neighbors.push(arr[this.i - 1][this.j + 1]);
		}
		if(this.i < cols - 1 && this.j < rows - 1){
			this.neighbors.push(arr[this.i + 1][this.j + 1]);
		}
	}

	this.show = function(col){
		fill(col);
		if(this.wall){
			fill(0);
		}
		noStroke();
		rect(this.i * w, this.j * h, w -1 , h - 1);
	}
}

function setup(){
	createCanvas(400, 400);
	console.log("A*");

	w = width / cols;
	h = height / rows;

	//Making a 2D array
	for(var i = 0 ; i < cols; i++){
		grid[i] = new Array(rows);
	}

	for(var i = 0; i < cols; i++){
		for(var j = 0; j < rows; j++){
			grid[i][j] = new Spot(i, j);
		}
	}

	for(var i = 0; i < cols; i++){
		for(var j = 0; j < rows; j++){
			grid[i][j].addNeighbors(grid);
		}
	}

	start = grid[0][0];
	end = grid[cols - 1][rows - 1];
	start.wall = false;
	end.wall = false;

	openSet.push(start);

	console.log(grid);
}

function draw(){
	background(0);

	if(openSet.length > 0){
		
		var lowestIndex = 0;
		for(var i = 0; i < openSet.length; i++){
			if(openSet[i].f < openSet[lowestIndex].f){
				lowestIndex = i;
			}
		}

		var current = openSet[lowestIndex];

		if(current === end){
			console.log("end!");

			//Find the path
			
			var temp = current;
			path.push(temp);
			while(temp.previous){
				path.push(temp.previous);
				temp = temp.previous;
			}
		}

		removeFromArray(openSet, current);
		closedSet.push(current);

		var neighbors = current.neighbors;

		for(var i = 0; i < neighbors.length; i++){

			var neighbor = neighbors[i];

			if(!closedSet.includes(neighbor) && !neighbor.wall){
				var tempG = current.g + 1;

				var newPath = false;
				if(openSet.includes(neighbor)){
					if(tempG < neighbor.g){
						neighbor.g = tempG;
						newPath = true;
					}
				} 
				else {
					neighbor.g = tempG;
					openSet.push(neighbor);
					newPath = true;
				}

				if(newPath){
					neighbor.h = heuristic(neighbor, end);
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.previous = current;
				}

			}

		}
	}

	else {
		console.log("No Solution");
		noLoop();
	}



	//debugging

	for(var i = 0; i < cols; i++){
		for(var j = 0; j < rows; j++){
			grid[i][j].show(color(255));
		}
	}

	for(var i = 0; i < closedSet.length; i++){
		closedSet[i].show(color(255, 0, 0));
	}

	for(var i = 0; i < openSet.length; i++){
		openSet[i].show(color(0, 255, 0));
	}

	for(var i = 0; i < path.length; i++){
		path[i].show(color(0, 0, 255));
	}
}


/*
		A* Algorithm

	Formula
	-------
	f(n) = g(n) + h(n)
	f = total (optimal path)
	g = distance between next node
	h = how long to end
	n = node

	Pseudo Code
	-----------
	function A*(start, goal)
    // The set of nodes already evaluated
    closedSet := {}

    // The set of currently discovered nodes that are not evaluated yet.
    // Initially, only the start node is known.
    openSet := {start}

    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
    cameFrom := the empty map

    // For each node, the cost of getting from the start node to that node.
    gScore := map with default value of Infinity

    // The cost of going from start to start is zero.
    gScore[start] := 0 

    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    fScore := map with default value of Infinity

    // For the first node, that value is completely heuristic.
    fScore[start] := heuristic_cost_estimate(start, goal)

    while openSet is not empty
        current := the node in openSet having the lowest fScore[] value
        if current = goal
            return reconstruct_path(cameFrom, current)

        openSet.Remove(current)
        closedSet.Add(current)

        for each neighbor of current
            if neighbor in closedSet
                continue		// Ignore the neighbor which is already evaluated.

            if neighbor not in openSet	// Discover a new node
                openSet.Add(neighbor)
            
            // The distance from start to a neighbor
            tentative_gScore := gScore[current] + dist_between(current, neighbor)
            if tentative_gScore >= gScore[neighbor]
                continue		// This is not a better path.

            // This path is the best until now. Record it!
            cameFrom[neighbor] := current
            gScore[neighbor] := tentative_gScore
            fScore[neighbor] := gScore[neighbor] + heuristic_cost_estimate(neighbor, goal)

    return failure

function reconstruct_path(cameFrom, current)
    total_path := [current]
    while current in cameFrom.Keys:
        current := cameFrom[current]
        total_path.append(current)
    return total_path

*/