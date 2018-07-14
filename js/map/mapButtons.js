(function() {
	var viewer = gis.viewer;
    var util = gis.util;
	var container = gis.viewer.container;
	var toolbar = $(".cesium-viewer-toolbar");
	var buttonCss = "cesium-button cesium-toolbar-button";

	//影像图图层按钮
	var imageLayerButton = $("<div></div>").prependTo(toolbar);
	imageLayerButton.addClass(buttonCss);

	var imageLayerButtonImg = $("<img id='imageLayerButton' />").appendTo(imageLayerButton);
	imageLayerButtonImg.attr("src", gis.imgUrlPrefix + "layer.png");

	//行政区图层按钮
	var regionLayerButton = $("<div></div>").prependTo(toolbar);
	regionLayerButton.addClass(buttonCss);

	var regionLayerButtonImg = $("<img id='regionLayerButton' />").appendTo(regionLayerButton);
	regionLayerButtonImg.attr("src", gis.imgUrlPrefix + "district_c.png");

	imageLayerButtonImg.isSelected = false;
	imageLayerButtonImg.click(function() {
		if(!imageLayerButtonImg.isSelected) {
			imageLayerButtonImg.attr("src", gis.imgUrlPrefix + "layer_c.png");
			regionLayerButtonImg.attr("src", gis.imgUrlPrefix + "district.png");
			changeImageLayer(1);
			imageLayerButtonImg.isSelected = true;
			regionLayerButtonImg.isSelected = false;
		}
	});

	regionLayerButtonImg.isSelected = true;
	regionLayerButtonImg.click(function() {
		if(!regionLayerButtonImg.isSelected) {
			regionLayerButtonImg.attr("src", gis.imgUrlPrefix + "district_c.png");
			imageLayerButtonImg.attr("src", gis.imgUrlPrefix + "layer.png");
			changeImageLayer(2);
			imageLayerButtonImg.isSelected = false;
			regionLayerButtonImg.isSelected = true;
		}
	});

	//定位按钮
	var locateButton = $("<div></div>").prependTo(toolbar);
	locateButton.addClass(buttonCss);

	var locateButtonImg = $("<img id='locateButton' />").appendTo(locateButton);
	locateButtonImg.attr("src", gis.imgUrlPrefix + "location.png");

	locateButtonImg.isSelected = false;
	locateButtonImg.click(function() {
		if(!locateButtonImg.isSelected) {
			locateButtonImg.attr("src", gis.imgUrlPrefix + "location_c.png");
			locateButtonImg.isSelected = true;
		} else {
			locateButtonImg.attr("src", gis.imgUrlPrefix + "location.png");
			locateButtonImg.isSelected = false;
		}
	});

	/**
	 * 影像图层切换
	 * @param {Object} layerIdx
	 */
	function changeImageLayer(layerIdx) {

		viewer.imageryLayers.remove(gis.imageryProviderWMS, true);
		var layer_current = undefined;
		var serviceUrl = undefined;

		if(1 == layerIdx) {
			layer_current = gis.layer_image.layer;
            serviceUrl = gis.layer_image.url;
		} else if(2 == layerIdx) {
			layer_current = gis.layer_region.layer;
            serviceUrl = gis.layer_region.url;
		} else {
			return;
		}

		gis.imageryProviderWMS = new Cesium.WebMapServiceImageryProvider({
			url: serviceUrl,
			layers: layer_current
		});

		viewer.imageryLayers.addImageryProvider(gis.imageryProviderWMS);
	}

    /**
     * 绘图窗口
     */
        //工具条
    var drawlerToolbar = $("<div class='gis_drawler_toolbar'></div>").appendTo(container);
    //绘制折线按钮
    var drawLineBtn = $("<img src='" + gis.jsUrlPrefix + "drawler/img/glyphicons_097_vector_path_line.png' class='gis_drawler_btn' />").appendTo(drawlerToolbar);
    //绘制多边形按钮
    var drawPolygonBtn = $("<img src='" + gis.jsUrlPrefix + "drawler/img/glyphicons_096_vector_path_polygon.png' class='gis_drawler_btn' />").appendTo(drawlerToolbar);
    //绘制圆形按钮
    var drawCircleBtn = $("<img src='" + gis.jsUrlPrefix + "drawler/img/glyphicons_095_vector_path_circle.png' class='gis_drawler_btn' />").appendTo(drawlerToolbar);
    //清除所有绘制图形
    var clearAllDrawedBtn = $("<img src='" + gis.jsUrlPrefix + "drawler/img/glyphicons_067_cleaning.png' class='gis_drawler_btn' />").appendTo(drawlerToolbar);

    drawLineBtn.click(function(){
        util.drawLine();
    });

    drawPolygonBtn.click(function(){
        util.drawPolygon();
    });

    drawCircleBtn.click(function(){
        util.drawCircle();
    });

    clearAllDrawedBtn.click(function(){
        util.clearAllDrawed();
    });


}());