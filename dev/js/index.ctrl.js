main.controller('indexCtrl', ['$scope','dialogs','CS','$rootScope','$filter',function ($scope,dialogs,CS,$rootScope,$filter){
    //老师管理加入的班级
    $scope.p={};
    CS.teacherMyClass({token:getToken()}).then(function(d){
        d= d.data;
        if(d.state){
            $scope.classes= d.classes;
             _.each($scope.classes,function(it){
                it.classNameWhole=it.className.split("-");
                it.classNameSch=it.classNameWhole[0];
                it.classNameCla=it.classNameWhole[1];
            })
            console.log($scope.classes);
            if($scope.classes&&$scope.classes.length>0){
                $scope.getNoticeList();
            }
        }else{
            // dialogs.error("error",'msg',{'width':300});
        }
    });

    //teacher info
    CS.qqPersonInfo({token:getToken()}).then(function(d){
        d= d.data;
        if(d.state){
            $scope.p.tchName=d.userName;
            console.log($scope.p.tchName);
            $rootScope.userName=d.userName;
            $rootScope.role=d.role;
            if(d.role!='master'){
                $scope.p.tchRole="任课老师";
                switch($scope.p.tchRole){
                    case 'math':
                       $scope.p.tchClass="数学老师";
                       break;
                    case 'yuwen':
                       $scope.p.tchClass="语文老师";
                       break;
                    case 'sport':
                       $scope.p.tchClass="体育老师";
                       break;
                    case 'english':
                       $scope.p.tchClass="英语老师";
                       break;
                    case 'other':
                       $scope.p.tchClass="其他老师";
                       break;
                }
            }else{
                $scope.p.tchRole="班主任";
                $scope.p.tchClass='';
            }
        }else{
            // dialogs.error("error",'msg',{'width':300});
        }
    });

    //noticeList
    $scope.getNoticeList=function(){
        CS.qqNoticeList({classCode:'',channel:'web',page:1,token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                $scope.noticeList=d.noticeList.slice(0,8);
            }else{
                // dialogs.error("error",'msg',{'width':300});
            }
        });
    }

    // chart 作业图表详情
    $scope.config_bar={
        debug: true,
        stack: true
    };
    $scope.chartData=[];
    CS.teacherHomeworkToday({token:getToken()}).then(function(d){
        d=d.data;
        // d={"state": true, "homework": [{"className": "杭州天长小学-一年级3班", "classCode":"45","homeworkId": 221243, "workTitle": "语文xxx作业", "unCommit": 2, "done": 44, "unDone": 4, "ps": 6 }, {"className": "杭州市文一街小学-一年级2班", "classCode":"46","homeworkId": 221243, "workTitle": "语文xxx作业", "unCommit": 2, "done": 44, "unDone": 4, "ps": 6 } ] };
         if(d.state){
            $scope.homeworkList=d.homework;
            var done='已完成',unDone='未完成',unCommit='含备注',ps='未提交';
            _.each($scope.homeworkList,function(it,$index){                
                $scope.chartData.push([{name:it.className,datapoints:[{ x: done, y: it.done },
                    { x: unDone, y: it.unDone},
                    { x: unCommit, y: it.ps },
                    { x: ps, y: it.unCommit }]
                }]);
                $scope.chartData[$index].homeworkId=it.homeworkId;
                $scope.chartData[$index].classNameCla=it.className.split("-")[1];
                $scope.chartData[$index].classCode=it.classCode;
            });           
        }else{
            // dialogs.error("Error","error",{'width':300});
        }
    });
    $scope.setHomework=function(){
        dialogs.create('views/dlgSetHomework.html','setHomeworkCtrl',{data:$scope.classes},{'width':700}).result.then(function(data){
            CS.teacherSendHomework(_.extend(data,{token:getToken()})).then(function(d){
                d=d.data;
                if(d.state){
                    $scope.getNoticeList();
                }else{
                    dialogs.error("error",'msg',{'width':300});
                }
            })
        });
    }
    $scope.setNotice=function(){
        dialogs.create('views/dlgSetNotice.html','setNoticeCtrl',{data:$scope.classes},{'width':700}).result.then(function(data){
            CS.teacherSendNotice(_.extend(data,{token:getToken()})).then(function(d){
                var d=d.data;
                if(d.state){
                    $scope.getNoticeList();
                }else{
                    // dialogs.error("error",'failed',{'width':300});
                }
            });
        });
    }

    $scope.loginOut=function(){
        // dialogs.confirm("确定退出么？",'',{'width':300}).result.then(function(){
        //     CS.webQqLogout({token:getToken()}).then(function(d){
        //         d=d.data;
        //         if(d.state){
                    location.href='login.jsp';
        //         }else{
        //             dialogs.error('退出登录失败',{'width':300});
        //         }
        //     })
        // });
    }

}]);

