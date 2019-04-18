var myChart = echarts.init(document.getElementById('china'));
    var provinces = ['shanghai', 'hebei', 'shanxi', 'neimenggu', 'liaoning', 'jilin', 'heilongjiang', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong', 'henan', 'hubei', 'hunan', 'guangdong', 'guangxi', 'hainan', 'sichuan', 'guizhou', 'yunnan', 'xizang', 'shanxi1', 'gansu', 'qinghai', 'ningxia', 'xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen'];
    var provincesText = ['上海', '河北', '山西', '内蒙古', '辽宁',
        '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西',
        '山东', '河南', '湖北', '湖南', '广东', '广西', '海南',
        '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海',
        '宁夏', '新疆', '北京', '天津', '重庆', '香港', '澳门'];

    var maxSize4Pin = 30;
    var minSize4Pin = 10;
    var mapName = '';
    var provinceData = [];
    var seriesData = [];
    var seriesDataPro = [];
    var statusFlag = 0;

    var chinaMap = new Map();
    chinaMap.set('上海市','上海').set('河北省','河北').set('山西省','山西').set('内蒙古自治区','内蒙古').set('辽宁省','辽宁')
            .set('吉林省','吉林').set('黑龙江省','黑龙江').set('江苏省','江苏').set('浙江省','浙江').set('安徽省','安徽')
            .set('福建省','福建').set('江西省','江西').set('山东省','山东').set('河南省','河南').set('湖北省','湖北')
            .set('湖南省','湖南').set('广东省','广东').set('广西壮族自治区','广西').set('海南省','海南').set('四川省','四川')
            .set('贵州省','贵州').set('云南省','云南').set('西藏自治区','西藏').set('陕西省','陕西').set('甘肃省','甘肃')
            .set('青海省','青海').set('宁夏回族自治区','宁夏').set('新疆维吾尔自治区','新疆').set('北京市','北京').set('天津市','天津')
            .set('重庆市','重庆').set('香港特别行政区','香港').set('澳门特别行政区','澳门');

    var setMaps = function (data, heads) {
        var myData = data;
        myData['level'] = 'country'; // "country" or "province"
        $.ajax({
            url: url_used_power_map,
            type: "POST",
            heads: heads,
            data: myData,
            success: function (res) {
                //console.info(res);
                seriesDataPro = [];
                statusFlag = 0;

                var mapData = res['data'];
                // 全国省份数据
                var toolTipData = transformation(mapData);
                seriesData = [];
                for (var i = 0; i < toolTipData.length; i++) {
                    seriesData[i] = {};
                    seriesData[i].name = toolTipData[i].provinceName;
                    seriesData[i].value = toolTipData[i].user_number;
                    seriesData[i].provinceKey = toolTipData[i].provinceKey;

                    getMaps(data, heads , toolTipData[i].provinceKey);
                }
                var max = Math.max.apply(Math, seriesData.map(function (o) {
                    return o.value
                }));
                var min = 0; // 侧边最大值最小值

                function getGeoCoordMap(name) {
                    name = name ? name : 'china';
                    /*获取地图数据*/
                    var geoCoordMap = {};
                    myChart.showLoading(); // loading start
                    var mapFeatures = echarts.getMap(name).geoJson.features;
                    myChart.hideLoading(); // loading end
                    mapFeatures.forEach(function (v) {
                        var name = v.properties.name; // 地区名称
                        geoCoordMap[name] = v.properties.cp; // 地区经纬度
                    });
                    return geoCoordMap;
                };

                function convertData(data) { // 转换数据
                    var geoCoordMap = getGeoCoordMap(mapName);
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var geoCoord = geoCoordMap[data[i].name]; // 数据的名字对应的经纬度
                        if (geoCoord) { // 如果数据data对应上，
                            res.push({
                                name: data[i].name,
                                value: geoCoord.concat(data[i].value),
                            });
                        }
                    }
                    return res;
                };
                // 初始化echarts-map
                initEcharts("china", "中国");

                function initEcharts(pName, Chinese_) {
                    var tmpSeriesData = pName === "china" ? seriesData : seriesDataPro;
                    var tmp = pName === "china" ? toolTipData : provinceData;
                    var option = {
                        /* title: {
                            text: Chinese_ || pName,
                            left: 'center'
                        },*/
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) { // 鼠标滑过显示的数据
                                if (pName === "china") {
                                    var toolTiphtml = ''
                                    for (var i = 0; i < tmp.length; i++) {
                                        if (params.name == tmp[i].provinceName) {
                                            toolTiphtml += tmp[i].provinceName +
                                                '<br>用户：' + tmp[i].user_number +
                                                '<br>设备：' + tmp[i].device_number;
                                        }
                                    }
                                    return toolTiphtml;
                                } else {
                                    var toolTiphtml = '';
                                    for (var i = 0; i < tmp.length; i++) {
                                        var ttmp = tmp[i];
                                        for(var j = 0 ; j < ttmp.length ; j++){
                                            if (params.name == ttmp[j].cityName) {
                                                toolTiphtml += ttmp[j].cityName +
                                                    '<br>用户：' + ttmp[j].user_number +
                                                    '<br>设备：' + ttmp[j].device_number;
                                            }
                                        }
                                    }
                                    return toolTiphtml;
                                }
                            }
                        },
                        visualMap: { //视觉映射组件
                            show: true,
                            min: min,
                            max: max, // 侧边滑动的最大值，从数据中获取
                            left: '5%',
                            bottom: $(window).height() > 900 ? '28%' : '37%',
                            inverse: false, //是否反转 visualMap 组件
                            // itemHeight:200,  //图形的高度，即长条的高度
                            // text: ['高', '低'], // 文本，默认为数值文本
                            calculable: false, //是否显示拖拽用的手柄（手柄能拖拽调整选中范围）
                            seriesIndex: 1, //指定取哪个系列的数据，即哪个系列的 series.data,默认取所有系列
                            orient: "horizontal",
                            inRange: {
                                color: ['#321D4A', '#7308C6'] // 渐变
                            },
                        },
                        geo: {
                            show: true,
                            map: pName,
                            roam: false,
                            label: {
                                normal: {
                                    show: false
                                },
                                emphasis: {
                                    show: false,
                                }
                            },
                            top: $(window).height() > 900 ? '0%' : "10%",//组件距离容器的距离
                            itemStyle: {
                                normal: {
                                    areaColor: '#3c8dbc', // 没有值得时候颜色
                                    borderColor: '#097bba',
                                },
                                emphasis: {
                                    areaColor: '#FF3BD9', // 鼠标滑过选中的颜色
                                }
                            }
                        },
                        series: [
                            {
                                name: '散点',
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                data: tmpSeriesData,
                                symbolSize: '1',
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: '{b}',
                                        position: 'right'
                                    },
                                    emphasis: {
                                        show: true
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#895139' // 字体颜色
                                    }
                                }
                            },
                            {
                                name: Chinese_ || pName,
                                type: 'map',
                                mapType: pName,
                                roam: false, //是否开启鼠标缩放和平移漫游
                                data: tmpSeriesData,
                                top: $(window).height() > 900 ? '0%' : "10%",//组件距离容器的距离
                                // geoIndex: 0,
                                // aspectScale: 0.75,       //长宽比
                                // showLegendSymbol: false, // 存在legend时显示
                                selectedMode: 'single',
                                label: {
                                    normal: {
                                        show: false, //显示省份标签
                                        textStyle: {
                                            color: "#895139"
                                        } //省份标签字体颜色
                                    },
                                    emphasis: { //对应的鼠标悬浮效果
                                        show: false,
                                        textStyle: {
                                            color: "#323232"
                                        }
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        borderWidth: .5, //区域边框宽度
                                        borderColor: '#FF3BD9', //区域边框颜色
                                        areaColor: "#321D4A", //区域颜色
                                    },
                                    emphasis: {
                                        borderWidth: .5,
                                        borderColor: '#FF3BD9',
                                        areaColor: "#FF3BD9",
                                    }
                                }
                            },
                            {
                                name: '点',
                                type: 'effectScatter', // 无效果scatter
                                coordinateSystem: 'geo',
                                symbol: 'circle', //气泡pin，'circle' | 'rectangle' | 'triangle' | 'diamond' | 'emptyCircle' | 'emptyRectangle' | 'emptyTriangle' | 'emptyDiamond'
                                symbolSize: function (val) {
                                    var a = (maxSize4Pin - minSize4Pin) / (max - min);
                                    var b = minSize4Pin - a * min;
                                    b = maxSize4Pin - a * max;
                                    return a * val[2] + b;
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (params) {
                                            //return params.data.value[2];
                                            return '';
                                        },
                                        textStyle: {
                                            color: '#fff',
                                            fontSize: 9
                                        }
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#00B4FF' //标志颜色'#F62157'
                                    }
                                },
                                zlevel: 6,
                                data: convertData(tmpSeriesData),
                            },
                        ]
                    };
                    // 针对海南放大
                    if (pName == '海南') {
                        option.series[1].center = [109.844902, 19.0392];
                        option.series[1].layoutCenter = ['50%', '50%'];
                        option.series[1].layoutSize = "300%";
                    } else { //非显示海南时，将设置的参数恢复默认值
                        option.series[1].center = undefined;
                        option.series[1].layoutCenter = undefined;
                        option.series[1].layoutSize = undefined;
                    }
                    myChart.setOption(option);
                    /* 响应式 */
                    $(window).resize(function () {
                        myChart.resize();
                    });

                    myChart.off("click");

                    if (pName === "china") { // 全国时，添加click 进入省级
                        myChart.on('click', function (param) {
                            // console.log(param.name);
                            if (param.data && param.data.provinceKey) {
                                var key = param.data.provinceKey;
                                // province(key);  省份请求
                                if (provinceData.length) {
                                    $('#back').removeClass('hidden');
                                    // 遍历取到provincesText 中的下标  去拿到对应的省js
                                    for (var i = 0; i < provincesText.length; i++) {
                                        if (param.name === provincesText[i]) {
                                            mapName = provincesText[i];
                                            //显示对应省份的方法
                                            showProvince(provinces[i], provincesText[i]);
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    } else { // 省份，添加双击 回退到全国
                        myChart.on("dblclick", function () {
                            $('#back').addClass('hidden');
                            mapName = '';
                            initEcharts("china", "中国");
                        });
                    }
                }

                // 展示对应的省
                function showProvince(pName, Chinese_) {
                    //这写省份的js都是通过在线构建工具生成的，保存在本地，需要时加载使用即可，最好不要一开始全部直接引入。
                    loadBdScript('$' + pName + 'JS','../map/province/' + pName + '.js', function () {
                        initEcharts(Chinese_);
                    });
                }

                // 加载对应的JS
                function loadBdScript(scriptId, url, callback) {
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    if (script.readyState) { //IE
                        script.onreadystatechange = function () {
                            if (script.readyState === "loaded" || script.readyState === "complete") {
                                script.onreadystatechange = null;
                                callback();
                            }
                        };
                    } else { // Others
                        script.onload = function () {
                            callback();
                        };
                    }
                    script.src = url;
                    script.id = scriptId;
                    document.getElementsByTagName("head")[0].appendChild(script);
                };

            }
        });
    };

    // 省份转换
    var transformation = function (obj) {
        for(var i = 0 ; i < obj.length ; i++){
            obj[i]['provinceName'] = chinaMap.get(obj[i]['provinceName']);
        }
        return obj;
    };

    // 获取地区数据
    var getMaps = function (data, heads, key) {
        var myData = data;
        myData['level'] = 'province';
        myData['key'] = key;
        $.ajax({
            url: url_used_power_map,
            type: "POST",
            heads: heads,
            data: myData,
            success: function (res) {
                provinceData.push(res['data']);
                ++statusFlag;
                setSeriesDataPro(res['data']);
            }
        });
    };

    var setSeriesDataPro = function (data) {
        for (var i = 0; i < data.length; i++) {
            var pro = {};
            pro.name = data[i].cityName;
            pro.value = data[i].user_number;
            seriesDataPro.push(pro);
        }
    };