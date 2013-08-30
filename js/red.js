$(document).ready(function(){
	$('#result').hide();
	init();
});

var Kinectible = (function(){

	function constructor(x, y){
		
		// private
		var x = x;
		var y = y;
		var object = null;

		// public
		this.getX = function(){
			return x;
		}

		this.getY = function(){
			return y;
		}

		this.getObject = function(){
			if(object == null){
				object = this.drawObject();
			}
			return object;
		}
		this.add = function(layer){
			layer.add(this.getObject());
		}
		this.drawObject = function(){

		}
	}
	return constructor;
}());

var Obstacle = (function(){
	function constructor(road){
		var x = Math.random() * road.getWidth() + road.getX();
		var y = 0;
		Kinectible.call(this, x, y);

		this.drawObject = function(){
			return new Kinetic.RegularPolygon({
				x: x,
				y: y,
				sides: 4,
				radius: road.getWidth()/20,
				fill: 'black',
				stroke: 'black',
				strokeWidth: 5
			});
		}

		this.animate = function(layer, speed, red){
			var self = this;
			var anim = new Kinetic.Animation(function(frame){
				obj = self.getObject();
				obj.setY(frame.time * speed);
				if(obj.getY() > road.getHeight() - 100){
					if(obj.getX() > red.getX() && obj.getX() < red.getX() + 40){
						$(document).trigger('crash');
					}
				}
				if(obj.getY() > road.getHeight()){
					anim.stop();
					obj.destroy();
				}
			}, layer);
			anim.start();
		}
	}
	constructor.prototype = new Kinectible();
	return constructor;
}());

var Car = (function(){
	function constructor(road){
		this.x = 0;
		this.y = 0;
		Kinectible.call(this, this.x, this.y);
	
		this.drawObject = function(){
			var self = this;
			return new Kinetic.Wedge({
				x: this.x,
				y: this.y,
				radius: road.getWidth() / 12,
				angleDeg: 60,
				fill: self.fill,
				stroke: 'black',
				strokeWidth: 5,
				rotationDeg: 60
			});
		}

		this.animate = function(){

		}
	}

	constructor.prototype = new Kinectible();
	return constructor;
}());

var BlackCar = (function(){
	function constructor(road){
		Car.call(this, road);
		var fill = 'black';
	}
	constructor.prototype = new Car();
	return constructor;
}());

var WhiteCar = (function(){
	function constructor(road){
		Car.call(this, road);
		this.x = Math.random() * road.getWidth() + road.getX();
		this.y = 0;
		this.direction = this.x < road.getWidth() / 2 + road.getX();
		this.fill = 'white';

		this.animate = function(layer, speed, red){
			var self = this;
			var anim = new Kinetic.Animation(function(frame){
				obj = self.getObject();
				obj.setY(frame.time * speed * 0.1);
				if(obj.getY() < road.getHeight() - 150){
					if(self.direction){
						obj.setX(obj.getX() + frame.time * (speed * 0.001));
					}else{
						obj.setX(obj.getX() - frame.time * (speed * 0.001));
					}
				}
				if(obj.getY() > road.getHeight() - 100){
					if(obj.getX() > red.getX() && obj.getX() < red.getX() + 40){
						$(document).trigger('crash');
					}
				}
				if(obj.getX() > road.getWidth() + road.getX() || obj.getX() < road.getX()){
					self.direction = !self.direction;
				}
				if(obj.getY() > road.getHeight()){
					anim.stop();
					obj.destroy();
				}
			}, layer);
			anim.start();	
		}
	}
	constructor.prototype = new Car();
	return constructor;
}());

var YellowCar = (function(){
	function constructor(road){
		Car.call(this, road);
		var fill = 'yellow';
	}
	constructor.prototype = new Car();
	return constructor;
}());

var Red = (function(){
	var aspectRatio = 153/282;
	function constructor(id, image, road){
		Kinectible.call(this, 0, 0);
		var id = id;
		var image = image;
		var x = road.getWidth()/2;
		var width = road.getWidth()/12;
		var height = width / aspectRatio;
		var y = road.getHeight() - height - 50;
		var boundFunc = function(pos){
			var newX = pos.x;
			if(newX < road.getX()){
				newX = road.getX();
			}else{
				if(newX > road.getWidth() + road.getX() - width){
					newX = road.getWidth() + road.getX() - width;
				}
			}
			return {x: newX, y: y};
		}

		this.getImage = function(){
			return image;
		}

		this.drawObject = function(){
			return new Kinetic.Image({
				id: id,
				image: image,
				x: x,
				y: y,
				width: width,
				height: height,
				draggable: true,
				dragBoundFunc: boundFunc
			});
		}
	}
	constructor.prototype = new Kinectible();
	constructor.SPEED = 0.2;
	return constructor;
}());

var RoadLine = (function(){
	function constructor(x, length){
		Kinectible.call(this, 'common');
		var x = x;
		var length = length;

		this.drawObject = function(){
			return new Kinetic.Line({
				points: [x, 0, x, length],
				stroke: 'white',
				strokeWidth: 2,
				lineJoin: 'round',
				// dashArray: [50, 30]
			});
		}
	}
	constructor.prototype = new Kinectible();
	return constructor;
}());

var Road = (function(){

	function constructor(id, x, y, width, height){
		Kinectible.call(this, x, y);
		var id = id;
		var width = width;
		var height = height;
		var lines = new Array();

		this.getWidth = function(){
			return width;
		}

		this.getHeight = function(){
			return height;
		}

		this.drawObject = function(){
			var group = new Kinetic.Group({
				x: x,
				y: y,
				id: id
			});
			var road = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: width,
				height: height,
				fill: '#CCCCCC',
				stroke: 'black',
				strokeWidth: 2
			});
			group.add(road);
			var linex = 0;
			for(var i=0; i<5; i++){
				var line = new RoadLine(linex+=width/6, height);
				group.add(line.getObject());
				lines.push(line);
			}
			return group;
		}
	}
	constructor.prototype = new Kinectible();
	return constructor;
}());

function init(){
	var stage = new Kinetic.Stage({
		container: 'container',
		width: 800,
		height: 600
	});
	var staticLayer = new Kinetic.Layer();
	var road = new Road('road', stage.getWidth()/4, 0, stage.getWidth()/2, stage.getHeight());
	road.add(staticLayer);

	var redImage = new Image();
	redImage.onload = function(){
		var red = new Red('red', redImage, road);
		red.add(staticLayer);
		stage.add(staticLayer);

		start(stage, staticLayer, red, road);
	}
	redImage.src = "img/red.png";
}

totalPoints = 0;
function start(stage, layer, red, road){
	var animLayer = new Kinetic.Layer();
	stage.add(animLayer);

	var live = setInterval(function(){
		totalPoints++;

		if(totalPoints % 9 == 0){
			Red.SPEED += 0.03;
		}

		if(totalPoints % 5 == 0){
			var obstacle = new Obstacle(road);
			obstacle.add(animLayer);
			obstacle.animate(animLayer, Red.SPEED, red.getObject());
		}

		if(totalPoints % 100 == 0){
			var whiteCar = new WhiteCar(road);
			whiteCar.add(animLayer);
			whiteCar.animate(animLayer, Red.SPEED, red.getObject());
		}
	}, 100);

	$(document).on('crash', function(){
		clearInterval(live);
		stage.destroy();
		$('#container').hide();
		$('#result').show();
		$('#point').html(totalPoints)
	});
}