main.controller('classManageCtrl', ['$scope', 'dialogs','CS','$rootScope',function ($scope,dialogs,CS,$rootScope){
    $rootScope.contextPath = contextPath;
    //老师管理加入的班级
    CS.teacherMyClass({token:getToken()}).then(function(d){
        d= d.data;
        if(d.state){
            $scope.classes= d.classes;
             _.each($scope.classes,function(it){
                it.classNameWhole=it.className.split("-");
                it.classNameSch=it.classNameWhole[0];
                it.classNameCla=it.classNameWhole[1];
            })
            if($scope.classes&&$scope.classes.length>0){
                $scope.getClassDetail($scope.classes[0].classCode);
            }
        }else{
            // dialogs.error("error",'msg',{'width':300});
        }
    });
    $scope.currentPage=1;
    $scope.pageSize=9;
    // $scope.total=80;
    $scope.getClassDetail=function(classCode) {
        CS.teacherMyClassDetail({classCode:classCode,token:getToken()}).then(function (d){
            d = d.data;
            if (d.state) {
                $scope.children = d.children;
                $scope.childrenShow=d.children.slice(0,9);
                $scope.childrenTotal = d.children.length;
                $scope.teachers = d.teachers;
                $scope.teacherTotal = d.teachers.length;
            } else {
                // dialogs.error("error",'msg',{'width':300});
            }
        })
    }

    
    $scope.onPager=function(currentPage,self){
        $scope.childrenShow=$scope.children.slice((currentPage-1)*$scope.pageSize,currentPage*$scope.pageSize);
    };
}]);

main.controller('noticeManageCtrl', ['$scope', 'dialogs','CS',function ($scope,dialogs,CS){
    //老师管理加入的班级
    CS.teacherMyClass({token:getToken()}).then(function(d){
        d= d.data;
        if(d.state){
            $scope.classes= d.classes;
             _.each($scope.classes,function(it){
                it.classNameWhole=it.className.split("-");
                it.classNameSch=it.classNameWhole[0];
                it.classNameCla=it.classNameWhole[1];
            })
            if($scope.classes&&$scope.classes.length>0){
                $scope.getNoticeList($scope.classes[0].classCode,1);
            }
        }else{
            // dialogs.error("error",'msg',{'width':300});
        }
    });

    $scope.setNotice=function(){
        dialogs.create('views/dlgSetNotice.html','setNoticeCtrl',{data:$scope.classes},{'width':700}).result.then(function(data){
            CS.teacherSendNotice(_.extend(data,{token:getToken()})).then(function(d){
                var d=d.data;
                if(d.state){
                    var classCode=$scope.$parent.claModel;
                    $scope.getNoticeList(classCode,1);
                    // console.log($scope.$parent.claModel);
                    // $scope.getNoticeList(classCode,1);
                    // dialogs.notify('Notify',"公告发布成功!",{'width':300});
                }else{
                    // dialogs.error("error",'msg',{'width':300});
                }
            });
        });
    }

    $scope.currentPage=1;
    $scope.pageSize=8;
    // $scope.totalItems=80;
    $scope.onPager=function(currentPage,self){
        var classCode=$scope.$$childHead.claModel;
        $scope.getNoticeList(classCode,currentPage);
    };

    $scope.getNoticeList=function(classCode,currentPage){
        CS.qqNoticeList({classCode:classCode,page:currentPage,channel:'web',token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                $scope.totalItems=d.total;
                $scope.noticeList=d.noticeList
            }else{
                // dialogs.error("error",'msg',{'width':300});
            }
        });
    }
}]);

