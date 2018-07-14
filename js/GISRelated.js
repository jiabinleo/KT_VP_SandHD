var billboards = gis.viewer.scene.primitives.add(new Cesium.BillboardCollection());
var markerIDMap = {};
var markType = {};
var GisIDArr = []

/**
 * lon：经度
 * lat:纬度
 * id:唯一id
 * imgUrl:图标
 * text:文字
 * */
function addMarkerText(option) {

    var opt = $.extend({}, addMarkerText.DEFAULT_OPTS, option);
    var marker = gis.viewer.entities.add({
        id: opt.id,
        name: opt.name,
        position: Cesium.Cartesian3.fromDegrees(opt.lon, opt.lat, opt.alt),
        // 图标
        billboard: {
            image: opt.imgUrl,
            color: opt.imgColor,
            width: opt.imgWidth,
            height: opt.imgHeight,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
        },
        // 文字标签
        label: {
            text: opt.text,
            font: opt.font,
            fillColor: opt.textColor,
            verticalOrigin: Cesium.VerticalOrigin.TOP, // 垂直方向以底部来计算标签的位置
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            pixelOffset: new Cesium.Cartesian2(12, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,
                100000000)
        }
    });
    return marker;
}
function addMarker_ById(options) {
    var opts = $.extend({}, addMarker.DEFAULT_OPTS, options);
    //   var uid =opts.uidName+"_" +opts.id;
    // var uid = opts.uidName + (new Date().getTime()) + Math.random();
    var uid =opts.uidName
    var gisMaker = billboards.add({
        id: uid,
        position: Cesium.Cartesian3.fromDegrees(opts.longitude, opts.latitude),
        image: opts.img,
        color: opts.color,
        height: opts.height,
        width: opts.width
    });

    gisMaker.dataObj = opts.dataObj;
    markerIDMap[uid] = gisMaker;
    // 标点的id放入不同对象的uid中
    opts.uids.push(uid);
    // 点击左键方法名
    markType[uid] = opts.onClick;
}
function removeMarkerText(id) {
    gis.viewer.entities.remove(id)
}

addMarkerText.DEFAULT_OPTS = {
    id: "markerText_" + new Date().getTime(),
    name: "marker",
    lon: 0,
    lat: 0,
    alt: 0,
    imgUrl: undefined,
    imgWidth: 12,
    imgHeight: 12,
    imgColor: undefined,
    text: "",
    textColor: Cesium.Color.RED,
    font: "10pt microsoft yahei"
}

// 绘图插件
var drawHelper = new DrawHelper(gis.viewer);
// 绘制图形缓存
var primitiveGrahpics = [];
// 绘制图片经纬度
var latLons = "";
// 多边形
function drawPolygon() {
    drawHelper.startDrawingPolygon({
        callback: function (positions) {
            var lls = [];
            for (var i = 0; i < positions.length - 2; i++) {
                var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(positions[i]);
                lls.push([Cesium.Math.toDegrees(carto.longitude).toFixed(4), Cesium.Math.toDegrees(carto.latitude).toFixed(4)]);
            }
            lls.push(lls[0]);
            var ofString = "POLYGON(("
            for (var i = 0; i < lls.length; i++) {
                ofString += lls[i][0] + " " + lls[i][1] + ","
            }
            //		拼接后台所需要的字符串
            ofString = ofString.substring(0, ofString.length - 1);
            ofString += "))"
            latLons = ofString;
            console.debug("latLons = ", latLons)
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: positions,
                material: Cesium.Material.fromType(Cesium.Material.RimLightingType, {
                    color: new Cesium.Color(0.6, 0.6, 0, 0.4),
                    rimColor: new Cesium.Color(0, 0, 0, 0.4),
                    width: 0.3
                })
                //				material: Cesium.Material.fromType('Color')
            });
            gis.scene.primitives.add(polygon);
            // 开启多边形修改模式
            // polygon.setEditable();
            primitiveGrahpics.push(polygon);
            // polygon.addListener('onEdited', function(event) {
            // console.debug(event);
            // });
        }
    });
}
// 圆
var drawCircleObjext = {};

