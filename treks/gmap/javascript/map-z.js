// vim: set et ts=2 sw=2 :

var map;
var data;

var mapType = "arb";
var showTracks = true;
var showWaypoints = true;

function Main () {
    var arg = location.search;
    
    var updateMapHeight = function() {
        var mapDiv = document.getElementById('map'),
            //infoHeight = document.getElementById('inforow').clientHeight,
            infoHeight = 0,
            iehelpHeight = document.getElementById('iehelpDv') ? document.getElementById('iehelpDv').clientHeight : 0; 
        mapDiv.style.height = (document.getElementsByTagName('body')[0].clientHeight - infoHeight - iehelpHeight - 10) + 'px';
    }
    
    // updateMapHeight();
    // window.onresize = updateMapHeight;
    
    var file = "data.xml";
    var n = arg.search(/[?&]src=/gi);
    if (n != -1) {
      file = arg.substr(n+5);
      n = file.search(/&/gi);
      if (n != -1)
        file = file.substring(0,n);
    }

    n = arg.search(/[?&]nowaypoints/gi);
    if (n != -1)
      showWaypoints = false;
    n = arg.search(/[?&]notracks/gi);
    if (n != -1)
      showTracks = false;
    n = arg.search(/[?&]maptype=/gi);
    if (n != -1) {
      var mtype = arg.substr(n+9);
      n = mtype.search(/&/gi);
      if (n != -1)
        mtype = mtype.substring(0,n);
      if (mtype.toLowerCase() == "map")
        mapType = G_NORMAL_MAP;
      else if (mtype.toLowerCase() == "sat")
        mapType = G_SATELLITE_MAP;
      else if (mtype.toLowerCase() == "hyb")
        mapType = G_HYBRID_MAP;
      else if (mtype.toLowerCase() == "arb")
        mapType = "arb";
    }

    data = new GPXFromFile(file, ShowMapA, showTrack, showWaypoint, showSector, ShowMapB);
}

function ShowMapA () {
  //GLog.write("ShowMapA: begin");
  if (data.name != null) {
      document.title = data.name;
  }
  map = L.map('map');
  //map = new GMap2(document.getElementById("map"));
  //map.addControl(new GLargeMapControl());
  //map.addControl(new GMapTypeControl());
  _mPreferMetric = true;
  //map.addControl(new GScaleControl());

  map.fitBounds([[data.minLat, data.minLon], [data.maxLat, data.maxLon]]);
  //var zoom = map.getBoundsZoomLevel(new GLatLngBounds(new GLatLng(data.minLat,data.minLon),new GLatLng(data.maxLat,data.maxLon)));
  //map.setCenter(new GLatLng((data.minLat+data.maxLat)/2,(data.minLon+data.maxLon)/2), zoom);
  
  var slazav = L.tileLayer('http://aparshin.ru/maps/slazav/{z}/{x}/{y}.png');
  var arbalet = L.tileLayer('http://s3.amazonaws.com/arbalet/z{z}/{y}_{x}.png').addTo(map);
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  L.control.layers({Slazav: slazav, Arbalet: arbalet}, {}, {collapsed: false}).addTo(map);
  
  /*map.enableContinuousZoom();
  map.enableScrollWheelZoom();
  var arbaletMap = GetArbaletMap();
  map.addMapType(arbaletMap);
  var slazavMap = GetArbaletSlazavMap();
  map.addMapType(slazavMap);
  map.removeMapType(G_NORMAL_MAP);
  map.removeMapType(G_SATELLITE_MAP)
  map.removeMapType(G_HYBRID_MAP);
  map.addMapType(G_SATELLITE_MAP)
  map.addMapType(G_HYBRID_MAP);
  map.addMapType(G_NORMAL_MAP);
  map.addMapType(G_PHYSICAL_MAP);
  arbaletMap.getName = function (a) { return a ? 'Arb' : 'Arbalet'; };
  arbaletMap.getAlt = function () { return 'Show Arbalet topography map'; };
  slazavMap.getName = function (a) { return a ? 'Sla' : 'Slazav'; };
  slazavMap.getAlt = function () { return 'Show Slazav topography map'; };
  G_NORMAL_MAP.getName = function (a) { return 'Map'; };
  G_NORMAL_MAP.getAlt = function () { return 'Show street map'; };
  G_SATELLITE_MAP.getName = function (a) { return a ? 'Sat' : 'Satellite'; };
  G_SATELLITE_MAP.getAlt = function () { return 'Show satellite imagery'; };
  G_HYBRID_MAP.getName = function (a) { return a ? 'Hyb' : 'Hybrid'; };
  G_HYBRID_MAP.getAlt = function () { return 'Show imagery with street names'; };
  G_PHYSICAL_MAP.getName = function (a) { return a ? 'Ter' : 'Terrain'; };
  G_PHYSICAL_MAP.getAlt = function () { return 'Show street map with terrain'; };
  map.setMapType(mapType == "arb" ? arbaletMap : mapType);
  map.addControl(new PanoramioControl());
  map.addControl(new WikimapiaControl());*/
  
  var name = data.name;
  var xmldesc = null;
  if (data.cmt != null)
    xmldesc = data.cmt;
  else if (data.desc != null)
    xmldesc = data.desc;
  else if (data.xdesc != null)
    xmldesc = data.xdesc;
  var docTrack = document.getElementById("description");
  var h2 = document.createElement("h2");
  if (xmldesc != null)
    xml2html(xmldesc, document, h2);
  else
    h2.appendChild(document.createTextNode(name));
  docTrack.appendChild(h2);
 
  //GLog.write("ShowMapA: end");
}