main.controller('homeworkManageCtrl', ['$scope','dialogs','CS','theme','$rootScope',function ($scope,dialogs,CS,theme,$rootScope){
    //老师管理加入的班级
    $rootScope.contextPath = contextPath;
    CS.teacherMyClass({token:getToken()}).then(function(d){
        d= d.data;
        if(d.state){
            $scope.classes= d.classes;
             _.each($scope.classes,function(it){
                it.classNameWhole=it.className.split("-");
                it.classNameSch=it.classNameWhole[0];
                it.classNameCla=it.classNameWhole[1];
            })
            if($scope.classes&&$scope.classes.length>0){
                $scope.getHomeworkList($scope.classes[0].classCode,1);
            }
        }else{
            // dialogs.error("error",'msg',{'width':300});
        }
    });
    var date=new Date();
    console.log(date);
    var month=date.getMonth()+1;
    var day=date.getDate();
    $scope.nowDate=month+'.'+day;
    $scope.getHomeworkList=function(classCode,currentPage){
        CS.webTeacherHomeworkList({classCode:classCode,page:currentPage,token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                $scope.totalItems=d.total;
                $scope.homeworkList=d.homeworkList;
                _.each($scope.homeworkList,function(it){
                    it.commitVal=Number(it.commit.split('/')[0]);
                    it.totalVal=Number(it.commit.split('/')[1]);
                    it.unPs=it.totalVal-it.ps;
                    it.classNameCla=it.className.split("-")[1]
                })
            }else{
                // dialogs.error("error",'msg',{'width':300});
            }
        });
    };
    $scope.currentPage=1;
    $scope.pageSize=8;
    $scope.onPager=function(currentPage,self){
        var classCode=$scope.$$childHead.claModel;
        $scope.getHomeworkList(classCode,currentPage);
    };
    $scope.setHomework=function(){
        dialogs.create('views/dlgSetHomework.html','setHomeworkCtrl',{data:$scope.classes},{'width':700}).result.then(function(data){
            CS.teacherSendHomework(_.extend(data,{token:getToken()})).then(function(d){
                d=d.data;
                if(d.state){
                    var classCode=$scope.$parent.claModel;
                    $scope.getHomeworkList(classCode,1);
                }else{
                    // dialogs.error("error",'msg',{'width':300});
                }
            })
        });
    }
}]);

