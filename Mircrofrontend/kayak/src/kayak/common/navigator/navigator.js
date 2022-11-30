// 依赖高德地图
// 建议通过https引用 高德的api js
;(function () {
    var handle, CFG, _fn, MAP = {};

    handle = {
        // 获取坐标
        getLoc: function (callback, timeout) {
            /* data.code
             3 : 超时
             1 : 未开启定位
             */
            _fn.getLocation(function (data) {
                var position = [],
                    coords;
                if (data && data.coords) {
                    coords = data.coords;
                    position.push(coords.longitude);
                    position.push(coords.latitude);
                }
                //position = [104.06667,30.66667];
                //alert( position.join( ',' ) );
                callback(position, data.code);
            }, timeout);
        },
        // 获取高德坐标 wr
        getAmapLoc: function (callback, timeout, urlParam) {
            urlParam = urlParam || _fn.getUrlParam();
            // 如果url中有参数则直接返回坐标参数
            if ( urlParam.lat && urlParam.lng ) {
                callback( [urlParam.lng, urlParam.lat], '' );
                return;
            }

            _fn.getAmapLocation(function (data) {
                var data = data || {},
                    position = [];
                if (data && data.code != '-1') {
                    position.push( data.getLng() );
                    position.push( data.getLat() );
                }
/*                console.log( '测试代码，一定要删' );
                position = [104.06667,30.66667];
                data.msg = '';*/
                callback( position, data.msg || '' );
            }, timeout);
        },
        // 获取附近POI
        getPoiByAmapLoc: function (loc, callback) {
            if (!window.AMap) {
                return callback({
                    code: '-1',
                    msg: '找不到高德API'
                });
            }
            if (!loc || loc.length != 2) {
                return callback({
                    code: '-1',
                    msg: '坐标错误'
                });
            }
            var geocoder = new AMap.Geocoder({
                radius: 200,
                extensions: 'all'
            });
            geocoder.getAddress(new AMap.LngLat(loc[0], loc[1]), function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    callback(result.regeocode);
                } else {
                    callback({
                        code: '-1',
                        msg: '高德API调用失败'
                    });
                }
            });
        },
        // 通过坐标获取名字
        getLocName: function (pos, callback) {
            handle.getLocInfo(pos, function (result) {
                // console.log(result);
                callback(_fn.formatAddress(result));
            });
            /*
             MAP.geocoder = MAP.geocoder || new AMap.Geocoder( {
             radius : 100,
             extensions : 'all'
             } );

             MAP.geocoder.getAddress( pos, function( status, result ) {
             if (status == 'complete' && result.info == 'OK') {
             callback( _fn.formatAddress( result ) );
             return;
             }

             callback();
             } );
             */
        },
        getLocInfo: function (pos, callback) {
            pos = typeof pos === 'string' ? pos : pos.join(',');
            MAP.geocoder = MAP.geocoder || new AMap.Geocoder({
                    radius: 100,
                    extensions: 'all'
                });
            MAP.geocoder.getAddress(pos, function (status, result) {
                if (status == 'complete' && result.info == 'OK') {
                    callback(result);
                    return;
                }
                callback();
            });
        },
        // 获取两个点之间的距离
        getDistance: function (startLoc, endLoc) {
            var result = -1,
                lnglat;
            if (!startLoc || startLoc.length != 2
                || !endLoc || endLoc.length != 2) {
                return result;
            }
            lnglat = new AMap.LngLat(startLoc[0], startLoc[1]);
            return lnglat.distance(endLoc);
        },
        formatAddress: function (data) {
            return _fn.formatAddress(data);
        }
    }
    _fn = {
        // 获取地址坐标
        getLocation: function (callback, timeout) {
            timeout = timeout || 5000; //  默认5秒
            // 如果没有地理信息则通过IP获取
            if (!window.navigator || !window.navigator.geolocation) {
                callback();
                return;
            }
            // 获取地址信息
            window.navigator.geolocation.getCurrentPosition(callback, callback, {
                enableHighAccuracy: true,
                timeout: timeout
            });	// 5秒则超时
        },
        // 获取高德地址坐标 wr
        getAmapLocation: function (callback, timeout) {
            timeout = timeout || 7000;
            var timmer,
                hasLocaioned = false;

            if (!window.AMap) {
                return callback({
                    code: '-1',
                    msg: '找不到高德API'
                });
            }
            AMap.plugin('AMap.Geolocation', function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: timeout,
                    convert: true
                }), loaded = false;

                AMap.event.addListener(geolocation, 'complete', function (data) {
                    if ( hasLocaioned ) {
                        return;
                    }
                    clearTimeout( timmer );
                    hasLocaioned = true;

                    if (loaded) return;
                    loaded = true;
                    if (data.accuracy && data.position) { //
                        callback(data.position);
                    } else {
                        callback({
                            code: '-1',
                            msg: '定位失败'
                        });
                    }
                });
                AMap.event.addListener(geolocation, 'error', function (data) {
                    if ( hasLocaioned ) {
                        return;
                    }
                    clearTimeout( timmer );
                    hasLocaioned = true;
                    var str = '';
                    switch (data.info) {
                        case 'PERMISSION_DENIED':
                            str = '已拒绝定位';
                            break;
                        case 'POSITION_UNAVAILBLE':
                            str = '定位不可用';
                            break;
                        case 'TIMEOUT':
                            str = '定位超时';
                            break;
                        default:
                            str = '定位失败';
                            break;
                    }
                    callback({
                        code: '-1',
                        msg: str
                    });
                });
                geolocation.getCurrentPosition();
                timmer = setTimeout( function() {
                    if ( hasLocaioned ) {
                        return;
                    }
                    hasLocaioned = true;
                    callback({
                        code: '-1',
                        msg: '定位失败'
                    });
                }, timeout );
            });
        },
        formatAddress: function (data) {
            var address = '';
            if (data && data.regeocode && data.regeocode.pois && data.regeocode.pois[0]) {
                //address += data.regeocode.pois[0].address + ' ' + data.regeocode.pois[0].name;
                address += data.regeocode.pois[0].name;
            }
            return address;
        },
        getUrlParam : function( parmUrl ) {
            parmUrl = parmUrl || window.location.href;
            var loc = parmUrl.split( '?' ),
                search = loc[1] || '',
                url = '',
                result = {}, i, s;

            search = search.split( '#' )[0] || '';
            search = search.split( '&' );

            for ( i = 0; s = search[i]; ++i ) {
                s = s.split( '=' );
                if ( s.length == 2 ) {
                    result[s[0]] = decodeURIComponent(s[1]);
                }

            }
            return result;
        }
    }

    define('kayak/common/navigator/navigator', function (require, exports, module) {
        require('https://webapi.amap.com/maps?v=1.3&key=f385a15c3f290eb2a2b66dc74f3b72b7&plugin=AMap.Geocoder,AMap.Geolocation,AMap.PlaceSearch,AMap.Autocomplete');
        module.exports = handle;
    });

})();
