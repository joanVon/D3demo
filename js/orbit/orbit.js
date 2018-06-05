var points = [];
var margin = { top: -5, right: -5, bottom: -5, left: -5 };
var width, height;
var dataPoints;

var svgOptBat = '<div id="svgOptBar" class="svg-opt-bar">' +
  '<a class="download hide" data-opt="download" download>提交图片</a>' +
  '</div>';

var DrawOrbit = function (element, options) {
  options = $.extend({}, $.fn.drawOrbit.defaults, options);

  this.options = options;

  $("#" + this.options.idName).append(svgOptBat);
  $("#" + this.options.idName).append('<div class="svg-point-tooltip hidden"><p><strong class="name"></strong></p></div>');

  width = this.options.width - margin.left - margin.right,
    height = this.options.height - margin.top - margin.bottom;

  dataPoints = this.options.dataPoints;
  var pointCount = this.options.dataPoints.length > 0 && this.options.dataPoints.length + 1;
  points = d3.range(1, pointCount).map(function (i) {
    return [i * width / pointCount, 50];
  });

  // 初始化平面图 加载已知点位
  this.init(options);
};

var dragged = null,
  selected = points.length > 0 && points[0];
  
// 缩放函数
var zoom = d3.behavior.zoom()
  .scaleExtent([1, 10])  // 设置最小和最大的缩放比例
  .on("zoom", zoomed);
var drag = d3.behavior.drag()
  .origin(function (d) { return d; })
  .on("dragstart", dragstarted)
  .on("drag", dragged)
  .on("dragend", dragended);

var line = d3.svg.line().interpolate('monotone');  // 默认线路样式 插值模式三次插值，保留y的单调性
var svg;
var container;

DrawOrbit.prototype = {
  constructor: DrawOrbit,
  init: function (options) {
    svg = d3.select("#" + this.options.idName).append("div").attr("class", "svg-wrap").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "main-svg")
      .style("fill", 'rgba(0, 0, 0, 0)')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
      .call(zoom).on('dblclick.zoom', null);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
    // .on("mousedown", mousedown);

    container = svg.append("g");

    container.attr("class", "bg-image")
      .append("image")
      .attr("xlink:href", this.options.imgSrc)
      .attr("x", "0")
      .attr("y", "0")
      .attr("width", width)
      .attr("height", height)

    // 添加线路对象
    container.append("path")
      .datum(points)
      .attr("class", "line")
      .call(redraw)

    d3.select('#mapCanvas')
      .on("mousemove", mousemove)
      .on("mouseup", mouseup)
      .on("keydown", keydown);

    container.node().focus();

    if (this.options.toolBar) {
      $.each(this.options.toolBarControls, function (i, control) {
        $('#svgOptBar').find('a[data-opt=' + control + ']').removeClass('hide');
      });
    }

    var _this = this;
    // var canvasId = this.options.idName;
    $('#svgOptBar').find('a[data-opt=download]').click(function () {
      _this.options.exportedPic = _this.savePicture()
    })

  },

  savePicture: function () {
    // var s = new XMLSerializer().serializeToString(document.getElementsByTagName("svg")[0])
    // var encodedData = window.btoa(s);

    // var html = d3.select("svg.main-svg")
    //   .attr("version", 1.1)
    //   .attr("xmlns", "http://www.w3.org/2000/svg")
    //   .node().parentNode.innerHTML;

    // //console.log(html);
    // // var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
    // var imgsrc = 'data:image/svg+xml;base64,' + encodedData;
    // var img = '<img src="' + imgsrc + '">';
    // // d3.select("#svgdataurl").html(img);

    // console.log(html)
    // d3.select("#exportedImage").html(img);

    // saveSvgAsPng(document.getElementsByTagName("svg")[0], "diagram.png");
    svgAsPngUri(document.getElementsByTagName("svg")[0], {}, function(uri) {
      console.log(uri)
    });
  }
};