function drawCircle() {
    drawHelper.startDrawingCircle({
        callback: function (center, radius) {
            var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
            drawCircleObjext["longitude"] = Cesium.Math.toDegrees(carto.longitude).toFixed(4)
            drawCircleObjext["latitude"] = Cesium.Math.toDegrees(carto.latitude).toFixed(4)
            drawCircleObjext["width"] = radius / 1000
            console.debug("drawCircleObjext = " + JSON.stringify(drawCircleObjext))
            var circle = new DrawHelper.CirclePrimitive({
                center: center,
                radius: radius,
                material: Cesium.Material.fromType(Cesium.Material.RimLightingType, {
                    color: new Cesium.Color(0.6, 0.6, 0, 0.4),
                    rimColor: new Cesium.Color(0, 0, 0, 0.4),
                    width: 0.3
                })
            });
            gis.scene.primitives.add(circle);
            circle.setEditable();
            primitiveGrahpics.push(circle);
        }
    });
}
// 清除所有图形
function clearDrawing() {
    for (var i = 0; i < primitiveGrahpics.length; i++) {
        gis.scene.primitives.remove(primitiveGrahpics[i])
    }
}

/**
 *
 * @param ids 数组
 * @param lon 经度
 * @param lat 纬度
 * @param radius 宽度（米）
 * @param color  颜色（“#ff0000”）
 */
function addCircleShape(ids, lon, lat, radius, color) {
    var uid = new Date().getTime() + Math.random();
    var circleGrahpic = gis.viewer.entities.add({
        id: uid,
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        ellipse: {
            semiMinorAxis: radius,
            semiMajorAxis: radius,
            material: Cesium.Color.fromCssColorString(color),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
        }
    });
    ids.push(uid);
    return circleGrahpic;
}

function delCircleShape(ids) {
    console.debug(ids)
    for (var i = 0; i < ids.length; i++) {
        var entity = gis.viewer.entities.getById(ids[i]);
        gis.viewer.entities.remove(entity);
    }
}

// 关闭默认鼠标事件
function toggleDefaultMouseHandlerOFF() {
    gis.scene.screenSpaceCameraController.enableRotate = false;
    gis.scene.screenSpaceCameraController.enableTranslate = false;
    gis.scene.screenSpaceCameraController.enableZoom = false;
    gis.scene.screenSpaceCameraController.enableTilt = false;
    gis.scene.screenSpaceCameraController.enableLook = false;
}

// 开启默认鼠标事件
function toggleDefaultMouseHandlerON() {
    gis.scene.screenSpaceCameraController.enableRotate = true;
    gis.scene.screenSpaceCameraController.enableTranslate = true;
    gis.scene.screenSpaceCameraController.enableZoom = true;
    gis.scene.screenSpaceCameraController.enableTilt = true;
    gis.scene.screenSpaceCameraController.enableLook = true;
}

/**
 *
 * @param {Array}
 *            coordinates - 坐标点集合 [lon,lat,lon,lat...]
 * @param {(String|Number)}
 *            id
 */
function addPolygoShape(coordinates, id) {
    var polygonGrahpic = gis.viewer.entities.add({
        id: id,
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coordinates),
            height: 0,
            material: Cesium.Color.YELLOW.withAlpha(0.3),
            outline: true,
            // outlineColor: Cesium.Color.BLACK.withAlpha(1),
            outlineColor: Cesium.Color.BLUE,
            outlineWidth: 5
        }
    });

    polygonGrahpic.wkt = (function () {
        var wktString = "POLYGON((";
        for (var i = 0; i < coordinates.length; i += 2) {
            wktString += coordinates[i];
            wktString += " ";
            wktString += coordinates[i + 1];

            if (i !== coordinates.length - 2) {
                wktString += ",";
            }
        }

        wktString += "))";

        return wktString;
    }());
    return polygonGrahpic;
}
/**
 * 清除行政区边界
 * */