main.controller('homeworkEvaluationCtrl', ['$scope','dialogs','CS','$stateParams', '$rootScope',function ($scope,dialogs,CS,$stateParams, $rootScope){
    $scope.p={
        countModel:0
    };
    $scope.persEvalList=[{'toSelf':[],'toSelfContent':'','addBtnShow':true,'toSelfShow':false,'addStuPlshow':false,'_ind':0,isPrivat:0}];
    $scope.evaluated=false;//查看详情,是否已经评价;
    $scope.operType=$stateParams.operType;//1:评价作业;2:查看详情;3:从未评价过

    //获取评价作业内容
    if($stateParams.operType!=3){
        CS.teacherHomeworkChecked({classCode:$stateParams.classCode,homeworkId:$stateParams.homeworkId,token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                $scope.p.toAll=d.toAll;
                $scope.p.toAllOld=d.toAll;
                $scope.toSome=d.toSome;
            }else{
                dialogs.error("error",'msg',{'width':300});
            }
        })
    }


    $scope.changeOperType=function(){
        $scope.operType=1;
    }
    //添加评价
    $scope.addPersEvalue=function(){
        $scope.persEvalList.push({'toSelf':[],'toSelfContent':'','addBtnShow':true,'toSelfShow':false,'addStuPlshow':false,'_ind':$scope.persEvalList.length,isPrivat:0});
    }
    //删除评价
    $scope.delPersEvalue=function(ind){
        if(ind==0&&$scope.persEvalList.length==1){
            $scope.persEvalList=[{'toSelf':[],'toSelfContent':'','addBtnShow':true,'toSelfShow':false,'addStuPlshow':false,'_ind':0,isPrivat:0}];
            return
        }else{
            $scope.persEvalList.splice(ind,1);
        }
    }
    //添加个别学生评价面板上展示的学生
    $scope.students=[];
    CS.teacherHomeworkTodayDetail({homeworkId:$stateParams.homeworkId,token:getToken()}).then(function(d){
        d=d.data;
        if(d.state){
            var done=d.done;
            var unDone=d.unDone;
            _.each(done,function(it){
                $scope.students.push({childNo:it.childNo,childName:it.childName,childAvatar:it.childAvatar});
            });
            _.each(unDone,function(it){
                $scope.students.push({childNo:it.childNo,childName:it.childName,childAvatar:it.childAvatar});
            });
            if($scope.students&&$scope.students.length>0){
                _.each($scope.students,function(it){
                    it.dis=false;
                });
                $scope.p.children=_.pluck($scope.students, 'childNo').join(',')||'';
            }

        }else{
            dialogs.error('msg',{'width':300});
        }
    })
    //勾选学生动作
    $scope.checkedStu=function(ind,_indParent){
        $scope.students[ind].dis=!$scope.students[ind].dis;
        $scope.persEvalList[_indParent].toSelf=_.pluck(_.filter($scope.students, 'dis'), 'childNo');//筛选被勾选学生学号
        if($scope.persEvalList[_indParent].toSelf.length>0){
            $scope.persEvalList[_indParent]._toSelfVal=$scope.persEvalList[_indParent].toSelf.join('号,')+'号';
        }
    }
    //弹出选择学生面板
    $scope.addStudent=function(ind){
        $scope.persEvalList[ind].addStuPlshow=true;
    }
    //选择学生确认动作
    $scope.doCheck=function(ind){
        $scope.persEvalList[ind].addStuPlshow=false;
        if($scope.persEvalList[ind].toSelf && $scope.persEvalList[ind].toSelf.length>=1){
            $scope.persEvalList[ind].toSelfShow=true;
            $scope.persEvalList[ind].addBtnShow=false;
        }
        _.each($scope.students,function(it){
            it.dis=false;
        })
    }
    //取消学生确认动作
    $scope.cancelCheck=function(ind){
        $scope.persEvalList[ind].addStuPlshow=false;
    }
    //发布作业评价内容
    $scope.setEvaluation=function(){
        var toSelf='{'+_.pluck($scope.persEvalList, 'toSelf').join('},{')+'}';
        var toSelfContent='{'+ _.pluck($scope.persEvalList, 'toSelfContent').join('},{')+'}';
        var isPrivat=_.pluck($scope.persEvalList, 'isPrivat').join(',');
        var data={classCode:$stateParams.classCode,homeworkId:$stateParams.homeworkId,children:$scope.p.children,toAll:$scope.p.toAll,'toSelf':toSelf,'toSelfContent':toSelfContent,'isPrivat':isPrivat,token:getToken()};
        console.log(data);
        CS.teacherCheckHomework(data).then(function(d){
            d=d.data;
            if(d.state){
                dialogs.notify("Notify",'发布成功',{'width':300});
                $scope.homeworkTodayDetail($stateParams.classCode);
            }else{
                // dialogs.error("error",'msg',{'width':300});            
            }
        })
    }
    //取消发布作业
    $scope.cancelEvaluation=function(){
        $scope.persEvalList=[{'toSelf':[],'toSelfContent':'','addBtnShow':true,'toSelfShow':false,'addStuPlshow':false,'_ind':0,isPrivat:0}];
        $scope.p.toAll='';
    }
    //获取作业展示内容
    $scope.getHomeworkList=function(){
        CS.teacherGetSendedHomework({homeworkId:$stateParams.homeworkId,token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                // $scope.p.object=d.object;
                switch(d.object){
                    case 'math':
                       $scope.p.object="数学";
                       break;
                    case 'yuwen':
                       $scope.p.object="语文";
                       break;
                    case 'sport':
                       $scope.p.object="体育";
                       break;
                    case 'english':
                       $scope.p.object="英语";
                       break;
                    case 'other':
                       $scope.p.object="其他";
                       break;
                }
                $scope.homework=d.homework;
            }else{
                // dialogs.error("error",'msg',{'width':300});
            }
        })
    }
    $scope.getHomeworkList();
    //tab 评价详情展示内容
    $scope.homeworkTodayDetail=function(classCode){
        CS.webTeacherHomeworkTodayDetail({classCode:classCode,homeworkId:$stateParams.homeworkId,token:getToken()}).then(function(d){
            d=d.data;
            if(d.state){
                $scope.className=d.className;
                $scope.done= d.done;
                $scope.unDone= d.unDone;
                $scope.unCommit= d.unCommit;
                $scope.workDetailCount=[{text:'已完成',count:d.done.length||0},{text:'未完成',count:d.unDone.length||0},{text:'未提交',count:d.unCommit.length||0},{text:'含备注',count:0}];
                $scope.workDetailContent=[$scope.done,$scope.unDone,$scope.unCommit,[]];

                $scope.onPager(1,$scope.workDetailContent[0]);
            }
        })
    }
    $scope.homeworkTodayDetail($stateParams.classCode);

    $scope.onDetailChange=function(ind){
        $scope.onPager(1,$scope.workDetailContent[ind]);
    }
    $scope.currentPage=1;
    $scope.pageSize=5;
    $scope.onPager=function(page,items){
        $scope.itemShow=items.slice((page-1)*$scope.pageSize,page*$scope.pageSize);
    }
}]);

