// vim: set et ts=2 sw=2 :

function GPXFromFile (file, onHeader, onTrack, onWaypoint, onSector, onDone) {
  //GLog.write("GPXFromFile: begin");
  this.file = file;
  this.onHeader = onHeader;
  this.onTrack = onTrack;
  this.onWaypoint = onWaypoint;
  this.onSector = onSector;
  this.onDone = onDone;

  this.getFile = GPXFromFile.getFile;
  this.readHeader = GPX.readHeader;
  this.readTracks = GPX.readTracks;
  this.readWaypoints = GPX.readWaypoints;
  this.readSectors = GPX.readSectors;

  this.minLat = 54.24;
  this.minLon = 35.02;
  this.maxLat = 57.26;
  this.maxLon = 40.22;
  this.waypoints = [];
  this.tracks = [];
  this.sectors = [];

  if (typeof XMLHttpRequest != "undefined") {
    this.xhr = new XMLHttpRequest();
  } else {
    this.xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  var tmpvar = this;
  this.xhr.onreadystatechange = function () { tmpvar.getFile(); };
  this.xhr.open("GET", this.file);
  this.xhr.send(null);
  //GLog.write("GPXFromFile: end");
}

GPXFromFile.getFile = function () {
  if (this.xhr.readyState == 4) {
    //GLog.write("ParseString: begin");
    ShowStatus("Reading track...");
    if (this.xhr.status == 200)
    {
      this.xml = this.xhr.responseXML;
      var tmpvar = this;
      setTimeout(function () { tmpvar.readHeader(); }, 1);
    } else {
      var text = document.getElementById("text");
      text.appendChild(document.createTextNode("File "+this.file+" can't be downloaded: "+this.xhr.statusText));
      this.onHeader();
      this.onDone();
    }
    //GLog.write("ParseString: end");
  }
}

function GPXFromString (str, onHeader, onTrack, onWaypoint, onSector, onDone) {
  //GLog.write("GPXFromString: begin");
  this.onHeader = onHeader;
  this.onTrack = onTrack;
  this.onWaypoint = onWaypoint;
  this.onSector = onSector;
  this.onDone = onDone;

  this.readHeader = GPX.readHeader;
  this.readTracks = GPX.readTracks;
  this.readWaypoints = GPX.readWaypoints;
  this.readSectors = GPX.readSectors;

  this.minLat = 54.24;
  this.minLon = 35.02;
  this.maxLat = 57.26;
  this.maxLon = 40.22;
  this.waypoints = [];
  this.tracks = [];
  this.sectors = [];

  this.xml = GXml.parse(str).documentElement;
  var tmpvar = this;
  setTimeout(function () { tmpvar.readHeader(); }, 1);
  //GLog.write("GPXFromString: end");
}

//======================================

function GPX () {}

GPX.readHeader = function () {
  //GLog.write("readHeader: begin");
  ShowStatus("Showing map...");
  var xmlMetadata = this.xml.getElementsByTagName("metadata")[0];
  if (xmlMetadata == null)
    xmlMetadata = this.xml;
  this.name = getTextChild(xmlMetadata, "name");
  this.cmt = getXMLChild(xmlMetadata, "cmt");
  this.desc = getXMLChild(xmlMetadata, "desc");
  this.xdesc = getXMLChild(xmlMetadata, "xdesc");
  xmlBounds = xmlMetadata.getElementsByTagName("bounds")[0];
  if (xmlBounds != null) {
    var minlat = getFloatAttribute(xmlBounds, "minlat");
    var minlon = getFloatAttribute(xmlBounds, "minlon");
    var maxlat = getFloatAttribute(xmlBounds, "maxlat");
    var maxlon = getFloatAttribute(xmlBounds, "maxlon");
    if (minlat!=null && minlon!=null && maxlat!=null && maxlon!=null) {
      this.minLat = minlat;
      this.minLon = minlon;
      this.maxLat = maxlat;
      this.maxLon = maxlon;
    }
  }
  if (this.onHeader != null)
    setTimeout(this.onHeader, 1);
  var tmpvar = this;
  setTimeout(function () { tmpvar.readTracks(); }, 1);
  //GLog.write("readHeader: end");
}

function Track () {}

GPX.readTracks = function () {
  //GLog.write("readTracks: begin");
  var xmlTracks = this.xml.getElementsByTagName("trk");
  for (var i = 0; i < xmlTracks.length; i++) {
    var xmlTrack = xmlTracks[i];
    var track = new Track();
    track.color = getTextChild(xmlTrack, "xcolor");
    track.width = getIntChild(xmlTrack, "xwidth");
    track.opacity = getFloatChild(xmlTrack, "xopacity");
    track.name = getTextChild(xmlTrack, "name");
    track.cmt = getXMLChild(xmlTrack, "cmt");
    track.desc = getXMLChild(xmlTrack, "desc");
    track.xdesc = getXMLChild(xmlTrack, "xdesc");
    track.segments = [];

    var xmlTrackSegments = xmlTrack.getElementsByTagName("trkseg");
    for (var j = 0; j < xmlTrackSegments.length; j++) {
      var xmlTrackSegment = xmlTrackSegments[j];
      var xmlTrackSegmentCompressed = xmlTrackSegment.getElementsByTagName("xencoded")[0];
      if (/*xmlTrackSegmentCompressed != null*/0) {
        /*var points = getTextAttribute(xmlTrackSegmentCompressed, "points");
        var levels = getTextAttribute(xmlTrackSegmentCompressed, "levels");
        if (points!=null && levels!=null) {
          var trackSegment = new GPolyline.fromEncoded({points:points, levels:levels, zoomFactor:32, numLevels:4, color:track.color, weight:track.width, opacity:track.opacity});
          track.segments.push(trackSegment);
        }*/
      } else {
        var xmlTrackSegmentPoints = xmlTrackSegment.getElementsByTagName("trkpt");
        var trackSegmentPoints = [];
        for (var k = 0; k < xmlTrackSegmentPoints.length; k++) {
          var xmlTrackSegmentPoint = xmlTrackSegmentPoints[k];
          var lat = getFloatAttribute(xmlTrackSegmentPoint, "lat");
          var lon = getFloatAttribute(xmlTrackSegmentPoint, "lon");
          if (lat!=null && lon!= null) {
            var trackSegmentPoint = L.latLng(lat, lon);
            trackSegmentPoints.push(trackSegmentPoint);            
          }          
        }
        if (trackSegmentPoints.length != 0) {
          // var trackSegment = new GPolyline(trackSegmentPoints, track.color, track.width, track.opacity);
          var trackSegment = L.polyline(trackSegmentPoints, {color: 'magenta', opacity: 1.0});
          track.segments.push(trackSegment);
        }
      }
    }
    if (track.segments.length != 0) {
      this.tracks.push(track);
      if (this.onTrack != null)
        this.onTrack(track);        
    }
  }
  var tmpvar = this;
  setTimeout(function () { tmpvar.readWaypoints(); }, 1);
  //GLog.write("readTracks: end");
}

GPX.readWaypoints = function () {
  var _this = this;
  //GLog.write("readWaypoints: begin");
  var xmlWaypoints = this.xml.getElementsByTagName("wpt");
  for (var i = 0; i < xmlWaypoints.length; i++) (function() {
    var xmlWaypoint = xmlWaypoints[i];
    var lat = getFloatAttribute(xmlWaypoint, "lat");
    var lon = getFloatAttribute(xmlWaypoint, "lon");
    var ele = getFloatChild(xmlWaypoint, "ele");
    var time = getTextChild(xmlWaypoint, "time");
    var name = getTextChild(xmlWaypoint, "name");
    var cmt = getXMLChild(xmlWaypoint, "cmt");
    var desc = getXMLChild(xmlWaypoint, "desc");
    var xdesc = getXMLChild(xmlWaypoint, "xdesc");
    var sym = getTextChild(xmlWaypoint, "sym");
    if (lat!=null && lon!=null) {
      var waypoint = L.marker([lat, lon], {
        title: name,
        icon: SmallIcon
      });
      
      waypoint.lat = lat;
      waypoint.lon = lon;
      waypoint.ele = ele;
      waypoint.time = time;
      waypoint.name = name;
      waypoint.cmt = cmt;
      waypoint.desc = desc;
      waypoint.xdesc = xdesc;
      waypoint.sym = sym;
      waypoint.addedToRight = false;
      _this.waypoints.push(waypoint);
      //GEvent.addListener(waypoint, "click", function() { MouseClick(this); });
      //GEvent.addListener(waypoint, "mouseout", function() { MouseOut(this); });
      //GEvent.addListener(waypoint, "mouseover", function() { MouseOver(this); });
      waypoint.on('mouseover', function(event) {
        MouseOver(waypoint);
      })
    }
  })();
  
  var tmpvar = this;
  setTimeout(function () { tmpvar.readSectors(); }, 1);
  //GLog.write("readWaypoints: end");
}

function Sector () {}

GPX.readSectors = function () {
  //GLog.write("readSectors: begin");
  var xmlSectors = this.xml.getElementsByTagName("xsct");
  for (var i = 0; i < xmlSectors.length; i++) {
    var xmlSector = xmlSectors[i];
    var sector = new Sector();
    sector.name = getTextChild(xmlSector, "name");
    sector.cmt = getXMLChild(xmlSector, "cmt");
    sector.desc = getXMLChild(xmlSector, "desc");
    sector.xdesc = getXMLChild(xmlSector, "xdesc");
    sector.waypoints = [];
    var xmlRefWaypoints = xmlSector.getElementsByTagName("xwptref");
    for (var j = 0; j < xmlRefWaypoints.length; j++) {
      var xmlRefWaypoint = xmlRefWaypoints[j];
      var name = getTextAttribute(xmlRefWaypoint, "name");
      var waypoint = findWaypoint(this.waypoints, name);
      waypoint.addedToRight = true;
      sector.waypoints.push(waypoint);
    }
    if (sector.waypoints.length != 0) {
      this.sectors.push(sector);
      if (this.onSector != null)
        this.onSector(sector);        
    }
  }

  if (this.onWaypoint != null) {
    for (var i = 0; i < this.waypoints.length; i++) {
      var waypoint = this.waypoints[i];
      if (waypoint.addedToRight == false)
        this.onWaypoint(waypoint);        
    }
  }

  delete this.xml;
  this.xml = undefined;
  if (this.onDone != null)
    setTimeout(this.onDone, 1000);
  //GLog.write("readSectors: end "+this.sectors.length);
}

//======================================

function showSector (sector) {
  var name = sector.name;
  var xmldesc = null;
  if (sector.cmt != null)
    xmldesc = sector.cmt;
  else if (sector.desc != null)
    xmldesc = sector.desc;
  else if (sector.xdesc != null)
    xmldesc = sector.xdesc;

  //var docTrack = parent.description.document;
  var p = document.createElement("p");
  var b = document.createElement("b");
  var u = document.createElement("u");
  if (xmldesc != null)
    xml2html(xmldesc, document, u);
  else if (name != null)
    u.appendChild(document.createTextNode(name));
  b.appendChild(u);
  p.appendChild(b);
  p.appendChild(document.createElement("br"));

  for (var i = 0; i < sector.waypoints.length; i++) {
    var waypoint = sector.waypoints[i];
    var name = waypoint.name;
    var xmldesc = null;
    if (waypoint.cmt != null)
      xmldesc = waypoint.cmt;
    else if (waypoint.desc != null)
      xmldesc = waypoint.desc;
    else if (waypoint.xdesc != null)
      xmldesc = waypoint.xdesc;

    var a = document.createElement("a");
    var b = document.createElement("b");
    if (name != null)
      b.appendChild(document.createTextNode(name));
    a.setAttribute("href", "javascript:;");
    a.waypoint = waypoint;
    waypoint.aElement = p;
    a.appendChild(b);
    p.appendChild(a);
    if (xmldesc!=null) {
      p.appendChild(document.createTextNode(": "));
      xml2html(xmldesc, document, p);
    }
    p.appendChild(document.createElement("br"));

    a.onclick = function () { MouseClick(this.waypoint); };
    a.onmouseout = function () { MouseOut(this.waypoint);};
    a.onmouseover = function () { MouseOver(this.waypoint);};
  }
  document.getElementById("description").appendChild(p);
}

function showTrack (track) {
  var name = track.name;
  var xmldesc = null;
  if (track.cmt != null)
    xmldesc = track.cmt;
  else if (track.desc != null)
    xmldesc = track.desc;
  else if (track.xdesc != null)
    xmldesc = track.xdesc;
  var color = track.color;

  // var docTrack = parent.description.document;
  var p = document.createElement("div");
  var b = document.createElement("b");
  var font = document.createElement("font");
  if (color != null)
    font.setAttribute("color", color);
  font.appendChild(document.createTextNode("\u25AC\u25AC "))
  b.appendChild(font);
  b.appendChild(document.createTextNode(name));
  p.appendChild(b);
  if (xmldesc != null) {
    p.appendChild(document.createTextNode(": "));
    xml2html(xmldesc, document, p);
  }
  document.getElementById("description").appendChild(p);
}

function showWaypoint (waypoint) {
  var name = waypoint.name;
  var xmldesc = null;
  if (waypoint.cmt != null)
    xmldesc = waypoint.cmt;
  else if (waypoint.desc != null)
    xmldesc = waypoint.desc;
  else if (waypoint.xdesc != null)
    xmldesc = waypoint.xdesc;
   
  // var docTrack = parent.description.document;
  var p = document.createElement("div");
  var a = document.createElement("a");
  var b = document.createElement("b");
  if (name != null)
    b.appendChild(document.createTextNode(name));
  a.setAttribute("href", "javascript:;");
  a.waypoint = waypoint;
  waypoint.aElement = p;
  a.appendChild(b);
  p.appendChild(a);
  if (xmldesc!=null) {
    p.appendChild(document.createTextNode(": "));
    xml2html(xmldesc, document, p);
  }
  p.appendChild(document.createElement("br"));
  document.getElementById("description").appendChild(p);

  GEvent.addDomListener(a, "click", function () { MouseClick(this.waypoint); });
  GEvent.addDomListener(a, "mouseout", function () { MouseOut(this.waypoint);});
  GEvent.addDomListener(a, "mouseover", function () { MouseOver(this.waypoint);});
}

//======================================

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

var k = 0;

function findWaypoint (waypoints, name) {
  var length = waypoints.length;
  var i;
  for (i = k; i < length; i++)
  {
    var waypoint = waypoints[i];
    if (waypoint.name == name) {
      k = i;
      return waypoint;
    }
  }
  for (i = 0; i < k; i++)
  {
    var waypoint = waypoints[i];
    if (waypoint.name == name) {
      k = i;
      return waypoint;
    }
  }
  GLog.write("error?");
}

//======================================

function getXMLChild (xmlObj, name) {
  return xmlObj.getElementsByTagName(name)[0];
}

function getTextChild (xmlObj, name) {
  var xmlChild = getXMLChild(xmlObj, name);
  if (xmlChild != null) {
    var xmlFirstChild = xmlChild.firstChild;
    if (xmlFirstChild != null) {
      var value = xmlFirstChild.nodeValue;
      if (value != null)
        return value;
    }
  }
  return null;
}

function getIntChild (xmlObj, name) {
  var text = getTextChild(xmlObj, name);
  if (text != null) {
    var value = parseInt(text);
    if (isFinite(value))
      return value;
  }
  return null;
}

function getFloatChild (xmlObj, name) {
  var text = getTextChild(xmlObj, name);
  if (text != null) {
    var value = parseFloat(text);
    if (isFinite(value))
      return value;
  }
  return null;
}

function getTextAttribute (xmlObj, name) {
  return xmlObj.getAttribute(name);
}

function getFloatAttribute (xmlObj, name) {
  var text = getTextAttribute(xmlObj, name);
  if (text != null) {
    var value = parseFloat(text);
    if (isFinite(value))
      return value;
  }
  return null;
}

//======================================

SmallIcon = L.icon({
    iconUrl: "treks/gmap/icons/marker.png",
    iconSize: [13, 23],
    iconAnchor: [6, 23]
});

/*SmallIcon = new GIcon(G_DEFAULT_ICON);
SmallIcon.image = "http://turpohod.narod.ru/treks/gmap/icons/marker.png";
SmallIcon.iconSize = new GSize(13, 23);
SmallIcon.shadow = null;
SmallIcon.shadowSize = new GSize(0, 0);
SmallIcon.iconAnchor = new GPoint(6, 23);*/