function RemoveEntity(id) {

    var entity = gis.viewer.entities.getById(id);
    //	console.debug("remove", entity);
    if (typeof(entity) != "undefined" && entity != 0) {
        gis.viewer.entities.remove(entity);
    }

}


/**
 * 默认云南大小贴图
 *
 * @param {String |
 *            Number} id - 字符串或者数字
 * @param {String}
 *            picUrl - String 图片路径字符串
 */
function addImageDefaultYN(id, picUrl) {
    addImageByRectangle(id, 97, 21, 106.5, 29.5, picUrl);
}

/**
 * 圆形贴图
 *
 * @param {String |
 *            Number} id - 字符串或者数字
 * @param {Number}
 *            lon - longitude 圆心经度
 * @param {Number}
 *            lat - latitude 圆心纬度
 * @param {Number}
 *            radius - Number in meter 半径（单位米）
 * @param {String}
 *            picUrl - String 图片路径字符串
 * @return Cesium.Primitive
 */
function addImageByCircle(id, lon, lat, radius, picUrl) {
    var circle = new Cesium.GeometryInstance({
        id: id,
        geometry: new Cesium.CircleGeometry({
            center: Cesium.Cartesian3.fromDegrees(lon, lat),
            radius: radius
        })
    });

    return addImageToGeometry(circle, picUrl);
}

/**
 * 矩形贴图
 *
 * @param {String |
 *            Number} id - 字符串或者数字
 * @param {Number}
 *            west - 西
 * @param {Number}
 *            south - 南
 * @param {Number}
 *            east - 东
 * @param {Number}
 *            north - 北
 * @param {String}
 *            picUrl - String 图片路径字符串
 */
function addImageByRectangle(id, west, south, east, north, picUrl) {
    var rectangle = new Cesium.GeometryInstance({
        id: id,
        geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
        })
    });
    markerIDMap[id] = addImageToGeometry(rectangle, picUrl);
    return markerIDMap[id];
}

function removeImageByRectangle(id) {
    gis.viewer.scene.primitives.remove(markerIDMap[id])
}

/**
 * 基础贴图方法
 *
 * @param {Cesium.GeometryInstance}
 *            geometryInstance - Cesium.GeometryInstance
 * @param {String}
 *            picUrl - String 图片路径字符串
 */
function addImageToGeometry(geometryInstance, picUrl) {
    return gis.viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'Image',
                    uniforms: {
                        image: picUrl
                    }
                }
            })
        })
    }));
}


/**
 * 标点(3D无高度)
 *  @param {Number} longitude:经度
 *  @param {Number} latitude：纬度
 *  @param {String} img:贴图图片（可不传->默认：../js/map/img/util.png）
 *  @param {Number} height:长度（可不传->默认：默认12）
 *  @param {Number} width:宽度（可不传->默认：默认12）
 *  @param {Array}  uid:存储id的数组（可不传->默认：GisIDArr)
 *  @param {Object} dataObj:点击事件需要拿到的数据（可不传->默认：null)
 * */
function addMarkerNo(options) {
    var opts = $.extend({}, addMarkerNo.DEFAULT_OPTS, options);
    var uid = opts.uidName + (new Date().getTime()) + Math.random();
    var gisMaker = billboards.add({
        id: uid,
        position: Cesium.Cartesian3.fromDegrees(opts.longitude, opts.latitude),
        image: opts.img,
        color: opts.color,
        height: opts.height,
        width: opts.width
    });

    gisMaker.dataObj = opts.dataObj;
    markerIDMap[uid] = gisMaker;
    // 标点的id放入不同对象的uid中
    opts.uids.push(uid);
    // 点击左键方法名
    markType[uid] = opts.onClick;
    markType[uid+"right"] = opts.rightClick;
}

