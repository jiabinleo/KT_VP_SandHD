/**
 * 地图初始化文件
 */
(function (root, factory) {
    root.gis = factory();
}(window, function () {
    var gis = {};

//****************************** 配置信息 ******************************************************************************
    /**

     * 地图服务器相关
     */
    //影像图层
    gis.layer_image = {
        url: "http://10.138.69.220:8084/geoserver/WZ/wms",
        layer: "RegionWenZhou"
    };
    //行政区划图层
    gis.layer_region = {
        url: "http://10.138.69.220:8084/geoserver/WZ/wms",
        layer: "Region_WenZhou"
    };

    // arcgis district layer url
    gis.arcgis_layer_region = "http://10.138.69.70:6080/arcgis/rest/services/given/sl_wms/MapServer";
    // arcgis image layer url
    gis.arcgis_layer_image = "http://10.138.69.70:6080/arcgis/rest/services/given/YXDT_QX/MapServer";
    //高程图层
    gis.layer_dem = "http://10.138.69.220:8084/wenzhou_terrain/";
    //高程最大等级，决定查询地形高度精细度
    gis.terrainMaxLevel = 11;

    /**
     * 地图相关
     */
    //默认视野（初始显示范围） 参数顺序西、南、东、北 / 左、下、右、上
    // gis.defaultCameraView = [97, 21, 106.5, 29.5];
    //默认视野（初始显示范围） 参数顺序中心经度，中心纬度，视角高度(米）
    gis.defaultCameraView = [120.699390, 27.904920, 400000];
    //文字图形反锯齿
    var isFxaaOn = true;
    //最小缩放距离
    // var minimumZoomDistance = 3117;
    // var minimumZoomDistance = 281;
    var minimumZoomDistance = 1;
    //最大缩放距离
    var maximumZoomDistance = 1958785;

    /**
     * 文件路径及地图容器
     * @type {string}
     */
        //js文件路径根目录
    var jsUrlPrefix = gis.jsUrlPrefix = "../js/map/";
    //图片路径根目录
    gis.imgUrlPrefix = "../js/map/img/";
    //CSS文件根目录
    var cssUrlPrefix = "../js/map/css/";
    //地图容器DIV ID
    var mapContainerID = gis.mapContainerID = "map_div";

//***************************** 配置完成 *******************************************************************************

    /**
     * 初始化代码
     */
    //加载插件样式
    loadCSS(jsUrlPrefix + "cesium/Widgets/widgets.css");
    //加载自定样式
    loadCSS(cssUrlPrefix + "gis.css");
    loadCSS(cssUrlPrefix + "frame.css");

    var coorArr = gis.defaultCameraView;

    if (coorArr.length === 4) {
        gis.defaultCameraView = Cesium.Rectangle.fromDegrees(coorArr[0], coorArr[1], coorArr[2], coorArr[3]);
    }

    if (coorArr.length === 3) {
        gis.defaultCameraView = Cesium.Cartesian3.fromDegrees(coorArr[0], coorArr[1], coorArr[2]);
    }

    /**
     * 地图设置*******************************************************************
     */

        //初始化地图,需要一个DIV，ID为map
    var viewer = gis.viewer = new Cesium.Viewer(mapContainerID, {
            animation: false, //是否创建动画小器件，左下角仪表
            baseLayerPicker: false, //是否显示图层选择器
            fullscreenButton: false, //是否显示全屏按钮
            geocoder: false, //是否显示geocoder小器件，右上角查询按钮
            homeButton: true, //是否显示Home按钮
            infoBox: false, //是否显示信息框
            sceneModePicker: true, //是否显示3D/2D选择器
            selectionIndicator: true, //是否显示选取指示器组件
            timeline: false, //是否显示时间轴
            navigationHelpButton: false, //是否显示右上角的帮助按钮
            scene3DOnly: false, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
            navigationInstructionsInitiallyVisible: false, //是否显示提示小组件
            showRenderLoopErrors: false, //是否显示渲染错误
            sceneMode: Cesium.SceneMode.SCENE2D //初始场景模式(2d,3d,哥伦布)
            // ,terrainExaggeration:3 //地形夸张
        });

    //viewer.scene.globe.maximumScreenSpaceError = 1.75;
    //viewer.scene.screenSpaceCameraController.minimumZoomDistance = minimumZoomDistance;
    //viewer.scene.screenSpaceCameraController.maximumZoomDistance = maximumZoomDistance;
    viewer.scene.globe.baseColor  = Cesium.Color.WHITE;

    gis.camera = viewer.camera;
    gis.scene = viewer.scene;

    //2D/3D选择器展开过渡时间
    viewer.sceneModePicker.viewModel.duration = 0;
    //反锯齿，图形文字边缘圆滑（模糊）
    viewer.scene.fxaa = isFxaaOn;
    //去掉2.5D视角（哥伦布）
    $("button[title='Columbus View']").css("display", "none");
    //隐藏cesium水印
    $(".cesium-widget-credits").css("display", "none");
    $(".cesium-viewer-toolbar").css("display", "none");
    /**
     * 地图初始化代码******************************************************
     */
    //清除默认影像图层
    viewer.imageryLayers.removeAll();

    //清除默认鼠标事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //覆写默认HOME按钮事件
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (commandInfo) {
        viewer.camera.flyTo({
            destination: gis.defaultCameraView
        });
        commandInfo.cancel = true;
    });

    //影像图层
    gis.imageLayer = new Cesium.ImageryLayer(new Cesium.ArcGisMapServerImageryProvider({
        url: gis.arcgis_layer_image
    }), {
        brightness: 1,
        hue: 0,
        contrast: 1,
        saturation: 1,
        gamma: 1
    });

    //电子图层
    gis.epLayer = new Cesium.ImageryLayer(new Cesium.ArcGisMapServerImageryProvider({
        url: gis.arcgis_layer_region
    }), {
        brightness: 1,
        hue: 0,
        contrast: 1,
        saturation: 1,
        gamma: 1
    });

    //默认显示电子图
    viewer.imageryLayers.add(gis.epLayer);
    //viewer.imageryLayers.add(gis.epLayer);

    //添加高层图层
    // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    //     url: 'https://assets02.agi.com/stk-terrain/world',
    //     requestWaterMask: true,
    //     requestVertexNormals: true
    // });
    viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: gis.layer_dem
    });

    viewer.camera.setView({
        destination: gis.defaultCameraView
    });

    gis.screen = {};

    /**
     * 设置亮度
     * @param val
     */
    gis.screen.setBrightness = function (val) {
        if(val < 0 ){
            console.log("亮度值必须大于0");
            return;
        }
        viewer.imageryLayers.get(1).brightness = val;
    };

    /**
     * 设置gamma
     * @param val
     */
    gis.screen.setGamma = function (val) {
        if(val < 0 ){
            console.log("gamma必须大于0");
            return;
        }
        viewer.imageryLayers.get(1).brightness = val;
    };

    /**
     * 设置饱和度
     * @param val
     */
    gis.screen.setSaturation = function (val) {
        if(val < 0 ){
            console.log("饱和度必须大于0");
            return;
        }
        viewer.imageryLayers.get(1).saturation = val;
    };

    /**
     * 设置对比度
     * @param val
     */
    gis.screen.setContrast = function (val) {
        if(val < 0 ){
            console.log("对比度必须大于0");
            return;
        }
        viewer.imageryLayers.get(1).contrast = val;
    };

    /**
     * 设置色调
     * @param val
     */
    gis.screen.setContrast = function (val) {
        if(val < 0 ){
            console.log("色调必须大于0");
            return;
        }
        viewer.imageryLayers.get(1).hue = val;
    };

    /**
     * 地图调色重置
     */
    gis.screen.colorReset = function () {
        var layer = viewer.imageryLayers.get(1);
        layer.brightness = 1 ;
        layer.contrast = 1;
        layer.hue = 0;
        layer.saturation = 1;
        layer.gamma = 1;
    };

    /**
     * 当前色彩设置
     */
    gis.screen.colorCurrentSet = function () {
        var layer = viewer.imageryLayers.get(1);
        var o = {};
        o.brightness = layer.brightness;
        o.contrast = layer.contrast;
        o.hue = layer.hue;
        o.saturation = layer.saturation;
        o.gama = layer.gamma;
        console.log(o);
    };

    return gis;
}));

function loadCSS(url) {
    var head = document.getElementsByTagName('HEAD').item(0);
    var style = document.createElement('link');
    style.href = url;
    style.rel = 'stylesheet';
    style.type = 'text/css';
    head.appendChild(style);
}
