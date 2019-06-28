inlets = 3;
outlets = 3;

mgraphics.init();
mgraphics.relative_coords = 1;
mgraphics.autofill = 0;


var g_val = 0;
var g_min = 0;
var g_max = 0;
var g_ar  = getAr();
var g_mode = 0;




// painting and output
function paint() {
  draw_grid();
  draw_val();
  draw_min();
  draw_max();

  output();
}


function draw_grid() {
  with(mgraphics) {
    // 色
    set_source_rgba(0, 0, 0, 0.2);

    // 横線
    move_to(-g_ar, 0);
    line_to(g_ar, 0);

    // グリッド線
    for(var i=1; i<=4; i++) {
      move_to(-g_ar*i*0.1, 0.23);
      line_to(-g_ar*i*0.1, -0.23);
      move_to(g_ar*i*0.1, 0.23);
      line_to(g_ar*i*0.1, -0.23);
    }

    for(var i=6; i<=9; i++) {
      move_to(-g_ar*i*0.1, 0.23);
      line_to(-g_ar*i*0.1, -0.23);
      move_to(g_ar*i*0.1, 0.23);
      line_to(g_ar*i*0.1, -0.23);
    }

    move_to(-g_ar*0.5, 0.618);
    line_to(-g_ar*0.5, -0.618);
    move_to(g_ar*0.5, 0.618);
    line_to(g_ar*0.5, -0.618);

    move_to(-g_ar, 1);
    line_to(-g_ar, -1);
    move_to(g_ar, 1);
    line_to(g_ar, -1);

    move_to(0, 1);
    line_to(0, -1);

    stroke();
  }
}
draw_grid.local = 1;


function draw_val() {
  with(mgraphics) {
    set_source_rgba(0, 0, 0, 0.8);
    move_to(g_val*g_ar, 0.618);
    line_to(g_val*g_ar, -0.618);
    stroke();
  }
}
draw_val.local = 1;


function draw_min() {
  with(mgraphics) {
    set_source_rgba(0, 0, 0, 0.1);
    rectangle(g_min*g_ar, 0.618, g_val*g_ar - g_min*g_ar, 1.236);
    fill();
  }
}
draw_min.local = 1;


function draw_max() {
  with(mgraphics) {
    set_source_rgba(0, 0, 0, 0.1);
    rectangle(g_val*g_ar, 0.618, g_max*g_ar - g_val*g_ar, 1.236);
    fill();
  }
}
draw_max.local = 1;




// mouse interaction
function ondrag(_x, _y, _but, _mod1, _shift) {

  var active = _but;
  var flag = _shift;

  if(active==1) {
    var pos = sketch.screentoworld(_x, _y);
    var x   = pos[0]*(1/g_ar);

    switch(flag) {
      case 0: ondrag_val(x);  break;
      case 1: ondrag_mm(x);   break;
    }
  }
  mgraphics.redraw();
}


function onclick(_x, _y, _but, _mod1, _shift) {
  ondrag(_x, _y, _but, _mod1, _shift);
}


function ondrag_val(_x) {
  var sa1 = g_val - g_min;
  var sa2 = g_max - g_val;

  g_val = _x;
  g_min = _x - sa1;
  g_max = _x + sa2;
}
ondrag_val.local = 1;


function ondrag_mm(_x) {
  if      (g_val<_x && _x<=1)  g_max = _x;
  else if (_x<g_val && -1<=_x) g_min = _x;
  else if (1<g_val)         g_max = 1;
  else if (g_val<-1)        g_min = -1;
}
ondrag_mm.local = 1;




// calculation and output of aspect ratio
function  getAr() {
  var ar = (this.box.rect[2]-this.box.rect[0]) / (this.box.rect[3]-this.box.rect[1]);
  post(ar + "\n");
  return ar;
}
getAr.local = 1;


function onresize(_x, _y) {
  g_ar = getAr();
}




// output
function output() {
  var min = g_min;
  var val = g_val;
  var max = g_max;

  switch(g_mode) {
    case 0:
    if(min<-1)      min = -1;
    else if (1<min) min = 1;

    if(val<-1)      val = -1;
    else if (1<val) val = 1;

    if(max<-1)      max = -1;
    else if (1<max) max = 1;
    break;

    case 1:
    min = (min+1)/2;
    val = (val+1)/2;
    max = (max+1)/2;

    if(min<0)      min = 0;
    else if (1<min) min = 1;

    if(val<0)      val = 0;
    else if (1<val) val = 1;

    if(max<0)      max = 0;
    else if (1<max) max = 1;
    break;

    default:
    break;
  }

  outlet(0, min);
  outlet(1, val);
  outlet(2, max);
}
output.local = 1;


// clear
function clear() {
  if(g_mode==0) {
    g_min = 0;
    g_val = 0;
    g_max = 0;
  } else {
    g_min = -1;
    g_val = -1;
    g_max = -1;
  }

  output();
  mgraphics.redraw();
}




// /msg_float
function msg_float(_v) {
  switch(this.inlet) {
    case 0:
    msg_float_min(_v);
    break;

    case 1:
    msg_float_val(_v);
    break;

    case 2:
    msg_float_max(_v);
    break;
  }

  mgraphics.redraw();
}


function msg_float_min(_v) {
  if(_v<g_min)  g_min = _v;
  else          g_min = g_val;
}
msg_float_min.local = 1;


function msg_float_val(_v) {
  var sa1 = g_val - g_min;
  var sa2 = g_max - g_val;

  g_val = _v;
  g_min = _v - sa1;
  g_max = _v + sa2;
}
msg_float_val.local = 1;


function msg_float_max(_v) {
  if(g_max<_v)  g_max = _v;
  else          g_max = g_val;
}
msg_float_max.local = 1;




// mode
function mode(_mode) {
  g_mode = _mode;
  output();
}