addMarkerNo.DEFAULT_OPTS = {
    longitude: 0,
    latitude: 0,
    uidName: "addMarkerNo",
    uids: GisIDArr,
    height: 12,
    width: 12,
    img: "../js/map/img/util.png",
    dataObj: null,
    onClick: function () {
    },
    rightClick: function () {
    }
}

/**
 * 标点（加高度）
 * @param {Number} longitude:标点经度
 * @param {Number} latitude:标点纬度
 * @param {String} uidName:标点类型（可不传->默认：addMarker）
 * @param {String} img:贴图图片（可不传->默认：../js/map/img/util.png）
 * @param {Number} height:长度（可不传->默认:12）
 * @param {Number} width:宽度（可不传->默认:12）
 * @param {Array} uid:存储id的数组（可不传->默认:GisIDArr）
 * @param {Object} dataObj:点击事件需要拿到的数据 （可不传->默认:null）
 */
function addMarker(options) {
    var opts = $.extend({}, addMarker.DEFAULT_OPTS, options);
    var positions = [];
    positions.push(Cesium.Cartographic.fromDegrees(opts.longitude, opts.latitude));
    if(opts.longitude > 150 || opts.longitude < 100){
        addMarkerNo(options);
        return;
    }
    if(opts.latitude > 30 || opts.latitude < 20){
        addMarkerNo(options);
        return;
    }
    // 计算器经纬度位置高度用于贴地
    var promise = Cesium.sampleTerrain(gis.viewer.terrainProvider, 16, positions);
    Cesium.when(promise, function (updatedPositions) {
        var uid = opts.uidName + (new Date().getTime() + Math.random());
        // 添加点
        var gisMaker = markerIDMap[uid] = billboards.add({
            id: uid,
            position: Cesium.Cartesian3.fromRadians(
                updatedPositions[0].longitude,
                updatedPositions[0].latitude,
                updatedPositions[0].height),
            image: opts.img,
            color: opts.color,
            height: opts.height,
            width: opts.width
        });
        gisMaker.dataObj = opts.dataObj;
        opts.uids.push(uid);
        markType[uid] = opts.onClick;
        markType[uid+"right"] = opts.rightClick;
    });
}

addMarker.DEFAULT_OPTS = {
    longitude: 0,
    latitude: 0,
    uidName: "addMarker",
    uids: GisIDArr,
    height: 12,
    width: 12,
    img: "../js/map/img/util.png",
    dataObj: null,
    onClick: function () {
    },
    rightClick: function () {
    }
}

function removeMarker(id) {
    var aaaa = markerIDMap[id]
    billboards.remove(markerIDMap[id]);
}

/**
 * 画虚线（不贴地）
 * @param options
 * @param data [lon1,lat1,lon2,lat2] 线经纬度
 * @param width Number 虚线宽度
 */
function dottedLine(options) {
    var opts = $.extend({}, dottedLine.DEFAULT_OPTS, options);
    if (opts.data.length == 4) {
        var uid = new Date().getTime() + Math.random();
        markerIDMap[uid] = gis.viewer.entities.add({
            name: 'Blue dashed line',
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(opts.data),
                width: opts.width,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.CYAN
                })
            }
        });
        opts.uids.push(uid)
    }
}
dottedLine.DEFAULT_OPTS = {
    uids: GisIDArr,
    data: [],
    Width: 4
}
/**
 * 删除虚线
 * @param id
 */
function delDottedLine(id) {
    gis.viewer.entities.remove(markerIDMap[id]);
}

/**
 * 画实线（贴地）
 * @param options
 * @param width Number 线宽
 * @param data [lon1,lat1,lon2,lat2] 经纬度数组
 * @param uids [] 存放线对象（便于删除）
 */