// Functions
// ================================ zoom drag ============================= //
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
// ================================ zoom drag ============================= //
function redraw() {
  container.select("path")
    .attr("d", line)
    .style("stroke-dasharray", "10 5")
    .style("stroke", "#ff7f0e")
    .style("stroke-width", 2);

  var circlesEnter = container.selectAll("circle")
    .data(points, function (d, i) { return dataPoints[i].name; })
    .enter()
    .append("g")
    .attr("class", "circle-group")
    .on("mousedown", function (d, i) {
      selected = dragged = d;
      $(this).find("text").remove();
      redraw();
    }).on("mouseup", function (d, i) {
      reNumber(circlesEnter);
    });

  circlesEnter
    .append("circle")
    .attr("r", 1e-6)
    .transition()
    .duration(750)
    .ease("elastic")
    .attr("r", 14.5)
    .text(function (b, i) { return i; })
    .style("stroke", "#ff7f0e")
    .style("stroke-width", 2)
    // .style("fill", '#fff')
    // .style("fill", '#ff7f0e')
    .attr("data-name", function (b, i) { return dataPoints[i].name });


  reNumber(circlesEnter);  // 重置序号

  container.selectAll("g.circle-group").on("mouseover", function (d) {
    // console.log(d);
    // 从d3.event获取鼠标的位置
    var transform = d3.event;
    var yPosition = transform.offsetY + 20;
    var xPosition = transform.offsetX + 20;
    // 将浮层位置设置为鼠标位置
    var tooltip = d3
      .select(".svg-point-tooltip")
      .style("left", xPosition + "px")
      .style("top", yPosition + "px");
    // 更新浮层内容
    tooltip.select(".name").text($(this).find('circle').attr('data-name'));
    // console.log(this.text)
    // 移除浮层hidden样式，展示浮层
    tooltip.classed("hidden", false);
  })
    .on("mouseout", mouseout);


  container.selectAll("circle")
    .data(points, function (d, i) { return dataPoints[i].name; })
    .classed("selected", function (d, i) { return d === selected; })
    .attr("cx", function (d) { return d[0]; })
    .attr("cy", function (d) { return d[1]; });

  container.selectAll("circle")
    .data(points, function (d, i) { return dataPoints[i].name; })
    .exit().remove();

  if (d3.event) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

function reNumber(enterEle) {
  enterEle.append("text")
    .attr('class', 'circle-text')
    .attr("x", function (d) { return d[0]; })
    .attr("y", function (d) { return d[1]; })
    .attr("dy", 5)
    // .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("text-anchor", "middle")
    .text(function (d, i) { return i + 1; })
    .attr("font-weight", "700")
    .attr("font-size", "16px")
    .attr("fill", "#000");
}
function mousemove() {
  if (!dragged) return;
  var m = d3.mouse(container.node());
  dragged[0] = Math.max(0, Math.min(width, m[0]));
  dragged[1] = Math.max(0, Math.min(height, m[1]));
  redraw();
}
function mouseout() {
  d3.select(".svg-point-tooltip").classed("hidden", true);
}

function mouseup() {
  if (!dragged) return;
  mousemove();
  dragged = null;
}

function keydown() {
  if (!selected) return;
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      var i = points.indexOf(selected);
      points.splice(i, 1);
      selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
      redraw();
      break;
    }
  }
}

// 注册插件
$.fn.drawOrbit = function (options) {
  return this.each(function () {
    new DrawOrbit(this, options);
  });
};

// 默认设置
$.fn.drawOrbit.defaults = {
  className: '',                      // 生成 指定 class
  idName: '',                         // 生成 指定 id
  positionData: null,                 // 点位集合数据
  imgSrc: null,                       // 图片路径
  style: '',
  width: 'auto',
  height: 'auto',
  zIndex: 1,
  toolBar: true,
  toolBarControls: ["download"],
  exportedPic: null,
  parentEl: 'body'                  // 图层上层 Dom
};

$.fn.drawOrbit.Constructor = DrawOrbit;