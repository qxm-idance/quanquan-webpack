main.factory('CS', ['$http', '$q','$rootScope',function($http, $q,$rootScope) {
    var _get = function (url,p) {
        var _defer = $q.defer();
        $http.get(ui.url(url, p)).then(_defer.resolve, _defer.reject);
        return _defer.promise;
    };

    var _post = function (url,p) {
        var _defer = $q.defer();
        $http.post(url,p).then(_defer.resolve, _defer.reject);
        return _defer.promise;
    };
    var contextPath = '';
    var _url={
        teacherMyClass:contextPath+'/myInfo/teacherMyClass.go',
        teacherMyClassDetail:contextPath+'/myInfo/teacherMyClassDetail.go',
        teacherHomeworkToday:contextPath+'/homeWork/teacherHomeworkToday.go',
        webTeacherHomeworkTodayDetail:contextPath+'/homeWork/webTeacherHomeworkTodayDetail.go',
        teacherSendNotice:contextPath+'/notice/teacherSendNotice.go',
        qqLogin:contextPath+'/login/qqLogin.go',
        qqNoticeList:contextPath+'/notice/qqNoticeList.go',
        qqPersonInfo:contextPath+'/myInfo/qqPersonInfo.go',
        teacherSendHomework:contextPath+'/homeWork/teacherSendHomework.go',
        webTeacherHomeworkList:contextPath+'/homeWork/webTeacherHomeworkList.go',
        webQqLogout:contextPath+'/login/webQqLogout.go',
        teacherGetSendedHomework:contextPath+'/homeWork/teacherGetSendedHomework.go',
        teacherCheckHomework:contextPath+'/homeWork/teacherCheckHomework.go',
        teacherHomeworkChecked:contextPath+'/homeWork/teacherHomeworkChecked.go',
        teacherHomeworkTodayDetail:contextPath+'/homeWork/teacherHomeworkTodayDetail.go'
    }

    return{
        teacherMyClass:function(p){
            return _get(_url.teacherMyClass,p);
        },
        teacherMyClassDetail:function(p){
            return _get(_url.teacherMyClassDetail,p);
        },
        teacherHomeworkToday:function(p){
            return _get(_url.teacherHomeworkToday,p);
        },
        webTeacherHomeworkTodayDetail:function(p){
            return _get(_url.webTeacherHomeworkTodayDetail,p);
        },
        teacherSendNotice:function(p){
            return _get(_url.teacherSendNotice,p);
        },
        qqLogin:function(p){
            return _get(_url.qqLogin,p);
        },
        qqNoticeList:function(p){
            return _get(_url.qqNoticeList,p);
        },
        qqPersonInfo:function(p){
            return _get(_url.qqPersonInfo,p);
        },
        teacherSendHomework:function(p){
            return _get(_url.teacherSendHomework,p);
        },
        webTeacherHomeworkList:function(p){
            return _get(_url.webTeacherHomeworkList,p);
        },
        webQqLogout:function(p){
            return _get(_url.webQqLogout,p);
        },
        teacherGetSendedHomework:function(p){
            return _get(_url.teacherGetSendedHomework,p);
        },
        teacherCheckHomework:function(p){
            return _get(_url.teacherCheckHomework,p);
        },
        teacherHomeworkChecked:function(p){
            return _get(_url.teacherHomeworkChecked,p);
        },
        teacherHomeworkTodayDetail:function(p){
            return _get(_url.teacherHomeworkTodayDetail,p);
        }
    }
}]);