function lineHeight(options) {
    var opts = $.extend({}, lineHeight.DEFAULT_OPTS, options);
    if (opts.data.length == 4) {
        var uid = new Date().getTime() + Math.random();
        markerIDMap[uid] = gis.viewer.entities.add({
            corridor: {
                positions: Cesium.Cartesian3.fromDegreesArray(opts.data),
                //线的高度
                //extrudedHeight : 100000.0,
                width: opts.Width,
                cornerType: Cesium.CornerType.BEVELED,
                material: Cesium.Color.RED,
                outline: true,
                outlineColor: Cesium.Color.BLUE
            }
        });
        opts.uids.push(uid)
    }
}
lineHeight.DEFAULT_OPTS = {
    uids: GisIDArr,
    data: [],
    Width: 1000
}
/**
 * 删除贴地线
 * @param id
 */
function delLineHeight(id) {
    gis.viewer.entities.remove(markerIDMap[id]);
}


/**
 * 轨迹
 * 前后点的经纬度并画线（贴地）
 * @param option {data: *,uids: *......}
 * @param data: 经纬度数组 : [[lon1,lat1],[lon2,lat2]]
 * @param uids: uid数组对象，删除标记使用 {maker:[,,,],poly:[,,,,]}
 * @param img: 贴图图片
 * @param polylineWidth: 轨迹宽度 默认1000
 * @param time: 标记轨迹间隔时间 默认3000（3秒）
 */
function trajectorys(option) {
    var opts = $.extend({}, trajectorys.DEFAULT_OPTS, option);
    var uids = opts.uids;
    uids["maker"] = [];
    uids["poly"] = [];
    var data = opts.data;
    if (data.length > 1) {
        var positions = [];
        positions.push(Cesium.Cartographic.fromDegrees(data[0][0], data[0][1]));
        // 计算器经纬度位置高度用于贴地
        var promise = Cesium.sampleTerrain(gis.viewer.terrainProvider, 11, positions);
        Cesium.when(promise, function (updatedPositions) {
            var uid = new Date().getTime() + Math.random();
            // 添加点
            var gisMaker = markerIDMap[uid] = billboards.add({
                id: uid,
                position: Cesium.Cartesian3.fromRadians(
                    updatedPositions[0].longitude,
                    updatedPositions[0].latitude,
                    updatedPositions[0].height),
                image: opts.img,
                color: opts.color,
                height: opts.height,
                width: opts.width
            });
            uids["maker"].push(uid);
        });
        var i = 1;
        var timer = setInterval(function () {
            var positions = [];
            positions.push(Cesium.Cartographic.fromDegrees(data[i][0], data[i][1]));
            // 计算器经纬度位置高度用于贴地
            var promise = Cesium.sampleTerrain(gis.viewer.terrainProvider, 11, positions);
            Cesium.when(promise, function (updatedPositions) {
                var uid = new Date().getTime() + Math.random();
                // 添加点
                var gisMaker = markerIDMap[uid] = billboards.add({
                    id: uid,
                    position: Cesium.Cartesian3.fromRadians(
                        updatedPositions[0].longitude,
                        updatedPositions[0].latitude,
                        updatedPositions[0].height),
                    image: opts.img,
                    color: opts.color,
                    height: opts.height,
                    width: opts.width
                });
                uids["maker"].push(uid);
            });
            var arr = [data[i - 1][0], data[i - 1][1], data[i][0], data[i][1]];
            var polyline = gis.viewer.entities.add({
                corridor: {
                    positions: Cesium.Cartesian3.fromDegreesArray(arr),
                    //线的高度
                    //extrudedHeight : 100000.0,
                    width: opts.polylineWidth,
                    cornerType: Cesium.CornerType.BEVELED,
                    material: Cesium.Color.RED,
                    outline: true,
                    outlineColor: Cesium.Color.BLUE
                }
            });
            uids["poly"].push(polyline);
            // }
            i++;
            if (i == data.length) {
                clearInterval(timer);
            }
        }, opts.time);
    }

}

trajectorys.DEFAULT_OPTS = {
    img: "../js/map/img/util.png",
    uids: GisIDArr,
    data: [[]],
    polylineWidth: 1000,
    height: 12,
    time: 3000,
    width: 12
}

