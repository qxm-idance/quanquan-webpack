var main=angular.module('ui',['ui.router','ui.echarts','ui.buttons','ui.checkbox','ui.carousel',
	'ui.transition','ui.modal','ui.dialogs','ui.pager','ui.position','ui.dropdown','ui.select','ui.charts']);
main.directive('rscircle2', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var radius = +attrs.radius || 40;
                var strokeWidth = +attrs.strokeWidth || 6;
                var cool = radius + strokeWidth;
                var area = radius * 2 + strokeWidth * 2;
                var total=attrs.total;
                var circle0 = Raphael(element[0], area, area);
                circle0.customAttributes.arc = function (xloc, yloc, value, total, R) {
                    var alpha = 360 / total * value,
                        a = (90 - alpha) * Math.PI / 180,
                        x = xloc + R * Math.cos(a),
                        y = yloc - R * Math.sin(a),
                        path;
                    if (total == value) {
                        path = [
                            ["M", xloc, yloc - R],
                            ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
                        ];
                    } else {
                        path = [
                            ["M", xloc, yloc - R],
                            ["A", R, R, 0, +(alpha > 180), 1, x, y]
                        ];
                    }
                    return {
                        path: path
                    };
                };
                var circle0_arc = circle0.path().attr({
                    "stroke": "#e6e6e6",
                    "stroke-width": strokeWidth,
                    arc: [cool, cool, total, total, radius]
                });
                var circle1_arc = circle0.path().attr({
                    "stroke": "#e6e6e6",
                    "stroke-width": strokeWidth,
                    arc: [cool, cool, 0, 0, radius]
                });
                var _else;
                var color=['#00afdb','#00afdb','#00afdb'];
                var oV=function (a) {
                    a=+a;
                    if (a) {
                        //if(a>total){
                            //_else=total-a;
                            //a=total;
                        //}
                        // _else=total-a;
                        circle1_arc.animate({
                            "stroke":function(){
                                var avg=total/4;
                                // console.log(avg);
                                if(avg*3<a){
                                    return color[2]
                                }
                                if(avg*2<a && avg*3>=a){
                                    return color[1]
                                }
                                if(avg*2>=a){
                                    return color[0]
                                }
                            }(),
                            arc: [cool, cool,a, total,  radius]
                        },1000);
                        if(total>a)
                            circle0.text(cool,cool-7, a).attr({"font-size": 24,'title':a,"fill": "#12b20e"});
                        circle0.text(cool,cool+8, '/'+total).attr({"font-size": 14,'title':total,"fill": "#989898"});
                    }
                },
                dO=attrs.$observe('value',oV);
                scope.$on("$destroy",function(){
                    if(dO&&dO!=oV){//angular <=1.2 returns callback, not deregister fn
                        dO();
                        dO=null;
                    }else{
                        delete attrs.$$observers['value'];
                    }
                });
            }
        };
    }])
main.factory('httpInterceptor',['$q','$rootScope',function ($q,$rootScope){
    return {
        request: function (config) {
            return config || $q.when(config);
        },
        response:function(response) {
            if(response.data.expired){

                location.href='login.jsp';
            }
            return response || $q.when(response);
        },
        responseError: function (response) {
            return $q.reject(response);
        }
    }
}])

// main.directive('uiSessionOut',[function(){
//         return function(scope,elem){
//             scope.$on('session_out',function(){
//                 elem.show()
//             });
//         }
//     }]);

// main.directive('uiSessionOut',[function(){
//     return function(scope,elem){
//         scope.$on('session_out',function(){
//             scope.visible=true;
//         });
//     }
// }]);


main.config(['$httpProvider',function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function transformRequest( data, getHeaders ) {
        var headers = getHeaders();
        headers['Content-Type'] = "application/x-www-form-urlencoded; charset=utf-8";
        return( serializeData( data ) );
    };
    $httpProvider.interceptors.push('httpInterceptor');
}])
function serializeData( data ) {
    if ( ! angular.isObject( data ) ) {
        return( ( data == null ) ? "" : data.toString() );
    }
    var buffer = [];
    for ( var name in data ) {
        if ( ! data.hasOwnProperty( name ) ) {
            continue;
        }e
        var value = data[ name ];
        if( angular.isObject(value) ){
            value = angular.toJson(value);
        }
        buffer.push(
                encodeURIComponent( name ) + "=" + encodeURIComponent( ( value == null ) ? "" : value )
        );
    }
    // Serialize the buffer and clean it up for transportation.
    var source = buffer.join( "&" ).replace( /%20/g, "+" );
    return( source );
}


function getToken(){
        var token ='dddf12e31044e74579e023721dd4df47';
        return token;
    }

var contextPath = '';