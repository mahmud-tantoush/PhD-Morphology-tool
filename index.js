//base map
mapboxgl.accessToken = 'pk.eyJ1IjoibWFobXVkdGFudG91c2giLCJhIjoiY2s3YXBsbWFuMTJsNDNmcGY3a2JtbjJ1YyJ9.C36ZOFTK74nfQnpqzE-xjw';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mahmudtantoush/ck7s1j6pj30t71ijgh3o6qxde', // stylesheet location
    center: [-2.250,53.451], // starting position [lng, lat]
    zoom: 14, // starting zoom
    minZoom: 13,
    maxZoom: 18,
    hash: true
});

//navigation toggle
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

//layers toggle
var toggleableLayerIds = ['Buildings_sj89','gmuhlc-Landuse','tweetsHm','tweets']
for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
        
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;
        
    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
        
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };
        
    var layers = document.getElementById('layersMenu');
    layers.appendChild(link);
}

//feature query pop up
map.on('click', function (event){
    console.log('Mouse Clicked');
    console.log(event.point);
    var geometry = event.point;
    var parameters = {
        layers: (toggleableLayerIds.slice(0, 2))
    }
    var features = map.queryRenderedFeatures(geometry,parameters); //query viewd on page 
    console.log(features);
    //console.log(features.length + "features");
    var selected = features[0];
    var selected1 = features[features.length-1];
    //console.log(selected,selected1)

    //console.log(lot);
    if(features.length > 0){
        var selectedProp = selected.properties.mean || '-';
        var selected1Prop = selected1.properties.BROADTYPE ||'-';

        var popup = new mapboxgl.Popup()
            .setLngLat(event.lngLat)
            .setHTML("<dl>"+
                "<dt>Building Height: </dt><dd>" + selectedProp + "</dd>" +
                "<dt>Land Use: </dt><dd>" + selected1Prop + "</dd>" )
            .addTo(map);
    }
})

// filter tweets function
var hours = []
for(var i = 1; i < 25; i++) {hours.push(i)}
function filterBy(hour) {
    var filters = ['>', 'hour', hours];
    map.setFilter('tweets', filters);
}
document.getElementById('slider')
    .addEventListener('input', function(e) {
        var hour = parseInt(e.target.value, 10);
        filterBy(hour);
        console.log(hour)
    });

// draw area
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});
map.addControl(draw,"top-left");
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);   
function updateArea(e) {
    var data = draw.getAll();
    var answer = document.getElementById('calculated-area');
    if (data.features.length > 0) {
        var area = turf.area(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
        answer.innerHTML =
        '<p><strong>' +
        rounded_area + "Sqm"
        '</strong></p>';
    } else {
        answer.innerHTML = '';
        if (e.type !== 'draw.delete')
        alert('Use the draw tools to draw a polygon!');
    }
}

// change cursor
map.on('mousemove',function(event){ 
    if(map.loaded()){
        var features = map.queryRenderedFeatures(event.point, {layers: toggleableLayerIds});
        map.getCanvas().style.cursor= features.length ? 'pointer' : ''; //conditional operator
        }
    });