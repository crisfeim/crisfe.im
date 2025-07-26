var dragTop = document.querySelector("#console .draggerTop");

var _dragTopDown = false;


Object.defineProperty(window, 'dragTopDown', {
		get: function() {
				return _dragTopDown;
		},
		set: function(value) {
				_dragTopDown = value;
				toggleTextSelection(value);
		}
});


var minHeight = 28;
var maxHeight = 300;

dragTop.addEventListener("mousedown", function() {
		dragTopDown = true;
});

document.addEventListener("mouseup", function() {
		dragTopDown = false;
});

document.addEventListener("mousemove", function(e) {
		if (!dragTopDown) {
				return;
		}

		var newHeight = window.innerHeight - e.clientY;
		newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

		main.style.height = newHeight + "px";
		main.style.top = "calc(100% - " + newHeight + "px)";
});
