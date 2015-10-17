// vim: set et ts=2 sw=2 :

var map;
var data;

var mapType;
var showTracks = true;
var showWaypoints = true;

function Main () {
    var arg = location.search;
    
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
        
      mapType = mtype.toLowerCase();
    }

    data = new GPXFromFile(file, ShowMapA, showTrack, showWaypoint, showSector, ShowMapB);
}

function ShowMapA () {
  //GLog.write("ShowMapA: begin");
  if (data.name != null) {
      document.title = data.name;
  }

  map = L.map('map');
  map.fitBounds([[data.minLat, data.minLon], [data.maxLat, data.maxLon]]);
  
  var dummyLayer = {
    onAdd: function(){},
    onRemove: function(){}
  };
  
  var baseLayers =  {
    sla: L.tileLayer('http://aparshin.ru/maps/slazav/{z}/{x}/{y}.png'),
    arb: L.tileLayer('http://s3.amazonaws.com/arbalet/z{z}/{y}_{x}.png'),
    osm: dummyLayer
  }
  
  mapType = mapType in baseLayers ? mapType : 'arb';
  map.addLayer(baseLayers[mapType]);
  
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  L.control.layers({
    Slazav: baseLayers.sla,
    Arbalet: baseLayers.arb,
    OSM: baseLayers.osm
  }, {}, {collapsed: false}).addTo(map);
  
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