function ShowMapB () {
  //GLog.write("ShowMapB: begin");
  document.getElementById("trackcheckbox").checked = showTracks;
  TrackCheckBox();
  document.getElementById("waypointscheckbox").checked = showWaypoints;
  WaypointsCheckBox();
  ShowStatus("Done");
  //GLog.write("ShowMapB: end");
}

function ShowStatus (str) {
    status = str;
}

//======================================

function TrackCheckBox () {
  if (document.getElementById("trackcheckbox").checked)
    for (var i = 0; i < data.tracks.length; i++)
    {
      var track = data.tracks[i];
      for (var j = 0; j < track.segments.length; j++)
        map.addLayer(track.segments[j]);
    }
  else
    for (var i = 0; i < data.tracks.length; i++)
    {
      var track = data.tracks[i];
      for (var j = 0; j < track.segments.length; j++)
        map.removeLayer(track.segments[j]);
    }
}

function WaypointsCheckBox () {
  if (document.getElementById("waypointscheckbox").checked) {
    for (var i = 0; i < data.waypoints.length; i++)
      map.addLayer(data.waypoints[i]);
    if (BigIcon.gMarker != null) {
      map.removeLayer(BigIcon.gMarker);
      map.addLayer(BigIcon.gMarker);
    }
  } else
    for (var i = 0; i < data.waypoints.length; i++)
      map.removeLayer(data.waypoints[i]);
}

var userdata;

function UserDataCheckBox () {
  if (userdata==null || userdata==undefined)
    return;
  if (document.getElementById("userdatacheckbox").checked) {
    for (var i = 0; i < userdata.tracks.length; i++)
    {
      var track = userdata.tracks[i];
      for (var j = 0; j < track.segments.length; j++)
        map.addOverlay(track.segments[j]);
    }
    for (var i = 0; i < userdata.waypoints.length; i++)
      map.addOverlay(userdata.waypoints[i]);
    if (BigIcon.gMarker != null) {
      map.removeOverlay(BigIcon.gMarker);
      map.addOverlay(BigIcon.gMarker);
    }
  } else {
    for (var i = 0; i < userdata.tracks.length; i++)
    {
      var track = userdata.tracks[i];
      for (var j = 0; j < track.segments.length; j++)
        map.removeOverlay(track.segments[j]);
    }
    for (var i = 0; i < userdata.waypoints.length; i++)
      map.removeOverlay(userdata.waypoints[i]);
  }
}

function UserDataLink () {
  removeBigIcon();
  var td = document.getElementById("text");
  var b = document.createElement("b");
  var textarea = document.createElement("textarea");
  var input = document.createElement("input");
  b.appendChild(document.createTextNode("Paste content of GPX-file here:"));
  td.appendChild(b);
  td.appendChild(document.createElement("br"));
  textarea.setAttribute("id", "string");
  textarea.setAttribute("style", "width: 100%");
  td.appendChild(textarea);
  input.setAttribute("type", "button");
  input.setAttribute("value", "Load");
  GEvent.addDomListener(input, "click", LoadString);

  td.appendChild(input);
}

function ShowUserData () {
  document.getElementById("userdatacheckbox").checked = true;
  UserDataCheckBox();
}

function LoadString() {
  var str = document.getElementById("string").value;
  removeBigIcon();
  document.getElementById("userdatacheckbox").checked = false;
  UserDataCheckBox();
  userdata = new GPXFromString(str, null, null, null, null, ShowUserData);
}

//======================================

function removeBigIcon () {
  var td = document.getElementById("text");
  while (td.firstChild != null)
    td.removeChild(td.firstChild);
  if (BigIcon.gMarker != null) {
    map.removeLayer(BigIcon.gMarker);
    // delete BigIcon.gMarker;
    BigIcon.gMarker = null;
  }
}