main.controller('setHomeworkCtrl', ['$scope','$modalInstance','data','CS',function ($scope,$modalInstance,data,CS){
    $scope.classes=data.data;
    $scope.p={
        classD:$scope.classes?[$scope.classes[0].classCode]:[],
        classCode:'',
        setDate:+new Date(),
        taskCon:[{}],
        taskId:[],
        task:[]
    };
    $scope.objectData=[{text:"班主任有话说/其他",value:'other'},{text:"语文",value:'yuwen'},{text:"数学",value:'math'}
    ,{text:"英语",value:'english'},{text:"体育",value:'sport'}];
    
    var start=1;
    $scope.addWork=function(){
        $scope.p.taskCon.push({});
    }
    $scope.delectWork=function(ind){
        $scope.p.taskCon.splice(ind,1);
    }
    $scope.query=function() {
        $scope.p.classCode=$scope.p.classD;
        _.filter($scope.p.classCode,function(it){return !!it;});
        $scope.p.classCode.join(',');
        _.each($scope.p.taskCon,function(it){
            if(it){
                 var con='{'+it.con+'}';
                 $scope.p.task.push(con);
                 $scope.p.taskId.push('0');
            }
        })
        $scope.p.task.join(',');
        $scope.p.taskId.join(',');
        var data={classCode:$scope.p.classCode,object:$scope.p.object,task:$scope.p.task,taskId:$scope.p.taskId,};
        $modalInstance.close(data);
    };
    $scope.close=function(){
        $modalInstance.dismiss();
    }
}]);

main.controller('setNoticeCtrl', ['$scope','$modalInstance','data','CS', function ($scope,$modalInstance,data,CS){
    $scope.classes=data.data;
    $scope.p={
        classD:$scope.classes?[$scope.classes[0].classCode]:[],
        classCode:'',
        setDate:+new Date()
    };
    $scope.noticeTypeData=[{text:'班级公告',value:1},{text:'学校公告',value:2}];
    $scope.p.noticeTypeVal=1;
    $scope.checked=false;
    $scope.query=function() {
        $scope.p.classCode=$scope.p.classD;
        _.filter($scope.p.classCode,function(it){return !!it;});
        $scope.p.classCode.join(',');
        if($scope.p.noticeTypeVal==1){
            $scope.p.noticeType="班级公告";
        }else{
            $scope.p.noticeType="学校公告";
        }
        var data={classCode:$scope.p.classCode,noticeType:$scope.p.noticeType,noticeTitle:$scope.p.noticeTitle,notice:$scope.p.notice};
        $modalInstance.close(data);
    };
    $scope.close=function(){
        $modalInstance.dismiss()
    }
}]);

main.controller('loginCtrl', ['$scope','$state','$location','dialogs','CS','$rootScope',function ($scope,$state,$location,dialogs,CS,$rootScope){
    $scope.slides=[{picBackUrl:'images/login-bk1.png'},{picBackUrl:'images/login-bk2.png'},{picBackUrl:'images/login-bk3.png'}];
    // $scope.onLogin=function(){
    //     CS.qqLogin({userId:$scope.p.userId,pwd:$scope.p.pwd,loginRole:'teacher',loginType:'web',token:getToken()}).then(function(d){
    //         d=d.data;
    //         if(d.state){
    //             location.href='index.jsp';
    //         }else{
    //            dialogs.error("Error","error",{'width':500});
    //         }
    //     })
    // };

    $scope.onLogin=function(){
       // $state.go('index');   
       location.href='index.html';    
    }

    $scope.p={};
    $scope.checkboxData=[{text:'下次自动登录',value:1}];
    $scope.loginWaySwitch=true;

}]);

