main.config(['$urlRouterProvider','$stateProvider',function($urlRouterProvider,$stateProvider){
    $urlRouterProvider.otherwise('/index');
    $stateProvider
        .state("index", {
            url: '/index',
            views: {
                'main': {
                    templateUrl: 'views/index.html',
                    controller: 'indexCtrl'
                }
            }
        })
        .state("classManage", {
            url: '/classManage',
            views: {
                'main': {
                    templateUrl: 'views/classManage.html',
                    controller: 'classManageCtrl'
                }
            }
        })
        .state("homeworkManage", {
            url: '/homeworkManage?userId&token',
            views: {
                'main': {
                    templateUrl: 'views/homeworkManage.html',
                    controller: 'homeworkManageCtrl'
                }
            }
        })
        .state("noticeManage", {
            url: '/noticeManage',
            views: {
                'main': {
                    templateUrl: 'views/noticeManage.html',
                    controller: 'noticeManageCtrl'
                }
            }
        })
        .state("homeworkEvaluation", {
            url: '/homeworkEvaluation?homeworkId&operType&classCode&className',
            views: {
                'main': {
                    templateUrl: 'views/homeworkEvaluation.html',
                    controller: 'homeworkEvaluationCtrl'
                }
            }
        })
    }])
.run(['$rootScope','$state', '$stateParams',function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
           $rootScope.$from = from;
           $rootScope.$fromParams = fromParams;
           // $http.defaults.headers.common.sessionId =$rootScope.sess;
        });
        // $http.defaults.headers.common.sessionId =$rootScope.sessionId;
        // $httpProvider.defaults.headers.get = { 'sessionId' : $rootScope.sessionId};
    }
]);