function addBigIcon (waypoint) {
  BigIcon.gMarker = new L.marker(waypoint.getLatLng(), {title: waypoint.name, icon: BigIcon});
  map.addLayer(BigIcon.gMarker);
  BigIcon.gMarker.waypoint = waypoint;
  BigIcon.gMarker.on("click", function() {
    MouseClick(this.waypoint); 
    if (this.waypoint.aElement) 
        this.waypoint.aElement.scrollIntoView();
  });
  
  var b = document.createElement("b");
  b.appendChild(document.createTextNode(waypoint.name));
  var td = document.getElementById("text");
  td.appendChild(b);
  td.appendChild(document.createTextNode(" (WGS84: lat: "+waypoint.lat+"\u00B0, lon: "+waypoint.lon+"\u00B0"));
  if (waypoint.ele)
    td.appendChild(document.createTextNode(", ele: "+waypoint.ele+"m"));
  td.appendChild(document.createTextNode(")"));
  td.appendChild(document.createElement("br"));
  var xmldesc = null;
  if (waypoint.xdesc != null)
    xmldesc = waypoint.xdesc;
  else if (waypoint.desc != null)
    xmldesc = waypoint.desc;
  else if (waypoint.cmt != null)
    xmldesc = waypoint.cmt;
  xml2html(xmldesc, document, td);
}

function xml2html(xml, doc, html) {
  var childs = xml.childNodes;
  for (var i = 0; i < childs.length; i++) {
    var child = childs[i];
    var name = child.nodeName;
    if (name == "#text") {
      html.appendChild(doc.createTextNode(child.nodeValue));
    } else {
      /* TODO */
      var htmlChild = doc.createElement(name);
      xml2html(child, doc, htmlChild);
      html.appendChild(htmlChild);
    }
  }
}

function MouseClick (waypoint) {
  removeBigIcon();
  addBigIcon(waypoint);
  BigIcon.prevWaypoint = waypoint;
  //if (map.getZoom() == 14)
    map.panTo(waypoint.getLatLng());
  //else
  //  map.setCenter(waypoint.getPoint(), 14);
}

function MouseOut () {
  removeBigIcon();
  if (BigIcon.prevWaypoint != null)
    addBigIcon(BigIcon.prevWaypoint);
}

function MouseOver (waypoint) {
  removeBigIcon();
  addBigIcon(waypoint);
  BigIcon.gMarker.on("mouseout", MouseOut);
}

BigIcon = L.icon({
    iconUrl: "treks/gmap/icons/marker2.png",
    iconSize: [13, 23],
    iconAnchor: [6, 23]
});

/*BigIcon.image = "icons/marker2.png";
BigIcon.iconSize = new GSize(13, 23);
BigIcon.shadow = null;
BigIcon.shadowSize = new GSize(0, 0);
BigIcon.iconAnchor = new GPoint(6, 23);
BigIcon.gMarker = null;
BigIcon.prevWaypoint = null;*/

//======================================

centerIcon = L.icon({
    iconUrl: "treks/gmap/icons/center.png",
    iconSize: [13, 23],
    iconAnchor: [11, 12]
});

/*centerIcon.image = "http://turpohod.narod.ru/treks/gmap/icons/center.png";
centerIcon.iconSize = new GSize(23, 23);
centerIcon.iconAnchor = new GPoint(11, 12);
centerMarker = null;*/

function CenterMap () {
  return;
  var lat = parseFloat(document.getElementById("lat").value);
  var lon = parseFloat(document.getElementById("lon").value);
  if (isFinite(lat) && isFinite(lat))
  {
    var point = new GLatLng(lat, lon);
    map.setCenter(point, 14);
    if (centerMarker == null)
    {
      centerMarker = new GMarker(new GLatLng(lat, lon), centerIcon);
      map.addOverlay(centerMarker);
    }
    else
      centerMarker.setPoint(point);
  }
}

