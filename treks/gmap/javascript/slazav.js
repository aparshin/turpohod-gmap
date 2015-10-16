// vim: set et ts=2 sw=2 :

function CustomGetRelTileUrl (prefix, a, b) {
  if ( b == 7 && a.x >= 76 && a.x <= 78 && a.y >= 39 && a.y <= 40 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 8 && a.x >= 153 && a.x <= 156 && a.y >= 78 && a.y <= 81 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 9 && a.x >= 307 && a.x <= 312 && a.y >= 157 && a.y <= 163 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 10 && a.x >= 614 && a.x <= 625 && a.y >= 314 && a.y <= 326 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 11 && a.x >= 1228 && a.x <= 1251 && a.y >= 629 && a.y <= 652 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 12 && a.x >= 2457 && a.x <= 2503 && a.y >= 1258 && a.y <= 1305 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 13 && a.x >= 4915 && a.x <= 5006 && a.y >= 2516 && a.y <= 2610 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
  else if ( b == 14 && a.x >= 9830 && a.x <= 10013 && a.y >= 5033 && a.y <= 5221 )
  {
    return prefix + "Z" + b + "/" + a.y + "_" + a.x + ".png";
  }
}

var G_SLAZAV_MAP = null;
var G_ARBALET_SLAZAV_MAP = null;

function GetSlazavMap () {
  if (G_SLAZAV_MAP == null) {
    var prefixSlazav = 'http://aparshin.ru/maps/slazav/';
    var slazavLayer = new GTileLayer(new GCopyrightCollection('Slazav'), 0, 14, { isPng:true, opacity:1 });
    slazavLayer.getTileUrl = function (a, b) { return CustomGetRelTileUrl(prefixSlazav, a, b); };
    G_SLAZAV_MAP = new GMapType([G_NORMAL_MAP.getTileLayers()[0], slazavLayer], new GMercatorProjection(22), 'Slazav', { textColor:'black', maxResolution:14 });
  }
  return G_SLAZAV_MAP;
}

function GetArbaletSlazavMap () {
  if (G_ARBALET_SLAZAV_MAP == null) {
    G_ARBALET_SLAZAV_MAP = new GMapType([GetArbaletMap().getTileLayers()[0], GetSlazavMap().getTileLayers()[1]], new GMercatorProjection(22), 'Arbalet, Slazav', { textColor:'black' });
  }
  return G_ARBALET_SLAZAV_MAP;
}
