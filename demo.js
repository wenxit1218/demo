/* -------------------------------------------------------------------
Maptomo Sample kintone portal csutomize.
@maptomo 2019
https://github.com/ushiront/maptomo-kinportal
-------------------------------------------------------------------*/

jQuery.noConflict();
(function ($) {
    'use strict';
    let a;

    // 各个tab的应用配置 --------------------------------------------

    // Tab app id
    const MAP_APPID = 107;
    const GANTTCHART_APPID = 108;
    const ECHART_APPID = 105;
    const GRID_APPID = 172;
    const hideCss = "https://cndevdemo.oss-cn-shanghai.aliyuncs.com/css/display-none20160226.css";

    var loginuser = kintone.getLoginUser();
    if (loginuser.code !== "Administrator") {
        $('head').append('<link href=' + hideCss + ' rel="stylesheet" type="text/css" />')
    }
    /*
        Tab action is template.
        https://github.com/kintone
        portal-design-templates
        */

    var buttonEls = document.querySelectorAll('.advanced-tab');
    var tabPanelEls = document.querySelectorAll('.advanced-panel-contents ');

    var removeAllButtonActive = function () {
        buttonEls.forEach(function (buttonEl) {
            buttonEl.classList.remove('advanced-tab--active');
        });
    };

    var removeAllButtonExpanded = function () {
        buttonEls.forEach(function (buttonEl) {
            buttonEl.setAttribute('aria-expanded', 'false');
        });
    };

    var removeAllTabPanelActive = function () {
        tabPanelEls.forEach(function (tabPanelEl) {
            tabPanelEl.classList.remove('advanced-panel-contents--active');
        });
    };

    var getTabNumber = function (buttonEl) {
        var number = 0;
        for (; number < buttonEls.length; number++) {
            if (buttonEls[number] === buttonEl) {
                break;
            }
        }
        return number;
    };


    var handleClick = function (evt) {
        removeAllButtonActive();
        evt.target.classList.add('advanced-tab--active');

        removeAllButtonExpanded();
        evt.target.setAttribute('aria-expanded', 'true');

        var tabNumber = getTabNumber(evt.target);

        removeAllTabPanelActive();
        tabPanelEls[tabNumber].classList.add('advanced-panel-contents--active');
    };

    buttonEls.forEach(function (buttonEl) {
        buttonEl.addEventListener('click', handleClick);
    });

    /*
        Original code.
        */

    /*
        Load MagicGrid min.js
        https://github.com/e-oj/Magic-Grid
        
    var script_magic_grid = document.createElement('script');
    script_magic_grid.src = 'https://unpkg.com/magic-grid/dist/magic-grid.min.js';
    document.body.appendChild(script_magic_grid);
        */
    /*
        Draw standard tab to kintone css
        ** It may stop working if the CSS specification changes.
        */
    var drawStandardVeiw = function () {
        var st_left = document.getElementsByClassName('st-left');
        var st_right = document.getElementsByClassName('st-right');
        st_left[0].appendChild(document.getElementsByClassName('ocean-portal-body-left')[0]);
        st_right[0].appendChild(document.getElementsByClassName('ocean-portal-body-right')[0]);

    };

    /*
        Draw MagicGrid by event type.
        */
    var drawGrid = function () {

        var maxColumns = 6;
        var magicGrid = new MagicGrid({
            container: '#gird-container',
            static: false,
            items: 100,
            animate: true,
            gutter: 30,
            maxColumns: maxColumns,
            useMin: true
        });
        magicGrid.listen();
    };

    // Tab01 --------------------------------------------
    var kintoneRecord = new kintoneJSSDK.Record();

    // GanttChart

    // Date conversion for Gantt.
    function convertDateTime(str) {
        if (str !== '') {
            return '/Date(' + new Date(str).getTime() + ')/';
        }

        return '';
    } // To HTML escape


    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    } // Record list of events.


    var ganttOption = {
        app: GANTTCHART_APPID // query: 'order by date asc' 甘特图

    };
    kintoneRecord.getAllRecordsByCursor(ganttOption).then(function (rsp) {
        var records = rsp.records;
        var todoData = []; // Don't display when there is no record.

        if (records.length === 0) {
            return;
        }

        $('<div>').attr({
            id: 'gantt',
            class: 'shadow'
        }).appendTo('#ganttChart');
        // I create an element of Gantt chart.

        var ganttMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        var ganttDow = ['日', '一', '二', '三', '四', '五', '六'];
        var ganttWaitmessage = '请等待显示屏'; // Set the record.

        for (var i = 0; i < records.length; i++) {
            var colorGantt = 'ganttGray';

            switch (records[i].Priority.value) {
                case 'A':
                    colorGantt = 'ganttRed';
                    break;

                case 'B':
                    colorGantt = 'ganttOrange';
                    break;

                case 'C':
                    colorGantt = 'ganttGreen';
                    break;

                case 'D':
                    colorGantt = 'ganttBlue';
                    break;

                case 'E':
                    colorGantt = 'ganttYellow';
                    break;

                case 'F':
                    colorGantt = 'ganttGray';
                    break;

                default:
                    colorGantt = 'ganttGray';
            }

            var descGantt = '<strong>' + escapeHtml(records[i].To_Do.value) + '</strong>';

            if (records[i].From.value) {
                descGantt += '<br />' + 'From: ' + escapeHtml(records[i].From.value);
            }

            if (records[i].To.value) {
                descGantt += '<br />' + 'To: ' + escapeHtml(records[i].To.value);
            }

            if (records[i].Priority.value) {
                descGantt += '<br />' + escapeHtml(records[i].Priority.value);
            }

            var obj = {
                id: escapeHtml(records[i].$id.value),
                name: escapeHtml(records[i].To_Do.value),
                values: [{
                    from: convertDateTime(records[i].From.value),
                    to: convertDateTime(records[i].To.value),
                    desc: descGantt,
                    label: escapeHtml(records[i].To_Do.value),
                    customClass: escapeHtml(colorGantt)
                }]
            };
            todoData.push(obj);
        } // Set in Gantt object.


        $('#gantt').gantt({
            source: todoData,
            navigate: 'scroll',
            scale: 'days',
            maxScale: 'months',
            minScale: 'days',
            months: ganttMonths,
            dow: ganttDow,
            left: '70px',
            itemsPerPage: 100,
            waitText: ganttWaitmessage,
            scrollToToday: true
        });
    }).catch(function (err) {
        $('#gantt').innerText = err;
    });


    // map
    var LAT = 'lat'; // 纬度字段名
    var LNG = 'lng'; // 经度字段名
    var ADDRESS = 'address'; // 住址
    var COMPANYNAME = 'companyname'; // 公司名
    var MAPSPACE = 'Map'; // 空白栏的元素id（展示地图用）
    var icon = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png'; // 标注图标
    // 获取经纬度

    function geoLATLNG(rec) {
        var addressList = [];
        for (var i = 0; i < rec.length; i++) {
            if (rec[i][ADDRESS].value !== undefined) {
                if (rec[i][ADDRESS].value.length > 0) {
                    addressList.push(rec[i][ADDRESS].value);
                }
            }
        }
        // 判断是否输入了地址信息
        if (addressList.length <= 0) {
            return event;
        }

        // 通过地址获取并更新经纬度
        for (var i = 0; i < addressList.length; i++) {
            return new kintone.Promise(function (resolve, reject) {
                AMap.plugin('AMap.Geocoder', function () {
                    var geocoder = new AMap.Geocoder({});
                    geocoder.getLocation(addressList[i], function (status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            if (result.geocodes) {
                                record[LAT].value = result.geocodes[0].location.lat;
                                record[LNG].value = result.geocodes[0].location.lng;
                            }
                        } else {
                            $('#map').innerText = '无法获取经纬度';
                        }
                        resolve(event);
                    });
                });
            });
        }
    }

    function setLocationIndex(rsp) {
        var latList = [];
        var lngList = [];
        var nameList = [];
        var rec = rsp.records;

        for (var i = 0; i < rec.length; i++) {
            if (rec[i].lat.value !== undefined && rec[i].lng.value !== undefined) {
                if (rec[i].lat.value.length > 0 && rec[i].lng.value.length > 0) {
                    latList.push(parseFloat(rec[i][LAT].value));
                    lngList.push(parseFloat(rec[i][LNG].value));
                    nameList.push(rec[i][COMPANYNAME].value);
                }
            }
        }

        if (latList.length === 0) {
            return;
        }

        $('<div>').attr({
            id: 'map',
            class: 'shadow',
            style: 'height: 100%;'
        }).appendTo('#mapChart');
        var latlng = 0;
        var map = new AMap.Map('map');
        var markerList = new Array(); // 存放标注点对象的数组

        for (var j = 0; j < latList.length; j++) {
            if (isNaN(latList[j]) === false && isNaN(lngList[j]) === false) {
                if (latlng === 0) {
                    var position = new AMap.LngLat(lngList[j], latList[j]);
                    map.setZoomAndCenter(11, position);
                    latlng = 1;
                }

                var marker = new AMap.Marker({
                    position: new AMap.LngLat(lngList[j], latList[j]),
                    offset: new AMap.Pixel(-10, -10),
                    icon: icon,
                    title: nameList[j]
                });
                markerList.push(marker);
            }
        }
        map.add(markerList);
    }


    var mapOption = {
        app: MAP_APPID // 高德地图
    };

    kintoneRecord.getAllRecordsByCursor(mapOption).then(function (rsp) {
        geoLATLNG(rsp);
        setLocationIndex(rsp);
    }).catch(function (err) {
        $('#map').innerText = '获取数据失败';
    });

    // echart

    var pcSetting = {
        type: 'pc',
        legend: {
            top: '15%'
        },
        grid: {
            left: '10%',
            width: '40%',
            top: '30%'
        },
        pie: {
            center: ['77%', '55%'],
            radius: '45%'
        },
        style: 'width: 800px; height: 270px; margin: 0 auto;'
    };

    function generateGraph(setting) {

        var chartOption = {
            app: ECHART_APPID, // 双十一
            query: 'order by date asc'
        };
        var myChart = echarts.init(document.getElementById('graph'));
        myChart.on('updateAxisPointer', function (event) {
            var xAxisInfo = event.axesInfo[0];

            if (xAxisInfo) {
                var dimension = xAxisInfo.value + 1;
                myChart.setOption({
                    series: {
                        id: 'pie',
                        label: {
                            formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                        },
                        encode: {
                            value: dimension,
                            tooltip: dimension
                        }
                    }
                });
            }
        });
        kintoneRecord.getAllRecordsByCursor(chartOption).then(function (rsp) {
            var records = rsp.records;
            var graphData = {
                'channel1': ['京东'],
                'channel2': ['淘宝'],
                'channel3': ['拼多多'],
                'channel4': ['天猫'],
                'channel5': ['考拉']
            };
            var dateArray = ['渠道'];

            for (var record of records) {
                var dateKey = record.date.value;
                graphData.channel1.push(record.channel1.value);
                graphData.channel2.push(record.channel2.value);
                graphData.channel3.push(record.channel3.value);
                graphData.channel4.push(record.channel4.value);
                graphData.channel5.push(record.channel5.value);
                dateArray.push(dateKey);
            }

            var option = {
                legend: setting.legend,
                title: {
                    text: '各渠道实时销量统计',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    showContent: false
                },
                dataset: {
                    source: [dateArray, graphData.channel1, graphData.channel2, graphData.channel3, graphData.channel4, graphData.channel5]
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    gridIndex: 0,
                    name: '单位（万台）'
                },
                grid: setting.grid,
                series: [{
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row'
                }, {
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row'
                }, {
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row'
                }, {
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row'
                }, {
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row'
                }, {
                    type: 'pie',
                    id: 'pie',
                    radius: setting.pie.radius,
                    center: setting.pie.center,
                    label: {
                        formatter: '{b}: {@2019-11-11} ({d}%)'
                    },
                    encode: {
                        itemName: '渠道',
                        value: '2019-11-11',
                        tooltip: '2019-11-11'
                    }
                }]
            };
            myChart.setOption(option);
        }).catch(function (err) {
            document.getElementById('graph').innerText = err;
        });
    }

    function init(setting) {
        if (document.getElementById('graph') !== null) {
            return;
        }
        $('<div>').attr({
            id: 'graph',
            style: setting.style
        }).appendTo('#echart');
    }

    init(pcSetting);
    generateGraph(pcSetting);

    $('#ganttLink').attr('href', '../k/' + GANTTCHART_APPID + '/').text('用甘特图显示ToDo');
    $('#mapLink').attr('href', '../k/' + MAP_APPID + '/').text('利用高德地图的api在kintone上显示地图信息');
    $('#echartLink').attr('href', '../k/' + ECHART_APPID + '/').text('双十一销量实时统计图表');

    // Tab02 

    kintone.api(kintone.api.url('/k/api/space/list', true), "POST", {}).then(function (resp) {
        var spaceInfo = resp.result.items;
        spaceInfo.forEach(function (value) {
            var spaceId = value.id;
            getAppId(spaceId).then(setSpaceInfo).then(setAppShow);
        })
    })

    function getAppId(spaceID) {
        var paramForSpace = {
            'id': spaceID
        };
        return kintone.api(kintone.api.url('/k/v1/space', true), 'GET', paramForSpace);
    }

    function setSpaceInfo(spaceResp) {
        var spaceShowId = "spaceShow" + spaceResp.id;
        var appShowId = "appShow" + spaceResp.id;
        var url = "/k/#/space/" + spaceResp.id;
        var spaceEl = '<section class="basic-container">' +
            '<ul class="basic-spaceSet">' +
            '<li class="basic-space">' +
            '<a class="basic-space-link"  id=' + spaceShowId + ' href=' + url + '>' +
            '<div class="basic-space-img-container">' +
            '<div class="basic-space-img" style="background-image: url(' + spaceResp.coverUrl + ');"></div>' +
            '</div>' +
            '<p class="basic-space-name">' + spaceResp.name +
            '</p>' +
            '</a>' +
            '</li>' +
            '<li class="basic-space-introduction">' +
            '<p>' + spaceResp.body + '</p>' +
            '</li>' +
            '<ul  id=' + appShowId + ' class="basic-appSet">' +
            '</ul>' +
            '</ul>' +
            '</section>"';
        $("#spaceList").append(spaceEl);

        var ele = "#appShow" + spaceResp.id;
        return setAppInfo(spaceResp.attachedApps, ele, spaceResp.id);
    }

    function setAppShow(spaceId) {
        var spaceShowId = "#spaceShow" + spaceId;
        var appShowId = "#appShow" + spaceId;
        $(spaceShowId).hover(function (event) {
            event.stopPropagation();
            $(appShowId).fadeIn(1400).css('display', 'flex');
            $('.basic-appSet:not(' + appShowId + ')').slideUp(500);
            return false;
        });
    }

    // 获取空间内应用的信息并动态生成HTML
    function setAppInfo(apps, ele, spaceId) {
        var appIds = [];
        $.each(apps, function (key, singleApp) {
            appIds.push(singleApp.appId);
        });

        return kintone.api(kintone.api.url('/k/api/app/list'), 'POST', { 'apps': appIds }).then(function (resp) {
            $.each(resp.result.appList, function (index, app) {
                $(ele).append(
                    '<li class="basic-app">' +
                    '<a class="basic-app-link" href="../k/' + app.id + '/">' +
                    '<div class="basic-app-icon">' +
                    '<img src="' + app.icons.NORMAL + '"' + '/">' +
                    '<p class="basic-app-name">' + app.name + '</p>' +
                    '</div>' +
                    '</a>' +
                    '</li>');
            });
            return spaceId;
        });
    }

    $(document).click(function (event) {
        var disappear_target = $('.basic-spaceSet');
        if (!disappear_target.is(event.target) && disappear_target.has(event.target).length === 0) {
            $('.basic-appSet').slideUp(1400);
        }
    });

    // Tab04 --------------------------------------------
    var query = {
        'app': GRID_APPID, //appID
        'query': 'order by Update_day desc',
        'size': 100 //max 500
    };

    var elem_main = document.getElementById('gird-container');
    var local_domain = location.hostname;

    // Post kintone cursor api
    kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', query, function (resp1) {
        // Get records by cursor id
        return kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', { 'id': resp1.id }, function (resp) {

            var records = resp.records;
            var i = 0;
            for (; i < records.length; i++) {

                // -- Link element
                var elem_link = document.createElement('a');
                var link = records[i]['Link']['value'];

                // Check the value is numeric
                if (isFinite(link)) {
                    link = location.origin + "/k/" + records[i]['Link']['value'];
                }

                if (link.indexOf(local_domain) === -1) {
                    elem_link.setAttribute('target', '_blank');
                }
                elem_link.setAttribute('href', link);

                // -- Image element
                var elem_img = document.createElement('img');
                elem_img.setAttribute('src', records[i]['Image']['value']);

                // -- Item element
                var elem_item = document.createElement('div');
                elem_item.setAttribute('class', 'grid-item');

                // -- Apend
                elem_link.appendChild(elem_img);
                elem_link.appendChild(document.createTextNode(records[i]['Name']['value']));
                elem_item.appendChild(elem_link);
                elem_main.appendChild(elem_item);

            }
            drawGrid();

        }, function (error) {
            // error
            console.log(error);
            elem_main.appendChild(document.createTextNode(error.message))
        });
    });


    // Tab05 --------------------------------------------
    drawStandardVeiw();

})(jQuery);