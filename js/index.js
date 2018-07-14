$(() => {
    const sAreaStion = ["温州市区", "洞头", "瑞安", "乐清", "永嘉", "苍南", "平阳", "泰顺", "文成"],
        sTypeStion = ["国家气象观测站", "区域自动站", "乡镇代表站", "海洋气象浮标站", "船舶站", "雷达站"];
    let sArea = [],
        sType = [],
        stationDate = "",
        searchmess,
        contentPath = {
            ShortPrediction: "/service/KT_S_Site-service/rest",
        }
    parent.asd = []
    let sand = {
        init: () => {
            sand.listening()
            sand.clickStation()
        },
        listening: () => {
            let flag = true;
            $("#menuTitle").on("click", () => {
                if (flag) {
                    $(".menu-wrap").animate({
                        marginLeft: "0"
                    }, 500)
                    $("#arrow").css({
                        transform: "rotate(0deg)"
                    })
                    flag = !flag
                } else {
                    $(".menu-wrap").animate({
                        marginLeft: "-470px"
                    }, 500)
                    $("#arrow").css({
                        transform: "rotate(180deg)"
                    })
                    flag = !flag
                }

            })
            $(".menu-inner-left").on("click", "div", function () {
                $("." + $(this)[0].className + "-inner").css({
                    display: "block"
                }).siblings().css({
                    display: "none"
                })
                $(".menu-inner-left").css({
                    display: "block"
                })
            })
            $("#station_message").on("click", "li", function () {
                $(this).addClass("active_hide").siblings().removeClass("active_hide")
                var lon = $($(this).find("span")[1]).html();
                var lat = $($(this).find("span")[2]).html();
                if (lon, lat) {
                    gis.util.flyToDestination(lon, lat);
                }
            })
            $("#search_stations").on("click",function(){
                var rightList=[]
                // var lis =$("#station_message").find("li")
                // console.log(searchmess)
                for(var i = 0;i<searchmess.length;i++){
                    var stationObj ={
                        name:searchmess[i].stationName,
                        lon:Math.round(searchmess[i].lon*10000)/10000,
                        lat:Math.round(searchmess[i].lat*10000)/10000
                    }
                    if($("#stations_name").val().trim()){
                        if(stationObj.name.indexOf($("#stations_name").val().trim()) != -1 ){
                            rightList.push(stationObj)
                        }
                    }
                    
                }
                var liss = ""
                for (let i = 0; i < rightList.length; i++) {
                    liss += `<li>
                            <span class='sname'>${rightList[i].name}</span>
                            <span class='slat'>${rightList[i].lon}</span>
                            <span class='slon'>${rightList[i].lat}</span>
                            </li>`
                }
                $("#station_message").html(liss)
            })
            let sAreahtml = "",
                sTypehtml = "";
            for (let i = 0; i < sAreaStion.length; i++) {
                sAreahtml += `<span>${sAreaStion[i]}</span>`
            }
            for (let i = 0; i < sTypeStion.length; i++) {
                sTypehtml += `<span>${sTypeStion[i]}</span>`
            }
            $("#quyuInner").html(sAreahtml)
            $("#leixingInner").html(sTypehtml)
        },
        queryData: () => {
            let sAreaIds = sArea.join(",");
            let sTypeIds = sType.join(",");
            if (!(sArea.length + sType.length)) {
                $("#alarm").hide()
                $("#station_list").hide()
            }

            // sand.station_message()
            $.ajax({
                // url: "http://10.138.69.220/service/KT_S_Site-service/rest/autoStation/getAllAutoStations",
                url: `${contentPath.ShortPrediction}/autoStation/getAllAutoStation`,
                dataType: "json",
                type: 'POST',
                async: true,
                data: {
                    "sArea": sAreaIds,
                    "sType": sTypeIds
                },
                success: (data) => {
                    console.log(data)
                    sand.addMarkers(data.data)
                    sand.station_message(data.data)
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    console.log("error")
                }
            });
        },
        // 左侧分类
        clickStation: () => {
            $("#quyuInner").on("click", "span", function () {
                sType = []
                sArea = []
                $("#leixingInner > span").removeClass("hide_span")
                $(this).hasClass("hide_span") ? $(this).removeClass("hide_span") : $(this).addClass("hide_span")
                $("#station_list").hide()
                for (let i = 0; i < $(this).parent().find("span").length; i++) {
                    if ($($(this).parent().find("span")[i]).hasClass("hide_span")) {
                        $("#station_list").show()
                        sArea.push($($(this).parent().find("span")[i]).html())
                    }
                }
                $.unique(sArea)
                sand.queryData()
            })
            $("#leixingInner").on("click", "span", function () {
                sType = []
                sArea = []
                $("#quyuInner > span").removeClass("hide_span")
                $(this).hasClass("hide_span") ? $(this).removeClass("hide_span") : $(this).addClass("hide_span")
                for (let i = 0; i < $(this).parent().find("span").length; i++) {
                    if ($($(this).parent().find("span")[i]).hasClass("hide_span")) {
                        sType.push($($(this).parent().find("span")[i]).html())
                    }
                }
                $.unique(sArea)
                sand.queryData()
            })
        },
        // 根据经纬度增加图标
        addMarkers: (data) => {
            sand.clearMapMarker(parent.asd)
            var img = {
                '国家气象观测站': `js/map/img/mapIcon/gjqxgcz.png`,
                '区域自动站': `js/map/img/mapIcon/qyzdz.png`,
                '乡镇代表站': `js/map/img/mapIcon/xzz.png`,
                '海洋气象浮标站': `js/map/img/mapIcon/fbz.png`,
                '船舶站': `js/map/img/mapIcon/cbz.png`,
                '雷达站': `js/map/img/mapIcon/ldz.png`
            }
            for (let i = 0; i < data.length; i++) {
                parent.addMarker_ById({
                    id: data[i].stationName,
                    uidName: data[i].stationName,
                    longitude: data[i].lon,
                    latitude: data[i].lat,
                    width: 15,
                    height: 15,
                    marker: 'videoMarker',
                    // img: img,
                    img: img[data[i].type],
                    dataObj: data[i],
                    onClick: function (e, data) {
                        console.log(data)
                        sand.createHtml(data, e);
                        if (data.primitive && data.primitive.dataObj) {
                            sand.queryTriChart(data);
                        }
                        $("#alarm").show()
                    }
                });
                parent.asd.push(data[i].stationName)
            }
        },
        // 清除图标
        clearMapMarker: () => {
            for (var i = 0; i < parent.asd.length; i++) {
                parent.removeMarker(parent.asd[i])
            }
            parent.asd = [];
        },
        // 图表数据
        queryTriChart: (data) => {
            var autoStationList = data.primitive.dataObj.autoStationList;
            var prsArr = []; //气压
            var tempArr = []; //温度
            var tempDate = [];
            var dptArr = []; //湿度
            var dateArr = []
            var observTimes = data.observTimes != undefined ? data.observTimes : "";
            var rainArr = []; //降雨
            for (var y = 0; y < autoStationList.length; y++) {
                var item = autoStationList[y];
                dateArr.unshift(item.observTimes)
                if (item.vapourPress == 999999.0) {
                    prsArr.unshift(0)
                } else {
                    prsArr.unshift(item.vapourPress)
                }
                tempArr.unshift(item.dryBulTemp)
                if (item.relHumidity == 999999.0) {
                    dptArr.unshift(0)
                } else {
                    dptArr.unshift(item.relHumidity)
                }
                if (item.precipitation == 999999.0) {
                    rainArr.unshift(0)
                } else {
                    rainArr.unshift(item.precipitation)
                }
                var obj = {
                    value: item.windVelocity,
                    symbolRotate: 360 - item.windDirect, //偏转角度
                    symbolOffset: [0, 0] //偏移位置
                };
            }
            sand.drawsZXT(`${data.primitive.dataObj.country}-${data.primitive.dataObj.stationName}(${data.primitive.dataObj.type}) ${data.primitive.dataObj.observTimes}`, dateArr, prsArr, tempArr, dptArr);
        },
        // 图表
        drawsZXT: (observTimes, x, y1, y2, y3) => {
            var xData = x;
            var y1Data = y1
            var y2Data = y2
            var y3Data = y3
            var num = xData.length
            var trilinearChartId = document.getElementById("trilinearChart");
            trilinearChartId.style.height = "300px"
            trilinearChartId.style.width = "550px"
            trilinearChart = echarts.init(trilinearChartId);
            var option = {
                title: {
                    text: "温度、湿度、气压",
                    subtext: observTimes,
                    x: 'center',
                    y: '0',
                },
                grid: {
                    left: 30,
                    top: 80,
                    right: 40,
                    bottom: 30
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params, ticket) {
                        var relVal = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            if (params[i].seriesName == "温度")
                                relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "℃";
                            else if (params[i].seriesName == "湿度")
                                relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "%";
                            else
                                relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "HPA";

                        }
                        return relVal;
                    }

                },

                legend: {
                    data: ['气压', '温度', '湿度'],
                    y: 50
                },
                toolbox: {
                    show: false,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        dataView: {
                            readOnly: false
                        },
                        magicType: {
                            type: ['line', 'bar']
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis: [{
                    type: 'category',
                    splitNumber: num,
                    interval: 1,
                    data: xData
                }],
                yAxis: [{
                    type: 'value',
                    name: '温度/湿度',
                }, {
                    type: 'value',
                    name: '气压(HPA)',
                    axisLabel: {}
                }],
                series: [{
                    name: '气压',
                    type: 'line',
                    yAxisIndex: 1,
                    data: y1Data
                }, {
                    name: '温度',
                    type: 'line',
                    yAxisIndex: 0,
                    data: y2Data
                }, {
                    name: '湿度',
                    type: 'line',
                    yAxisIndex: 0,
                    data: y3Data
                }]
            };
            trilinearChart.hideLoading();
            trilinearChart.setOption(option);
        },
        // 弹框
        createHtml: (data, e) => {
            console.log(data)
            var dataObj = data.primitive.dataObj;

            
            // $("#alarm").css("left", `${e.position.x + 50}px`)
            // $("#alarm").css("top", `${e.position.y}px`)
            html = `<div id="pop-body"><span id="alarm_closr">X</span></div>
                    <div id="trilinearChart" style="width: 100%;"></div>
                    `
            $("#alarm").html(html)
            $("#alarm").css({
                "width": "545px",
                "min-height": "200px",
                "border": "solid #347fc6 1px",
                "position": "absolute",
                "z-index": "100",
                "padding": "10px",
                "border-radius": "10px",
                "box-shadow": "0px 0px 5px #555",
                "background-color": "#ffffff"
            })
            $("#alarm_closr").css({
                "position": "absolute",
                "z-index": "100",
                "right": "10px",
                "top": "0",
                "padding": "10px"
            })
            $("#alarm_closr").on("click", () => {
                $("#alarm").hide()
            })
            // console.log($("#alarm").outerHeight())
            // console.log($("#alarm").outerWidth())            
            ;((e.position.x+30+$("#alarm").outerWidth())>$(window).width())?($("#alarm").css("left", `${$(window).width()-$("#alarm").outerWidth()}px`)): $("#alarm").css("left", `${e.position.x+30}px`)
            ;((e.position.y+$("#alarm").outerHeight())>$(window).height())?($("#alarm").css("top", `${$(window).height()-$("#alarm").outerHeight()-100}px`)): $("#alarm").css("top", `${e.position.y}px`)
        },
        //右侧弹框
        station_message: (data) => {
            var lis = ""
            // console.log(data)
            for (let i = 0; i < data.length; i++) {
                lis += `<li>
                        <span class='sname'>${data[i].stationName}</span>
                        <span class='slat'>${Math.round(data[i].lat*10000)/10000}</span>
                        <span class='slon'>${Math.round(data[i].lon*10000)/10000}</span>
                        </li>`
            }
            searchmess=data
            // // 测试
            // var k=0;
            // searchmess="789987789987789987789"
            // for (let i = 0; i < 30; i++) {
            //     k+=0.05
            //     lis += `<li>
            //             <span class='sname'>温州${i}</span>
            //             <span class='slat'>${120.7878+k}</span>
            //             <span class='slon'>27.9528</span>
            //             </li>`
            // }
            $("#station_message").html(lis)
        }
    }
    sand.init()
    var topRightToolMenu = {
        init: () => {
            topRightToolMenu.listening();
        },
        listening: () => {
            //定位
            $(".map_point").click(function () {
                var lon = $('input[role="longitute"]').val();
                var lat = $('input[role="latitude"]').val();
                if (lon, lat) {
                    gis.util.flyToDestination(lon, lat);
                }
            })

            $('span[role="default_map_extend"]').click(function () {
                backToDefaultView();
            })
            /**经纬度*/
            $(".lat_and_long_img").click(function () {
                if ($('.lat_and_long_img').hasClass("lat_and_long_imgChecked")) {
                    $('.lat_and_long_img').removeClass("lat_and_long_imgChecked");
                    $('.lat_and_long_img span').css("color", "#000");
                } else {
                    $('.lat_and_long_img').addClass("lat_and_long_imgChecked");
                    $('.lat_and_long_img span').css("color", "#347EC7");
                }
            })
            /**默认图层*/
            $(".default_map_img").click(function () {
                if ($('span[role="default_map"]').hasClass("on_icon")) {
                    $('span[role="default_map"]').removeClass("on_icon").addClass("drop_icon");
                }
                var height = $("div[role='default_map_menu']").height();
                if (height > 0) {
                    $("div[role='default_map_menu']").animate({
                        height: "0px"
                    }, 300);
                    $('.default_map_img').removeClass("default_map_imgChecked");
                    $('.default_map_img span').css("color", "#000");
                } else {
                    $('.default_map_img').addClass("default_map_imgChecked");
                    $("div[role='threeD_menu']").animate({
                        height: "0px"
                    }, 300);
                    $("div[role='tool_menu']").animate({
                        height: "0px"
                    }, 300);
                    $("div[role='analysis_menu']").animate({
                        height: "0px"
                    }, 300);
                    $("div[role='default_map_menu']").animate({
                        height: "55px"
                    }, 300);
                    $('.default_map_img span').css("color", "#347EC7");
                }
            })
            /**右上角工具栏选择*/
            $(".tool_div").click(function () {
                var currentType = $(this).attr("data-id");
                var type;
                $(".tool_div").each(function () {
                    type = $(this).attr("data-id");
                    $("." + type).removeClass(type + "Checked");
                    $("." + type + " span").css("color", "#000");
                })
                $("." + currentType).addClass(currentType + "Checked");
                $("." + currentType + " span").css("color", "#347EC7");
                var spanName;
                if ($(this).hasClass("map_div")) {
                    $(".default_map_img").removeClass("default_map_imgChecked").removeClass("image_map_menu_divChecked").addClass(currentType + "Checked");
                    if (currentType == "default_map_menu_div") {
                        switchToAdministrativeDivisionsLayer();
                        morphTo2D();
                        spanName = "行政区划";
                    } else {
                        switchToImageLayer();
                        morphTo3D();
                        spanName = "影像图";
                    }
                    $(".default_map_img span:eq(1)").html(spanName);
                    $("div[role='default_map_menu']").animate({
                        height: "0px"
                    }, 300);
                }
                if ($(this).hasClass("layer_tool")) {
                    if (currentType == "drawPolygon_menu_div") {
                        drawPolygon();
                    } else if (currentType == "circle_menu_div") {
                        drawCircle();
                    } else {
                        clearDrawing();
                        latLons = "";
                    }
                    $("div[role='tool_menu']").animate({
                        height: "0px"
                    }, 300);
                }
            })
        }
    }
    topRightToolMenu.init()
})