main.controller('classListCtrl', ['$scope','$location','CS', '$state','dialogs','$rootScope','$stateParams',function ($scope,$location,CS,$state,dialogs,$rootScope,$stateParams){
    //老师管理加入的班级
    $scope.getClasses=function(){
        CS.teacherMyClass({token:getToken()}).then(function(d){
            d= d.data;
            if(d.state){
                $scope.classes= d.classes;
                 _.each($scope.classes,function(it){
                    it.classNameWhole=it.className.split("-");
                    it.classNameSch=it.classNameWhole[0];
                    it.classNameCla=it.classNameWhole[1];
                })
                $scope.claModel=$scope.classes[0].classCode;//默认第一个班级选中
                if($scope.classes.length) {
                    $scope.onClassChange($scope.classes[0].classCode);
                    $rootScope.claModel=$scope.classes[0].classCode;
                }
            }else{
                // dialogs.error("error",'msg',{'width':300});
            }
        });
    }

    if($state.current.name!=='homeworkEvaluation'){
        $scope.getClasses();
    }else{
        $scope.classes=[{classCode:$stateParams.classCode,className:$stateParams.className,classNameCla:$stateParams.className}];
        $scope.claModel=$scope.classes[0].classCode;
    }

    $scope.onClassChange=function(classCode){
        $scope.claModel=classCode;//班级代码
        // var currentPage=1;//当前页数
        var currentStateName=$state.current.name;
        switch(currentStateName){
            case 'noticeManage':
               $scope.$parent.getNoticeList(classCode,1);
               break;
            case 'homeworkManage':
               $scope.$parent.getHomeworkList(classCode,1);
               break;
            case 'classManage':
               $scope.$parent.getClassDetail(classCode,1);
               break;
            case 'homeworkEvaluation':
               $scope.$parent.homeworkTodayDetail(classCode,1);
               break;
        }
    };
}]);

main.controller('navTopCtrl',['$scope','CS','dialogs','$state',function($scope,CS,dialogs,$state){
    $scope.loginOut=function(){
        dialogs.confirm("确定退出么？",'',{'width':300}).result.then(function(){
            // CS.webQqLogout({token:getToken()}).then(function(d){
            //     d=d.data;
            //     if(d.state){
            //         location.href='login.jsp';
            //     }else{
            //         dialogs.error('退出登录失败',{'width':300});
            //     }
            // })
            location.href='login.html';
        });
        

    }

    $scope.userChange=function(){
        dialogs.confirm("切换账号",'',{'width':300}).result.then(function(){
            // CS.webQqLogout({token:getToken()}).then(function(d){
            //     d=d.data;
            //     if(d.state){
            //         location.href='login.jsp';
            //     }else{
            //         dialogs.error('切换账号失败',{'width':300});
            //     }
            // })

            location.href='login.html';
        });

    }
}]);

main.controller('addStudentCtrl',['$scope','CS','dialogs','$modalInstance',function($scope,CS,dialogs,$modalInstance){
    $scope.students=[];
    $scope.toSelf=[];

    CS.teacherHomeworkTodayDetail({}).then(function(d){
        d=d.data;
        // d={"state": true, "className": "xx班", "done": [{"childAvatar": "xxx/xxx.png", "childNo": 1, "childId": 1, "childName": "马正洁", "childSex": 0, "ps": 3 }, {"childAvatar": "xxx/xxx.png", "childNo": 1, "childId": 1, "childName": "马正洁", "childSex": 0, "ps": 2 }, {"childAvatar": "xxx/xxx.png", "childNo": 1, "childId": 1, "childName": "马二洁", "childSex": 0, "ps": 0 } ], "unDone": [{"childAvatar": "xxx/xxx.png", "childNo": 1, "childId": 1, "childName": "马正洁", "childSex": 0, "ps": 4, "blank": "2,5,6"} ], "unCommit": [{"childAvatar": "xxx/xxx.png", "childNo": 1, "childId": 1, "childName": "马二洁", "childSex": 0 } ] };
        if(d.state){
            var done=d.done;
            var unDone=d.unDone;
            _.each(done,function(it){
                $scope.students.push({childNo:it.childNo,childName:it.childName,childAvatar:it.childAvatar});
            });

            _.each(unDone,function(it){
                $scope.students.push({childNo:it.childNo,childName:it.childName,childAvatar:it.childAvatar});
            });
            if($scope.students&&$scope.students.length>0){
                _.each($scope.students,function(it){
                    it.dis=false;
                });
            }
        }else{
            // dialogs.error('msg',{'width':300});
        }
    })
    $scope.checkedStu=function(ind){
        $scope.students[ind].dis=!$scope.students[ind].dis;
    }
    $scope.toSelf=_.pluck(_.filter($scope.students, 'dis'), 'childNo');

    $scope.doCheck=function(){
        var data={'toSelf':$scope.toSelf,'show':1};
        $modalInstance.close(data);
    }
    $scope.close=function(){
        $modalInstance.dismiss()
    }
}]);

main.controller('sessionOutCtrl',['$scope',function($scope){
    $scope.loginAgain=function(){
        $scope.hidden=true;
        location.href='login.jsp';

    }
}]);


