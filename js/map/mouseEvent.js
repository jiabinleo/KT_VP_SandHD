/**
 * 鼠标事件
 */
(function () {
    Array.prototype.remove = function (ele) {
        var index = this.indexOf(ele);
        if (index !== -1) {
            this.splice(index, 1);
        }
    };

    var viewer = gis.viewer;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // ***************************** begin of namespace mouse ***************
    gis.mouse = {};
    var eventType = gis.mouse.eventType = {
        MOUSE_MOVE: "mouseMove",
        LEFT_CLICK: "leftClick",
        LEFT_DOUBLE_CLICK: "leftDoubleClick",
        LEFT_DOWN: "leftDown",
        LEFT_UP: "leftUp",
        RIGHT_CLICK: "rightClick",
        RIGHT_DOWN: "rightDown",
        RIGHT_UP: "rightUp",
        WHEEL: "wheel",
        MIDDLE_CLICK: "middleClick",
        MIDDLE_DOWN: "middleDown",
        MIDDLE_UP: "middleUp"
    };

    gis.mouse.eventMap = {};

    gis.mouse.registerEvent = function (type, callback) {
        var eventList = gis.mouse.eventMap[type];
        if (!eventList) {
            eventList = gis.mouse.eventMap[type] = [];
        }
        eventList.push(callback);
    };

    gis.mouse.registerTempEvent = function (type, callback) {
        var eventList = gis.mouse.eventMap[type];
        if (!eventList) {
            eventList = gis.mouse.eventMap[type] = [];
        }

        callback.isTempEvent = true;
        eventList.push(callback);
    };


    gis.mouse.unRegisterEvent = function (type, callback) {
        var eventList = gis.mouse.eventMap[type];
        if (!eventList) {
            return;
        }
        eventList.remove(callback);
    };

    gis.mouse.fireEvent = function (type, mouse) {
        var callbacks = gis.mouse.eventMap[type];
        if (!callbacks) {
            return;
        }
        for (var i = 0; i < callbacks.length; i++) {
            var callback = callbacks[i];
            callback(mouse);
            if (callback.isTempEvent) {
                gis.mouse.unRegisterEvent(type, callback);
            }
        }
    };

    // ****************************** end of namespace mouse *******************************

    //鼠标移动
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.MOUSE_MOVE, movement);

        positionOnMouseMove(movement);

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //鼠标左单击
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.LEFT_CLICK, movement);
        dialogPopupOnClickMark(movement)
        // actionOnLeftClick(movement);

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //鼠标左双击
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.LEFT_DOUBLE_CLICK, movement);
        console.log("当前高度:", viewer.camera.getMagnitude());

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //鼠标左键按下
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.LEFT_DOWN, movement);

    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    //鼠标左键放开
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.LEFT_UP, movement);

    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    //鼠标右单击
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.RIGHT_CLICK, movement);
        dialogPopupOnRightClickMark(movement)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    //鼠标右键按下
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.RIGHT_DOWN, movement);
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    //鼠标右键放开
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.RIGHT_UP, movement);
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);

    //鼠标滚轮滚动
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.WHEEL, movement);
        heightOnMouseWheelRoll();
    }, Cesium.ScreenSpaceEventType.WHEEL);

    //鼠标滚轮单击
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.MIDDLE_CLICK, movement);
    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

    //鼠标滚轮按下
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.MIDDLE_DOWN, movement);
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

    //鼠标滚轮放开
    handler.setInputAction(function (movement) {
        gis.mouse.fireEvent(eventType.MIDDLE_UP, movement);
    }, Cesium.ScreenSpaceEventType.MIDDLE_UP);

    //显示经纬度
    gis.mouseLongitude = undefined;
    gis.mouseLatitude = undefined;

    gis.cameraHeight = undefined;

    //鼠标移动坐标
    function positionOnMouseMove(movement) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            //将弧度转为度的十进制度表示
            gis.mouseLongitude = Cesium.Math.toDegrees(cartographic.longitude);
            gis.mouseLatitude = Cesium.Math.toDegrees(cartographic.latitude);
            //获取相机高度
            gis.cameraHeight = Math.ceil(viewer.camera.positionCartographic.height);
        }
        var lon = parseFloat(gis.mouseLongitude).toFixed(4);
        var lat = parseFloat(gis.mouseLatitude).toFixed(4);
        $('input[role="longitute"]').val(lon);
        $('input[role="latitude"]').val(lat);
//		$('div[role="lon_lat"]').html(lon + "," + lat);
    }

    gis.mouse.getCurrentClickedPosition = function (movement) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            //将弧度转为度的十进制度表示

            return {
                longitude: Cesium.Math.toDegrees(cartographic.longitude),
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                height: Math.ceil(viewer.camera.positionCartographic.height)
            }
        }
    };

    //鼠标滚动镜头高度变化
    function heightOnMouseWheelRoll() {
        gis.cameraHeight = Math.ceil(viewer.camera.positionCartographic.height);
    }


    //鼠标左键单击监听
    // function actionOnLeftClick(e) {
    //     var util = gis.util;
    //
    //     if (util.isGetPoint) {
    //         util.isGetPoint = false;
    //
    //         var pos = getCurrentClickedPosition(e);
    //         var point = {
    //             longitude: pos.longitude,
    //             latitude: pos.latitude
    //         };
    //
    //         util.currentGetPointCallback(point);
    //
    //         return;
    //     }
    //
    //     var picked = viewer.scene.pick(e.position);
    //
    //     if (Cesium.defined(picked)) {
    //         var id = Cesium.defaultValue(picked.id, picked.primitive.id);
    //         if (id instanceof Cesium.Entity) {
    //
    //
    //         } else {
    //
    //         }
    //     }
    // }

}());