function delTrajectorys(uids) {
    if (uids.poly.length > 0) {
        for (var i = 0; i < uids.poly.length; i++) {
            gis.viewer.entities.remove(uids.poly[i]);
        }
    }
    if (uids.maker.length > 0) {
        for (var j = 0; j < uids.maker.length; j++) {
            billboards.remove(markerIDMap[uids.maker[j]]);
        }
    }
}


// 点击标记弹出框
function dialogPopupOnClickMark(e) {
    var picked = gis.viewer.scene.pick(e.position);
    if (picked && picked.id) {
        var type = markType[picked.id];
        if (Cesium.defined(picked)) {
            if (typeof(type) == "function") {
                type(e, picked);
            }
        }
    }
}

function dialogPopupOnRightClickMark(e) {
    var picked = gis.viewer.scene.pick(e.position);
    if (picked && picked.id) {
        var types = markType[picked.id+"right"];
        if (Cesium.defined(picked)) {
            if(typeof(types) == "function"){
                types(e, picked);
            }
        }
    }
}
var camera = gis.viewer.scene.camera;
/**
 * 飞行到指定位置
 * @param lon 位置经度
 * @param lat 位置纬度
 * @param alt 位置高度
 */
function fly(lon, lat, alt) {
    camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: Cesium.Math.toRadians(0)
        },
        duration: 0.5, // 动画持续时间
        complete: function () // 飞行完毕后执行的动作
        {
            // addEntities();
        }
    });
}
/**
 * 移动镜头到指定地点
 * @param lon 经度
 * @param lat 纬度
 */
function flyToDestination(lon, lat) {
    gis.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 100000),
        duration: 1
    });
}

/**
 * 回到默认视野
 */
function backToDefaultView() {
    gis.viewer.camera.flyTo({
        destination: gis.defaultCameraView,
        duration: 1
    });
}

/**
 * 切换至2D模式
 */
function morphTo2D() {
    gis.viewer.scene.morphTo2D(0);
};

/**
 * 切换至3D模式
 */
function morphTo3D() {
    gis.viewer.scene.morphTo3D(0);
};

/**
 * 影像图层切换
 * @param {Object} layerIdx
 */
function changeImageLayer(layerIdx) {
    alert(layerIdx);
    gis.viewer.imageryLayers.remove(gis.imageryProviderWMS, true);
    var layer_current = undefined;
    var serviceUrl = undefined;

    if (1 == layerIdx) {
        //layer_current = gis.layer_image.layer;
        //serviceUrl = gis.layer_image.url;
        gis.viewer.imageryLayers.raiseToTop(gis.imageLayer);
    } else if (2 == layerIdx) {
        //layer_current = gis.layer_region.layer;
        //serviceUrl = gis.layer_region.url;
        gis.viewer.imageryLayers.raiseToTop(gis.epLayer);
    } else {
        return;
    }

    gis.imageryProviderWMS = new Cesium.WebMapServiceImageryProvider({
        url: serviceUrl,
        layers: layer_current
    });

    gis.viewer.imageryLayers.addImageryProvider(gis.imageryProviderWMS);
}

/**
 * 切换至影像图层
 */
function switchToImageLayer() {
    //changeImageLayer(1);
    gis.viewer.imageryLayers.add(gis.imageLayer);
    gis.viewer.imageryLayers.remove(gis.epLayer,false);
};

/**
 * 切换至行政区划图层
 */
function switchToAdministrativeDivisionsLayer() {
    //changeImageLayer(2);
    gis.viewer.imageryLayers.add(gis.epLayer);
    gis.viewer.imageryLayers.remove(gis.imageLayer,false);
};
/**
 *点击点
 * */
//popupTables.util = function(e, id) {
////	console.debug(louk[id])
//}
function removeAllText(){
	gis.viewer.entities.removeAll();	
}