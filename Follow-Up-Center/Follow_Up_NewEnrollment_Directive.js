Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

FollowUpCenterApp.directive('followUpNewEnrollmentDirective', ['followUpNewEnrollmentSvc', '$http', '$compile', '$filter', function (followUpNewEnrollmentSvc, $http, $compile, $filter) {
    return {
        restrict: 'E',
        link:function($scope, ele, attrs){
            var dataReady = false,
                templateReady = false,
                templateHtml = {};

            //When data and template are all ready, render this directive
            $scope.$watch(
                function(){
                    return dataReady && templateReady
                },
                function(newValue, oldValue){
                    if(newValue===true){
                        ele.html(templateHtml);
                        ele.html($compile(ele.html())($scope));
                        $scope.newEnrollmentReady = true;
                    }
                }
            );

            templateLoader = $http.get("/BusinessCenter/PrintContent/Follow_Up_NewEnrollment")
                    .success(function (html) {
                        templateHtml=html;
                        templateReady = true;
                    });

            followUpNewEnrollmentSvc.getEnrollment().then(function (res) {
                var enrolleeList = JSON.parse(JSON.parse(res.data));
                
                _.each(enrolleeList, function(item, index) {
                    // IsEnrolleeFirstInMonth populate
                    var previousEnrollee;
                    if (index >= 1) {
                        previousEnrollee = enrolleeList[index - 1];
                    }

                    if (previousEnrollee) {
                        var cutoffDate = new Date(new Date(previousEnrollee.EnrollmentDate).getFullYear(), new Date(previousEnrollee.EnrollmentDate).getMonth(), 1);

                        item.IsFirstInMonth = new Date(item.EnrollmentDate) < cutoffDate;
                    } else {
                        item.IsFirstInMonth = true;
                    }

                    item.FormattedEnrollmentDate = moment(item.EnrollmentDate).locale('zh-cn').format('YYYY年MM月');
                });

                $scope.enrollments = enrolleeList;

                $scope.adjustEnrollmentData();

                //Sort
                var filtered = $filter('orderBy')($scope.enrollments, $scope.selection.sortby,false);
                $scope.enrollments = filtered;

                dataReady = true;
            }, function (error) {
                //TODO: Log out error
            });

        },
        controller: ['$scope', 'CoreMetricsFactory', function ($scope, CoreMetricsFactory) {
            $scope.columnOptions =
            {
                Enrollee: { id: 0, description: '会员姓名'},
                MonthEnrolled: { id: 1, description: '月度跟进'},
                MadeContact: { id: 2, description: '已联系'},
                PreferredStatus: { id: 3, description: '顾客身份'},
                ImeaLevel: { id: 4, description: 'IMEA + Level'},
                MonthlyOrder: { id: 5, description: '已下单'},
                LearnToEarnAvailable: { id: 6, description: 'Learn To Earn Available'},
                LeadershipPointBanked: { id: 7, description: 'Leadership Point Banked'}
            };
            
            $scope.featureControll = {
                isShowMonthEnrolled : false,
                isShowPreferredStatus : false,
                isShowMonthlyOrder : false,
                isShowImeaLevel : false,
                isShowMadeContact : false,
                isShowLearnToEarnAvailable : false,
                isShowCmaStatus : false,
                isShowLeaderShipPointBanked : false
            };
            
            $scope.countryFeatures = {
                "zh-CN":"China","jp-JP":"Japan","ko-KR":"Korea","en-MY":"Singapore","zh-MY":"Singapore","en-SG":"Singapore","en-MY":"Singapore","en-AU":"Australia","en-NZ":"Australia","en-GB":"Europe","nl-NL":"Europe","de-DE":"Europe","en-IE":"Europe","nl-NL":"Europe","de-DE":"Europe","pl-PL":"Europe","de-AT":"Europe"
            };

            //Control featues by country
            $scope.intialFeatures = function(culture){

                var softwareSystem =  $scope.countryFeatures[culture];

                switch(softwareSystem)
                {
                case "China":
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = false;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = false;
                    $scope.featureControll.isShowLearnToEarnAvailable =false;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                case 'Korea':
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = true;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = true;
                    $scope.featureControll.isShowLearnToEarnAvailable =true;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                case 'Japan':
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = true;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = true;
                    $scope.featureControll.isShowLearnToEarnAvailable =false;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                case 'Singapore':
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = true;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = false;
                    $scope.featureControll.isShowLearnToEarnAvailable =false;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                case 'Europe':
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = true;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = false;
                    $scope.featureControll.isShowLearnToEarnAvailable =false;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                case 'Australia':
                    $scope.featureControll.isShowMonthEnrolled = true;
                    $scope.featureControll.isShowPreferredStatus = true;
                    $scope.featureControll.isShowImeaStatus = true;
                    $scope.featureControll.isShowMonthlyOrder = true;
                    $scope.featureControll.isShowLeaderShipPointBanked = true;
                    $scope.featureControll.isShowLearnToEarnAvailable = true;
                    $scope.featureControll.isShowMadeContact = true;
                break;
                default:
                }
            }

            $scope.registerPageViewAnalytics = function(){

                var generalEventObj = CoreMetricsFactory.baseEventObjToLog;

                generalEventObj.metricType = CoreMetricsFactory.metricTypeEnum.CORE_METRICS;
                generalEventObj.eventName = "Follow Up – New Customers";
                generalEventObj.eventCategory = "2003";
                generalEventObj.eventAction = 0;

                CoreMetricsFactory.eventToLog(generalEventObj);
            };

            $scope.currentSoftwareSystem = $scope.intialFeatures(PageClientData.CustomerCulture);

            $scope.registerPageViewAnalytics();
            
            $scope.formateDate = function(date){
                if(date){
                    return moment(date).format('YYYY年MM月DD日');
                }
            }

            $scope.show = function (event) {
                event.stopPropagation()
                angular.element(event.target).parent().prev().attr("style", "visibility:visible; position: relative;");
            };

            $scope.hide = function (event) {
                event.stopPropagation()
                angular.element(event.target).parent().prev().attr("style", "visibility:hidden;");
            };

            $scope.adjustEnrollmentData = function(){
                for(var key in $scope.enrollments){
                    var orderStatusHistory = $scope.enrollments[key].OrderStatusHistory;
                    var followUpHistory = $scope.enrollments[key].FollowUpHistory;
                    $scope.enrollments[key].OrderStatusHistory = [];
                    $scope.enrollments[key].FollowUpHistory = [];
                    
                    if(!orderStatusHistory)return;
                   
                     orderStatusHistory = Object.keys(orderStatusHistory).map(function(key) {
                          return orderStatusHistory[key];
                     });
                    
                    orderStatusHistory = orderStatusHistory.reverse();

                    _.each(orderStatusHistory,function(ele,index){
                        var d = new Date();
                        d.addMonths(0 - index);
                        
                        var orderStatus = {
                            "Month": d.getMonth() + 1,
                            "FollowUpMonth":ele.FollowUpMonth,
                            "StatusType":ele.StatusType,
                            "StatusDate":ele.StatusDate,
                            "IsAlertStatus":ele.IsAlertStatus,
                            "TypeName":ele.TypeName
                        };
                        $scope.enrollments[key].OrderStatusHistory.push(orderStatus);
                    });

                    if(!followUpHistory)return;
            
                    followUpHistory = Object.keys(followUpHistory).map(function(key) {
                          return followUpHistory[key];
                    });

                    followUpHistory = followUpHistory.reverse();

                    _.each(followUpHistory,function(ele,index){
                        var d = new Date();
                        d.addMonths(0 - index);
                        
                        var followUp = {
                            "Month": d.getMonth() + 1,
                            "MadeContact":ele.MadeContact,
                            "HelpedCustomerShop":ele.HelpedCustomerShop,
                            "AnsweredQuestions":ele.AnsweredQuestions,
                            "StatusType":ele.StatusType,
                            "StatusDate":ele.StatusDate,
                            "IsAlertStatus":ele.IsAlertStatus,
                            "TypeName":ele.TypeName
                        };
                        $scope.enrollments[key].FollowUpHistory.push(followUp);
                    });
                }
            }

            $scope.monthColCss = function (item)
            {
                return $.format('noBackground {0}', item.IsFirstInMonth ? 'enrollmentDateFirstInMonth' : 'dateCellNoBorder');
            };

            $scope.getLocalizedCommissionStatusText = function (status) {
                var result = '';
                switch (status.StatusType) {
                    case 5: // FollowUpStatusType.EarnedCommissions
                        result = '你赢得了金钱!!';
                        break;
                }

                return result;
            };

            $scope.getLocalizedPreferredStatusText = function (status) {
                var result = '';
                if (status) {
                    switch (status.StatusType) {
                        case 2: //FollowUpStatusType.Ok
                            result = '该顾客是优惠顾客';
                            break;
                        case 1: //FollowUpStatusType.Alert
                            result = '该顾客不再是优惠顾客';
                            break;
                        case 4: //FollowUpStatusType.Direct
                            result = '普通顾客';
                            break;
                        case 6: //FollowUpStatusType.RedAlert
                            if (status.PreferredAlertType == 1) //PreferredStatus.PreferredStatusAlertType.PreferredCustomerDownloadedCancellationForm
                            {
                                result = '顾客已要求暂停优惠顾客表格';
                            }
                            else if (status.PreferredAlertType == 2) //PreferredStatus.PreferredStatusAlertType.CustomerOnPaymentHold
                            {
                                result = '该顾客因为没有支付已被取消';
                            }
                            break;
                    }
                }
                return result;
            };

            $scope.getLocalizedCMAStatusText = function (status) {
                var result = '';
                switch(status.StatusType)
                {
                    case 2: //FollowUpStatusType.Ok
                        if (status.StatusDate) {
                            result = $.format('{0}', moment(status.StatusDate).format('YYYY年MM月DD日'));
                        }
                        break;
                    case 1: //FollowUpStatusType.Alert
                        result = '申请错误，请检查你的电子邮箱';
                        break;
                }
                return result;
            };

            $scope.getLocalizedIMEAStatusText = function (status) {
                var result = '';
                switch (status.StatusType)
                {
                    case 2: //FollowUpStatusType.Ok
                        if (status.StatusDate) {
                            result = $.format('申请表已收到：{0}', moment(status.StatusDate).format('YYYY年MM月DD日'));
                        }
                        break;
                    case 1: //FollowUpStatusType.Alert
                        result = '申请错误，请检查你的电子邮箱';
                        break;
                }
                return result;
            };

            $scope.GetLocalizedWebAccountStatusText = function (status) {
                var result = '';
                switch (status.StatusType) {
                    case 1: //FollowUpStatusType.Alert
                        result = '此顾客没有设置网上账号';
                        break;
                }
                return result;
            };

            $scope.getLocalizedLeadershipPointStatusText = function (status) {
                var result = '';

                switch (status.StatusType) {
                    case 3: //ollowUpStatusType.Unchecked
                        result = '点击此处进入银行领导积分';
                        break;
                    case 2: //FollowUpStatusType.Ok
                        result = '领导力积分存储';
                        break;
                }
                return result;
            };


            $scope.getLocalizedOrderPlacedStatusText = function (status) {
                var result = '';
                if (status) {
                    switch (status.StatusType) {
                        case 2: //FollowUpStatusType.Ok
                            result = '生成月度订单';
                            break;
                        case 1: //FollowUpStatusType.Alert
                            var todayDate = new Date();
                            result = new Date(status.StatusDate) < new Date(todayDate.getFullYear(), todayDate.getMonth(), 1) ? '顾客收到一个自动送货订单' : '产品购买承诺未达标';
                            break;
                        case 10: //FollowUpStatusType.PaymentPending
                            result = '订单尚未支付';
                            break;
                    }
                }
                return result;
            };

            $scope.getCssClassNameForFollowUpStatus = function (status, followUpAction) {
                if (status) {
                    var followUpStatusType = 0; //FollowUpStatusType.Default
                    switch (followUpAction) {
                        // Take the opposite of the currently assigned state
                        // i.e. if current status is FollowUpStatusType.OK, mark follow up variable false)
                        case 0: // FollowUpAction.MadeContact
                            followUpStatusType = status.MadeContact;
                            break;
                        case 1: //FollowUpAction.HelpedCustomerShop
                            followUpStatusType = status.HelpedCustomerShop;
                            break;
                        case 2: //FollowUpAction.AnsweredQuestions
                            followUpStatusType = status.AnsweredQuestions;
                            break;
                    }

                    //Compare with FollowUpStatusType.Ok
                    return followUpStatusType == 2;
                }

                return '';
            },

            $scope.processFollowUp = function (followUpAction, enrollee) {

                // call the back end to update
                followUpNewEnrollmentSvc.postFollowUpAction(enrollee, followUpAction).then(function (resp) {
                    // revert the UI to opposite
                    var status = enrollee.CurrentFollowUpStatus;
                    switch (followUpAction) {
                        case 0: // FollowUpAction.MadeContract
                            status.MadeContact = status.MadeContact == 2 ? 0 : 2;
                            break;
                        case 1:
                            status.HelpedCustomerShop = status.HelpedCustomerShop == 2 ? 0 : 2;
                            break;
                        case 2:
                            status.AnsweredQuestions = status.AnsweredQuestions == 2 ? 0 : 2;
                            break;
                    }
                });                        
            };

            $scope.enroleeSort = false;
            $scope.monthEnrolledSort = false;
            $scope.preferredStatusSort = false;
            $scope.imeaLevelSort = false;
            $scope.monthlyOrderSort = false;
            $scope.learnToEarnSort = false;
            $scope.leadershipPointSort = false;
            $scope.madeContactSort = false;
            $scope.sortReverse = false;

            $scope.selection = {
              
                sortby: "Name"
           
            };
            
            $scope.BankLeadershipPoints = function(enrollee,$event){

            	var isConfirmed = confirm("[localization key="FollowUpBankLPConfirm"]");
              

	            if (isConfirmed) {
                   followUpNewEnrollmentSvc.BankLeadershipPoints(enrollee.CustomerID).then(function (resp) {
                        
                     enrollee.LeadershipPointAssigned.StatusType = 2; //Check status
                      
                }
                else{
                    enrollee.LeadershipPointAssigned.StatusType = 3; //Uncheck status
                    angular.element($event.target).prop('checked',false);
                }
            }

            $scope.changeOrderBy = function (sortItem) {
                
                switch (sortItem) {
                    case 'enrollee':
                        $scope.selection.sortby = "Name";
                        $scope.enroleeSort = !$scope.enroleeSort;
                        break;
                    case 'monthEnrolled':
                        $scope.selection.sortby = "EnrollmentDate";
                        $scope.monthEnrolledSort = !$scope.monthEnrolledSort;
                        break;
                    case 'preferredStatus':
                        $scope.selection.sortby = "PreferredStatus.StatusType";
                        $scope.preferredStatusSort = !$scope.preferredStatusSort;
                        break;
                    case 'imeaLevel':
                        $scope.selection.sortby = "ImeaStatus.ParticipationLevelID";
                        $scope.imeaLevelSort = !$scope.imeaLevelSort;
                        break;
                    case 'monthlyOrder':
                        $scope.selection.sortby = "CurrentOrderStatus.StatusType";
                        $scope.monthlyOrderSort = !$scope.monthlyOrderSort;
                        break;
                    case 'learnToEarn':
                        $scope.selection.sortby = "LearnToEarnStatus.CurrentMonthMaxAwardAmount";
                        $scope.learnToEarnSort = !$scope.learnToEarnSort;
                        break;
                    case 'leadershipPoint':
                        $scope.selection.sortby = "LeadershipPointAssigned.StatusType";
                        $scope.leadershipPointSort = !$scope.leadershipPointSort;
                        break;
                    case 'madeContact':
                        $scope.selection.sortby = "CurrentFollowUpStatus.MadeContact";
                        $scope.madeContactSort = !$scope.madeContactSort;
                        break;
                }

                $scope.sortReverse = !$scope.sortReverse;

                //Sort
                var filtered = $filter('orderBy')($scope.enrollments, $scope.selection.sortby,$scope.sortReverse);
                $scope.enrollments = filtered;
            };
        }]
    };
}]);

FollowUpCenterApp.service('followUpNewEnrollmentSvc', ['followUpNewEnrollmentFactory', function (followUpNewEnrollmentFactory) {
    return {
        getEnrollment: function (customerId) {
            return followUpNewEnrollmentFactory.getEnrollmentData(customerId);
        },
        postFollowUpAction: function (enrollee, followUpAction) {
            return followUpNewEnrollmentFactory.postFollowUpAction(enrollee, followUpAction);
        },
        BankLeadershipPoints:function(enrolleeId){
            return followUpNewEnrollmentFactory.BankLeadershipPoints(enrolleeId);
        }
    };
}]);

FollowUpCenterApp.factory('followUpNewEnrollmentFactory', ['$http', '$q', function ($http, $q) {
    return {
        getEnrollmentData: function (customerId) {
            return $http({
                method: 'GET',
                cache: true,
                url: '/BusinessCenter/FollowUp/GetEnrolleesData'
            });
        },
        postFollowUpAction: function (enrollee, followUpAction) {
            return $http({
                url: '/ExternalServices/Api/FollowUp/FollowUpAction',
                cache: false,
                method: "POST",
                params: {
                    'customerId': enrollee.CustomerID,
                    'monthSinceEnrollment': enrollee.MonthSinceEnrollment,
                    'madeContactStatus': enrollee.CurrentFollowUpStatus.MadeContact,
                    'helpedCustomerShopStatus': enrollee.CurrentFollowUpStatus.HelpedCustomerShop,
                    'answeredQuestionsStatus': enrollee.CurrentFollowUpStatus.AnsweredQuestions,
                    'followUpAct': followUpAction
                }
            });
        },
        BankLeadershipPoints:function(enrolleeId){
             return $http({
                url: '/BusinessCenter/FollowUp/BankLeadershipPoints',
                cache: false,
                method: "POST",
                params: {
                    enrolleeId: enrolleeId,
                }
            });
        }
    }
}]);