//======================================

        /*function PanoramioControl() {}
        PanoramioControl.prototype = new GControl();
        PanoramioControl.prototype.initialize = function(map) {
          var panoDiv = document.createElement("div");
          panoDiv.style.color = "black";
          panoDiv.style.backgroundColor = "white";
          panoDiv.style.font = "small Arial";
          panoDiv.style.border = "1px solid black";
          panoDiv.style.padding = "0px";
          panoDiv.style.textAlign = "center";
          panoDiv.style.fontSize = "12px";
          panoDiv.style.cursor = "pointer";
          panoDiv.style.width = "7.2em";
          var panoDiv1 = document.createElement("div");
          panoDiv.appendChild(panoDiv1);
          panoDiv1.style.padding = "1px";
          panoDiv1.style.border = "1px solid white";
          panoDiv1.style["borderBottom"] = "1px solid #b0b0b0";
          panoDiv1.style["borderRight"] = "1px solid #b0b0b0";
          panoDiv1.appendChild(document.createTextNode("Panoramio"));

          var pano = new GGeoXml("http://www.panoramio.com/kml.php");
          pano.flag = false;

          GEvent.addDomListener(panoDiv, "click", function() {
              if (! pano.flag) {
                map.addOverlay(pano);
                pano.flag = true;
                panoDiv.style.fontWeight = "bold";
                panoDiv1.style.border = "1px solid white";
                panoDiv1.style["borderTop"] = "1px solid #b0b0b0";
                panoDiv1.style["borderLeft"] = "1px solid #b0b0b0";
              } else {
                map.removeOverlay(pano);
                pano.flag = false;
                panoDiv.style.fontWeight = "";
                panoDiv1.style.border = "1px solid white";
                panoDiv1.style["borderBottom"] = "1px solid #b0b0b0";
                panoDiv1.style["borderRight"] = "1px solid #b0b0b0";
              }
              });

          map.getContainer().appendChild(panoDiv);
          return panoDiv;
        }
        PanoramioControl.prototype.getDefaultPosition = function() {
          return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(80, 7));
        }

//======================================

        function WikimapiaControl() {}
        WikimapiaControl.prototype = new GControl();
        WikimapiaControl.prototype.initialize = function(map) {
          var panoDiv = document.createElement("div");
          panoDiv.style.color = "black";
          panoDiv.style.backgroundColor = "white";
          panoDiv.style.font = "small Arial";
          panoDiv.style.border = "1px solid black";
          panoDiv.style.padding = "0px";
          panoDiv.style.textAlign = "center";
          panoDiv.style.fontSize = "12px";
          panoDiv.style.cursor = "pointer";
          panoDiv.style.width = "7.2em";
          var panoDiv1 = document.createElement("div");
          panoDiv.appendChild(panoDiv1);
          panoDiv1.style.padding = "1px";
          panoDiv1.style.border = "1px solid white";
          panoDiv1.style["borderBottom"] = "1px solid #b0b0b0";
          panoDiv1.style["borderRight"] = "1px solid #b0b0b0";
          panoDiv1.appendChild(document.createTextNode("Wikimapia"));

          var pano = new GGeoXml("http://wikimapia.org/ge.kml");
          pano.flag = false;

          GEvent.addDomListener(panoDiv, "click", function() {
              if (! pano.flag) {
                map.addOverlay(pano);
                pano.flag = true;
                panoDiv.style.fontWeight = "bold";
                panoDiv1.style.border = "1px solid white";
                panoDiv1.style["borderTop"] = "1px solid #b0b0b0";
                panoDiv1.style["borderLeft"] = "1px solid #b0b0b0";
              } else {
                map.removeOverlay(pano);
                pano.flag = false;
                panoDiv.style.fontWeight = "";
                panoDiv1.style.border = "1px solid white";
                panoDiv1.style["borderBottom"] = "1px solid #b0b0b0";
                panoDiv1.style["borderRight"] = "1px solid #b0b0b0";
              }
              });

          map.getContainer().appendChild(panoDiv);
          return panoDiv;
        }
        WikimapiaControl.prototype.getDefaultPosition = function() {
          return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(80, 34));
        }
*/

function GPXDataLink () {
    var arg = location.search;
    var file = "data.xml";
    var n = arg.search(/[?&]src=/gi);
    if (n != -1) {
      file = arg.substr(n+5);
      n = file.search(/&/gi);
      if (n != -1)
        file = file.substring(0,n);
    }
    location.href = file;
}

function OZIDataLink () {
    var arg = location.search;

    var file = "data.xml";
    var n = arg.search(/[?&]src=/gi);
    if (n != -1) {
      file = arg.substr(n+5);
      n = file.search(/&/gi);
      if (n != -1)
        file = file.substring(0,n);
    }
    n = file.lastIndexOf(".xml");
	   if (n >= 0) {
	  	  file=new String(file.substring(0,n)+".zip");
	   }
    location.href = file;
}

function UpDataLink () {
    var arg = location.search;

    var file = "data.xml";
    var n = arg.search(/[?&]src=/gi);
    if (n != -1) {
      file = arg.substr(n+5);
      n = file.search(/&/gi);
      if (n != -1)
        file = file.substring(0,n);
    }
    n = file.lastIndexOf("/");
	   if (n >= 0) {
	  	  file=new String(file.substring(0,n)+"/index.htm");
	   }
    location.href = file;
}
