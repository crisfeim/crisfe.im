function run() {
	document.getElementById("console").classList.toggle("show");
}

function switchViewMode() {
	
	document.getElementById("output").classList.toggle("article-width");
	document.getElementById("top-controls-content").classList.toggle("article-width");
	document.getElementById("code").classList.toggle("article-width");
	document.getElementById("article-info").classList.toggle("article-width");
	
	let collapsed = document.getElementById("output").classList.contains('article-width')
	
	localStorage.setItem('collapsed', collapsed ? 'true' : 'false');
}

function expandLayout() {
	document.getElementById("output").classList.remove("article-width");
	document.getElementById("top-controls-content").classList.remove("article-width");
	document.getElementById("code").classList.remove("article-width");
	document.getElementById("article-info").classList.remove("article-width");
}

function collapseLayout() {
	document.getElementById("output").classList.add("article-width");
	document.getElementById("top-controls-content").classList.add("article-width");
	document.getElementById("code").classList.add("article-width");
	document.getElementById("article-info").classList.add("article-width");
}

function toggleTextSelection(dragging) {
	const codeDiv = document.getElementById("code");
	
	codeDiv.style.userSelect       = dragging ? "none" : "text";
	codeDiv.style.webkitUserSelect = dragging ? "none" : "text";
	codeDiv.style.msUserSelect     = dragging ? "none" : "text";
}


function showGoToLine() {
	const lineInput = document.getElementById('line-input');
	lineInput.value = '';
	if (lineInput.classList.contains("hide")) {
		lineInput.classList.remove("hide");
		lineInput.focus();
	} else {
		lineInput.blur();
		lineInput.classList.add("hide");
	}
}

function gotomatchingline(lineNumber) {
	const targetLine = document.getElementById(`line-${lineNumber}`);
	
	if (targetLine) {
		// -40px of the top bar
		const targetPosition = targetLine.getBoundingClientRect().top + window.scrollY - 40;
		
		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});
	}
}

const toggleClassName = "theme-toggle--toggled";
const toggleButton = document.getElementById('theme-toggle');
function toggle() {
	
	toggleButton.classList.toggle(toggleClassName);
	document.body.classList.toggle('light-mode');
	
	if (document.body.classList.contains('light-mode')) {
		localStorage.setItem('theme', 'light');
	} else {
		localStorage.setItem('theme', 'dark');
	}
}


function toggleColor() {
	document.body.classList.toggle('colored');
	
	if (document.body.classList.contains('colored')) {
		localStorage.setItem('colored', 'true');
	} else {
		localStorage.setItem('colored', 'false');
	}
}

var main = document.getElementById("console");


document.addEventListener('DOMContentLoaded', function() {
	document.addEventListener('keydown', function(e) {
		if (e.altKey && e.keyCode === 82) {
			e.preventDefault()
			run();
		}
		
		if (e.altKey && e.keyCode === 76) {
			e.preventDefault();
			showGoToLine()
		}
	});
	
	const lineInput = document.getElementById('line-input');
	
	lineInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			const lineNumber = this.value;
			gotomatchingline(lineNumber)
			lineInput.classList.toggle('hide');
			this.value = '';
		}
	});
	
	
	// Cargar el modo desde localStorage
	const currentMode = localStorage.getItem('theme') || 'dark';
	if (currentMode === 'light') {
		document.body.classList.add('light-mode');
		toggleButton.classList.add(toggleClassName)
	} else {
		toggleButton.classList.remove(toggleClassName)
	}
	
	const colored = localStorage.getItem('colored') || 'true' ;
	if (colored === 'true') {
		document.body.classList.add('colored')
	} else {
		console.log('removing')
		document.body.classList.remove('colored')
	}
	
	const collapsed = localStorage.getItem('collapsed') || 'true' ;
	if (collapsed === 'true') {
		collapseLayout()
	} else {
		expandLayout()
	}
});



