// pictureDairy
$( document ).ready(function() { // waits till the document has been loaded 
	
	$('#todoItems').on('click', '.delete', function (e) {
		var path = $(this).data('path');
		diary.indexedDB.deleteTodo(path);
		return false;
	});
	
	$('#todoItems').on('click', '.picGeo', function (e) {
		console.log("i have been ran");
		var lat = $(this).data('lat');
		var lon = $(this).data('lon');
		initialize(lat,lon);
		return false;
	});
	
	$('#x').click(function(){
		$('#map-canvas').hide();
		$(this).hide();
	});
	diary.indexedDB.open(); // open displays the data previously saved
	
	$('#loading').hide();
	$('#map-canvas').hide();

	if (localStorage.getItem("info") === null) {
	}else if(localStorage.getItem("info") === "yes") {
		$('#geoIcon').removeClass('iconOff').addClass('iconOn');
	}else if(localStorage.getItem("info") === "off"){
		$('#geoIcon').removeClass('iconOn').addClass('iconOff');
	}	
	
	
	$('#geoIcon').click(function(){
		console.log("this event happened");
		if (localStorage.getItem("info") === null) {
			$("#mnav").slideToggle(500);
		}else if(localStorage.getItem("info") === "yes") {
			$('#geoIcon').removeClass('iconOff').addClass('iconOn');
			$('#checkGeo').removeClass('off').addClass('on');
			$('#checkGeo').text("GeoLocation Capture On");
			$("#mnav").slideToggle(500);
		}else if(localStorage.getItem("info") === "off"){
			$('#geoIcon').removeClass('iconOn').addClass('iconOff');
			$('#checkGeo').removeClass('on').addClass('off');
			$('#checkGeo').text("GeoLocation Capture OFF");
			$("#mnav").slideToggle(500);
		}	
	});
	
	$('#checkGeo').click(function(){
		if (localStorage.getItem("info") === null) {
			$(this).removeClass('on').addClass('off');
			$(this).text("GeoLocation Capture OFF");
			var geoInfo = "off";
			localStorage.setItem( 'info', geoInfo );
		}else if(localStorage.getItem("info") == "yes") {
			$(this).removeClass('on').addClass('off');
			$(this).text("GeoLocation Capture OFF");
			var geoInfo = "off";
			localStorage.setItem( 'info', geoInfo );
		}else if(localStorage.getItem("info") == "off"){
			$(this).removeClass('off').addClass('on');
			$(this).text("GeoLocation Capture On");
			var geoInfo = "yes";
			localStorage.setItem( 'info', geoInfo );
		}		
	});
	
	
			
});


var map;
function initialize(lat,lon) {
	$('#map-canvas').show();
	$('#x').show();
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(lat, lon)
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
	var markerPos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: markerPos,
		map: map
	});
}

var diary = {};

diary.indexedDB = {};

diary.indexedDB.db = null;

diary.indexedDB.open = function (){
	var version = 1;
	var request = indexedDB.open("todos", version);
	
    // We can only create Object stores in a versionchange transaction.
	request.onupgradeneeded = function(e) {
		var db = e.target.result;

		// A versionchange transaction is started automatically.
		e.target.transaction.onerror = diary.indexedDB.onerror;

		if(db.objectStoreNames.contains("todo")) {
		  db.deleteObjectStore("todo");
		}
		
		var store = db.createObjectStore("todo",
		  {keyPath: "timeStamp"});
	};	
	
	request.onsuccess = function(e){
		diary.indexedDB.db = e.target.result;
		diary.indexedDB.getAllTodoItems(); // this is the function that gets all the data
	};
	
	request.onerror = diary.indexedDB.onerror;
};

diary.indexedDB.addTodo = function(todoText,src,lat,lon) { // the function that adds new items to the database
		var db = diary.indexedDB.db;
		var trans = db.transaction(["todo"], "readwrite");
		var store = trans.objectStore("todo");
		var request = store.put({
		"fileName": src,
		"geoLat":lat,
		"geoLon":lon,
		"text": todoText,
		"timeStamp" : new Date().getTime()
    });

    trans.oncomplete = function(e) {
		// Re-render all the todo's
		diary.indexedDB.getAllTodoItems();
    };

	request.onerror = function(e) {
		console.log(e.value);
    };
};

diary.indexedDB.getAllTodoItems = function() { // this function reads the database and send it to another function to render 
	var todos = document.getElementById("todoItems");
    todos.innerHTML = "";

    var db = diary.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
		var result = e.target.result;
		if(!!result == false)
		return;
		renderTodo(result.value);
		result.continue();
    };

    cursorRequest.onerror = diary.indexedDB.onerror;
};

function renderTodo(row) { // function that renders the html on the page 
	if(row.geoLat == "none"){
		var li = '<li><img class="filenames" src="'+ row.fileName +'" alt="" style="width:100%;height:auto"><div class="line"><span class="todoText">'+row.text+'</span> <a href="#" data-path="'+row.timeStamp+'" class="delete">DELETE</a></div></li>';
		$('#todoItems').append(li);
	}else{
		var li = '<li><img class="filenames" src="'+ row.fileName +'" alt="" style="width:100%;height:auto"><div class="line"><div class="picGeo" src="geo.svg" data-lat="'+ row.geoLat +'" data-lon="'+row.geoLon+'"></div> <span class="todoText">'+row.text+'</span> <a href="#" data-path="'+row.timeStamp+'" class="delete">DELETE</a></div></li>';
		$('#todoItems').append(li);
	}
};

diary.indexedDB.deleteTodo = function(id) {
    var db = diary.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    var request = store.delete(id);

    trans.oncomplete = function(e) {
		diary.indexedDB.getAllTodoItems();  // Refresh the screen
    };

    request.onerror = function(e) {
		console.log(e);
    };
};

function getLoc(){
	$('#map-canvas').hide();
	$('#x').hide();
	if (localStorage.getItem("info") === null) {
		startGeo();
	}else if(localStorage.getItem("info") == "off"){
		var location = "none";
		addTodo(location);
	} else if(localStorage.getItem("info") == "yes"){
		startGeo();
	} 
};

function startGeo(){
	$('#loading').show();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onSuccess, onError,{timeout:10000});
		function onSuccess(position) {
			var lat =  position.coords.latitude ;    
			var lon = position.coords.longitude;
			addTodo(lat,lon);		
		}
		// onError Callback receives a PositionError object
		//
		function onError(error) {
			$('#loading').hide();
			var answer = confirm("No Geo location found, still take picture ?");
			if(answer == true){
				var lat =  "none";    
				var lon =  "none";
				addTodo(lat,lon);	
				var geoInfo = "off";
				localStorage.setItem( 'info', geoInfo );
				$('#geoIcon').removeClass('iconOn').addClass('iconOff');
			}else{
				var geoInfo = "off";
				localStorage.setItem( 'info', geoInfo );
				$('#geoIcon').removeClass('iconOn').addClass('iconOff');
			}
		}
	}else {
		var lat =  "none";    
		var lon =  "none";
		addTodo(lat,lon);
	}
};

function addTodo(lat,lon){
	console.log("addTodo has been ran ");
	$('#loading').hide(); //hides the loading gif
	navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    destinationType: Camera.DestinationType.DATA_URL
	});

	function onSuccess(imageData) {	
	    image = "data:image/jpeg;base64," + imageData;
		var todo = document.getElementById('todo');
		diary.indexedDB.addTodo(todo.value,image,lat,lon);
		todo.value = '';
	}

	function onFail(message) {
		alert('Failed because: ' + message);
	}
};

