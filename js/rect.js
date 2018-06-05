var margin = { top: -5, right: -5, bottom: -5, left: -5 },
  width = $('#svgCotent').width() - margin.left - margin.right,
  height = $('#svgCotent').height() - margin.top - margin.bottom;


var points = [];
var selected = points[0];   //当前选中的热点
var controls = ['rect', 'circle'];

var isDrawingLine = false;
var isRect = false, isCircle = false;

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoomed);
var drag = d3.behavior.drag()
  .origin(function (d) { return d; })
  .on("dragstart", dragstarted)
  .on("drag", dragged)
  .on("dragend", dragended);


$('#svgCotent').append('<div class="svg-board-operation"></div>');

var controlsTmp = '<button class="svg-control svg-rect" type="rect">矩形</button>' + '<button class="svg-control svg-circle" type="circle">圈圈</button>';
$('.svg-board-operation').append(controlsTmp);

$('.svg-board-operation .svg-control').each(function (i, control) {
  if ((controls).includes($(control).attr('type'))) {
    // alert(0)
  }
});

var line = d3.svg.line();
var svg = d3.select("#svgCotent").append("svg")
  .attr("width", width)
  .attr("height", height)
  // .attr("tabindex", 1)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
  // .call(zoom)
  .call(zoom).on('dblclick.zoom', null);


var container = svg.append("g").on("mousedown", mousedown);
container.attr("class", "ba-image")
  .append("image")
  .attr("xlink:href", "./static/xzd.jpg")
  .attr("x", "0")
  .attr("y", "0")
  .attr("width", width)
  .attr("height", height);

container.append("path")
  .datum(points)
  .attr("class", "line")
  .call(redraw);

d3.select(window)
  .on("mousemove", mousemove)
  .on("mouseup", mouseup);

$('.svg-board-operation .svg-control').click(function () {
  isDrawingLine = true;
  $('.svg-board-operation .svg-control').removeClass('active');
  $(this).addClass('active');
  var contrType = $(this).attr('type');

  switch (contrType) {
    case 'rect':
      isRect = true;

      break;

    default:
      break;
  }
});


function dottype(d) {
  d.x = +d.x;
  d.y = +d.y;
  return d;
}
function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}
function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
function dragended(d) {
  d3.select(this).classed("dragging", false);
}

function redraw() {
  container.select("path")
    .attr("d", line)
    .style("stroke-dasharray", "10 5")
    .style("stroke", "#ff7f0e")
    .style("stroke-width", 2);

  // var circle = container.selectAll("circle")
  //   .data(points, function (d) { return d; });

  // circle.enter().append("circle")
  //   .attr("r", 1e-6)
  //   .on("mousedown", function (d) {dragged = d; redraw(); })
  //   .transition()
  //   .duration(750)
  //   .ease("elastic")
  //   .attr("r", 6.5);

  // circle
  //         .classed("selected", function(d) { return d; })
  //         .attr("cx", function(d) { return d[0]; })
  //         .attr("cy", function(d) { return d[1]; });

  // circle.exit().remove();

  if (d3.event) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

function mousedown() {

  //没有开启编辑
  if(!isDrawingLine) return;

  points.push(dragged = d3.mouse(svg.node()));
  redraw();
}

//鼠标移动--拖动热点
function mousemove() {
  if (!dragged) return;
  var m = d3.mouse(svg.node());
  dragged[0] = Math.max(0, Math.min(width, m[0]));
  dragged[1] = Math.max(0, Math.min(height, m[1]));
  redraw();
}

//鼠标抬起-停止移动
function mouseup() {
  if (!dragged) return;
  mousemove();
  dragged = null;
}
