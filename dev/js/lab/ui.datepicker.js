angular.module('ui.datepicker', ['ui.dateparser', 'ui.position'])
    .constant('datepickerConfig', {
        formatDay: 'dd',
        formatMonth: 'MMMM',
        formatYear: 'yyyy',
        formatDayHeader: 'EEE',
        formatDayTitle: 'MMMM yyyy',
        formatMonthTitle: 'yyyy',
        timeFormat: 'HH:mm:ss',
        datepickerMode: 'day',
        minMode: 'day',
        maxMode: 'year',
        showWeeks: false,
        startingDay: 0,
        yearRange: 20,
        minDate: null,
        maxDate: null
    })
    .controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig',
        function ($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
        var self = this,
            ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl;
        // Modes chain
        this.modes = ['day', 'month', 'year'];
        // Configuration attributes
        angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
            'minMode', 'maxMode','datepickerMode', 'showWeeks', 'startingDay', 'yearRange'], function (key, index) {
            self[key] = angular.isDefined($attrs[key]) ?
                (index < 9 ? $interpolate($attrs[key])($scope.$parent) :
                    $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
        });

        // Watchable attributes
        angular.forEach(['minDate', 'maxDate'], function (key) {
            if ($attrs[key]) {
                $scope.$parent.$watch($parse($attrs[key]), function (value) {
                    self[key] = value ? new Date(value) : null;
                    self.refreshView();
                });
            } else {
                self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
            }
        });
        $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;

        $timeout(function(){
            $scope.minMode&&(self.minMode=$scope.minMode);
        });

        $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
        this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();
        $scope.isActive = function (dateObject) {
            if (self.compare(dateObject.date, self.activeDate) === 0) {
                $scope.activeDateId = dateObject.uid;
                return true;
            }
            return false;
        };
        this.init = function (ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = function () {
                self.render();
            };
        };
        this.getRemind = function () {
            var a = $scope.remind;
            if (a) {
                return a
            }
            return ''
        };
        this.addRemind = function (data, day) {
            var i = 0, j, l = day.length, l2 = data.length, d, d2;
            for (; i < l2; i++) {
                for (j = 0; j < l; j++) {
                    d = new Date(data[i].date);
                    d2 = new Date(day[j].date);
                    if (d.getDate() === d2.getDate() && d.getMonth() === d2.getMonth()) {
                        day[j].remind = data[i];
                    }
                    day[j].isRemind = true;
                }
            }
        };
        this.render = function () {
            if (ngModelCtrl.$modelValue) {
                var date = new Date(ngModelCtrl.$modelValue),
                    isValid = !isNaN(date);
                if (isValid) {
                    this.activeDate = date;
                } else {
                    $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                }
                ngModelCtrl.$setValidity('date', isValid);
            }
            this.refreshView();
        };
        this.refreshView = function () {
            if (this.element) {
                this._refreshView();
                var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
            }
        };
        this.createDateObject = function (date, format) {
            var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
            return {
                date: date,
                label: dateFilter(date, format),
                selected: model && this.compare(date, model) === 0,
                disabled: this.isDisabled(date),
                current: this.compare(date, new Date()) === 0
            };
        };
        this.isDisabled = function (date) {
            return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode})));
        };
        // Split array into smaller arrays
        this.split = function (arr, size) {
            var arrays = [];
            while (arr.length > 0) {
                arrays.push(arr.splice(0, size));
            }
            return arrays;
        };
        $scope.select = function (date, bool, evt, notAllowed, dataAPI) {
            if (evt) {
                evt.stopPropagation();
            }
            if ($scope.datepickerMode === self.minMode) {
                var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                var miniTime = $scope.$parent.$parent.miniTime;
                var nowDate = new Date();
                if (miniTime) {
                    dt.setHours(miniTime.getHours());
                    dt.setMinutes(miniTime.getMinutes());
                    dt.setSeconds(miniTime.getSeconds());
                } else {
                    dt.setHours(nowDate.getHours());
                    dt.setMinutes(nowDate.getMinutes());
                    dt.setSeconds(nowDate.getSeconds());
                }
                ngModelCtrl.$setViewValue(dt);
                ngModelCtrl.$render();
            } else {
                self.activeDate = date;
                if($scope.$parent.$parent.datepickerMode===$scope.datepickerMode){
                    ngModelCtrl.$setViewValue(date);
                    ngModelCtrl.$render();
                }else{
                    $scope.datepickerMode = self.modes[ self.modes.indexOf($scope.datepickerMode) - 1 ];
                }
            }
            if (bool) {
                if ($scope.asynRemind)
                    $scope.asynRemind({month: date.getMonth() + 1});
            } else {
                if ($scope.onSelect)
                    $scope.onSelect(self);
            }

        };
        $scope.move = function (direction) {
            var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
                month = self.activeDate.getMonth() + direction * (self.step.months || 0);
            self.activeDate.setFullYear(year, month, 1);
            self.refreshView();
            if ($scope.asynRemind)
                $scope.asynRemind({month: self.activeDate.getMonth() + 1});
        };
        $scope.toggleMode = function (direction) {
            direction = direction || 1;
            if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
                return;
            }
            $scope.datepickerMode = self.modes[ self.modes.indexOf($scope.datepickerMode) + direction ];
        };
        // Key event mapper
        $scope.keys = { 13: 'enter', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
        var focusElement = function () {
            $timeout(function () {
                self.element[0].focus();
            }, 0, false);
        };
        // Listen for focus requests from popup directive
        $scope.$on('datepicker.focus', focusElement);

        $scope.keydown = function (evt) {
            var key = $scope.keys[evt.which];
            if (!key || evt.shiftKey || evt.altKey) {
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            if (key === 'enter' || key === 'space') {
                if (self.isDisabled(self.activeDate)) {
                    return; // do nothing
                }
                $scope.select(self.activeDate);
                focusElement();
            } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                $scope.toggleMode(key === 'up' ? 1 : -1);
                focusElement();
            } else {
                self.handleKeyDown(key, evt);
                self.refreshView();
            }
        };
    }])
    .directive('datepicker', function () {
        return {
            restrict: 'EAC',
            replace: true,
            templateUrl: 'template/datepicker/datepicker.html',
            scope: {
                datepickerMode: '=?',
                minMode:'=?',
                remind: '=?',
                onSelect: '&',
                asynRemind: '&',
                dateDisabled: '&'
            },
            require: ['datepicker', '?^ngModel'],
            controller: 'DatepickerController',
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                if (ngModelCtrl) {
                    datepickerCtrl.init(ngModelCtrl);
                }
                scope.$watch('remind', function (a, b) {
                    if (a != b) {
                        datepickerCtrl.refreshView();
                    }
                }, true);
            }
        };
    })
    .directive('daypicker', ['dateFilter', function (dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/day.html',
            require: '^datepicker',
            link: function (scope, element, attrs, ctrl) {
                scope.showWeeks = ctrl.showWeeks;

                ctrl.step = { months: 1 };
                ctrl.element = element;

                var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                function getDaysInMonth(year, month) {
                    return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
                }

                function getDates(startDate, n) {
                    var dates = new Array(n), current = new Date(startDate), i = 0;
                    current.setHours(12); // Prevent repeated dates because of timezone bug
                    while (i < n) {
                        dates[i++] = new Date(current);
                        current.setDate(current.getDate() + 1);
                    }
                    return dates;
                }

                ctrl._refreshView = function () {
                    var year = ctrl.activeDate.getFullYear(),
                        month = ctrl.activeDate.getMonth(),
                        firstDayOfMonth = new Date(year, month, 1),
                        difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                        firstDate = new Date(firstDayOfMonth);
                    var remind = ctrl.getRemind();
                    if (numDisplayedFromPreviousMonth > 0) {
                        firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                    }

                    // 42 is the number of days on a six-month calendar
                    var days = getDates(firstDate, 42);

                    for (var i = 0; i < 42; i++) {
                        days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
                            secondary: days[i].getMonth() !== month,
                            uid: scope.uniqueId + '-' + i
                        });
                    }
                    if (remind) {
                        ctrl.addRemind(remind, days);//添加提醒
                    }
                    scope.labels = new Array(7);
                    for (var j = 0; j < 7; j++) {
                        scope.labels[j] = {
                            abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
                            full: dateFilter(days[j].date, 'EEEE')
                        };
                    }

                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
                    scope.rows = ctrl.split(days, 7);
                    if (scope.showWeeks) {
                        scope.weekNumbers = [];
                        var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
                            numWeeks = scope.rows.length;
                        while (scope.weekNumbers.push(weekNumber++) < numWeeks) {
                        }
                    }
                };

                ctrl.compare = function (date1, date2) {
                    return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()) );
                };

                function getISO8601WeekNumber(date) {
                    var checkDate = new Date(date);
                    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                    var time = checkDate.getTime();
                    checkDate.setMonth(0); // Compare with Jan 1
                    checkDate.setDate(1);
                    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
                }

                ctrl.handleKeyDown = function (key, evt) {
                    var date = ctrl.activeDate.getDate();

                    if (key === 'left') {
                        date = date - 1;   // up
                    } else if (key === 'up') {
                        date = date - 7;   // down
                    } else if (key === 'right') {
                        date = date + 1;   // down
                    } else if (key === 'down') {
                        date = date + 7;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
                        ctrl.activeDate.setMonth(month, 1);
                        date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
                    } else if (key === 'home') {
                        date = 1;
                    } else if (key === 'end') {
                        date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
                    }
                    ctrl.activeDate.setDate(date);
                };

                ctrl.refreshView();
            }
        };
    }])
    .directive('monthpicker', ['dateFilter', function (dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/month.html',
            require: '^datepicker',
            link: function (scope, element, attrs, ctrl) {
                ctrl.step = { years: 1 };
                ctrl.element = element;

                ctrl._refreshView = function () {
                    var months = new Array(12),
                        year = ctrl.activeDate.getFullYear();

                    for (var i = 0; i < 12; i++) {
                        months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
                            uid: scope.uniqueId + '-' + i
                        });
                    }
                    //['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
                    scope.rows = ctrl.split(months, 3);
                };

                ctrl.compare = function (date1, date2) {
                    return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
                };

                ctrl.handleKeyDown = function (key, evt) {
                    var date = ctrl.activeDate.getMonth();

                    if (key === 'left') {
                        date = date - 1;   // up
                    } else if (key === 'up') {
                        date = date - 3;   // down
                    } else if (key === 'right') {
                        date = date + 1;   // down
                    } else if (key === 'down') {
                        date = date + 3;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
                        ctrl.activeDate.setFullYear(year);
                    } else if (key === 'home') {
                        date = 0;
                    } else if (key === 'end') {
                        date = 11;
                    }
                    ctrl.activeDate.setMonth(date);
                };

                ctrl.refreshView();
            }
        };
    }])
    .directive('yearpicker', ['dateFilter', function (dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/year.html',
            require: '^datepicker',
            link: function (scope, element, attrs, ctrl) {
                var range = ctrl.yearRange;

                ctrl.step = { years: range };
                ctrl.element = element;

                function getStartingYear(year) {
                    return parseInt((year - 1) / range, 10) * range + 1;
                }

                ctrl._refreshView = function () {
                    var years = new Array(range);

                    for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++) {
                        years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
                            uid: scope.uniqueId + '-' + i
                        });
                    }

                    scope.title = [years[0].label, years[range - 1].label].join(' - ');
                    scope.rows = ctrl.split(years, 5);
                };

                ctrl.compare = function (date1, date2) {
                    return date1.getFullYear() - date2.getFullYear();
                };

                ctrl.handleKeyDown = function (key, evt) {
                    var date = ctrl.activeDate.getFullYear();

                    if (key === 'left') {
                        date = date - 1;   // up
                    } else if (key === 'up') {
                        date = date - 5;   // down
                    } else if (key === 'right') {
                        date = date + 1;   // down
                    } else if (key === 'down') {
                        date = date + 5;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
                    } else if (key === 'home') {
                        date = getStartingYear(ctrl.activeDate.getFullYear());
                    } else if (key === 'end') {
                        date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
                    }
                    ctrl.activeDate.setFullYear(date);
                };

                ctrl.refreshView();
            }
        };
    }])
    .constant('datepickerPopupConfig', {
        datepickerPopup: 'yyyy-MM-dd',
        currentText: 'Today',
        clearText: 'Clear',
        closeText: 'Done',
        closeOnDateSelection: true,
        appendToBody: false,
        showButtonBar: true
    })
    .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig', '$translate',
        function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig, $translate) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    isOpen: '=?',
                    currentText: '@',
                    clearText: '@',
                    closeText: '@',
                    onSelect:'&',
                    dateDisabled: '&'
                },
                link: function (scope, element, attrs, ngModel) {
                    var dateFormat,
                        format = attrs.datepickerPopup.split(' ')[1],
                        closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
                        appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
                    scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;
                    scope.getText = function (key) {
                        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
                    };


                    if (format) {
                        format = format.toUpperCase();
                        scope.HH = format.indexOf('HH') >= 0;
                        scope.mm = format.indexOf('MM') >= 0;
                        scope.ss = format.indexOf('SS') >= 0;
                        // scope.ismeridian=true;
                    }
                    //                    var _dataFormat=function(v){
                    //                        var y = $translate.use();
                    //                        switch (y) {
                    //                            case 'en':
                    //                            {
                    //                                return ('dd/MM/yyyy ' + (v.split(' ')[1] || '')).trim();
                    //                                break;
                    //                            }
                    //                            default:
                    //                            {
                    //                                return v
                    //                                break;
                    //                            }
                    //                        }
                    //                    }
                    dateFormat=attrs.datepickerPopup;
                    attrs.$observe('datepickerPopup', function (value) {
                        dateFormat=value || datepickerPopupConfig.datepickerPopup;
                        ngModel.$render();
                    });
                    scope._format=attrs.datepickerPopup;

                    // popup element used to display calendar
                    var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker on-select="onselect()"></div></div>');
                    popupEl.attr({
                        'ng-model': 'date',
                        'ng-change': 'dateSelection()'
                    });
                    scope.onselect=function(){
                        scope.onSelect();
                    };
                    function cameltoDash(string) {
                        return string.replace(/([A-Z])/g, function ($1) {
                            return '-' + $1.toLowerCase();
                        });
                    }

                    // datepicker element
                    var datepickerEl = angular.element(popupEl.children()[0]);
                    if (attrs.datepickerOptions) {
                        angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function (value, option) {
                            datepickerEl.attr(cameltoDash(option), value);
                        });
                    }

                    angular.forEach(['minDate', 'maxDate', 'datepickerMode','minMode'], function (key) {
                        if (attrs[key]) {
                            scope.$parent.$watch($parse(attrs[key]), function (value) {
                                scope[key] = value;
                            });
                            datepickerEl.attr(cameltoDash(key), key);

                        }
                    });
                    if (attrs.dateDisabled) {
                        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                    }
                    function parseDate(viewValue) {
                        if (!viewValue) {
                            ngModel.$setValidity('date', true);
                            return null;
                        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                            ngModel.$setValidity('date', true);
                            return viewValue;
                        } else if (angular.isString(viewValue)) {
                            viewValue=viewValue.replace(/\-/g,'/');
                            var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
                            if (isNaN(date)) {
                                ngModel.$setValidity('date', false);
                                return undefined;
                            } else {
                                ngModel.$setValidity('date', true);
                                return date;
                            }
                        } else {
                            ngModel.$setValidity('date', false);
                            return undefined;
                        }
                    }
                    ngModel.$parsers.unshift(parseDate);
                    // Inner change
                    scope.dateSelection = function (dt) {
                        if (angular.isDefined(dt)) {
                            scope.date = dt;
                        }
                        ngModel.$setViewValue(scope.date);
                        ngModel.$render();

                        if (closeOnDateSelection) {
                            scope.isOpen = false;
                            element[0].focus();
                        }
                    };
                    element.bind('input change keyup', function () {
                        scope.$apply(function () {
                            scope.date = ngModel.$modelValue
                        });
                    });
                    // Outter change
                    ngModel.$render = function (){
//                        console.log(ngModel.$viewValue);
                        if(!+ngModel.$viewValue){
                            ngModel.$viewValue=new Date(ngModel.$viewValue).getTime();
                        }
//                        console.log(dateFormat);
                        var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
//                        console.log(date);
                        element.val(date);
                        scope.date = parseDate(ngModel.$modelValue);
                    };
                    var documentClickBind = function (event) {
                        if (scope.isOpen && event.target !== element[0]) {
                            scope.$apply(function () {
                                scope.isOpen = false;
                            });
                        }
                    };
                    var keydown = function (evt, noApply) {
                        scope.keydown(evt);
                    };
                    element.bind('keydown', keydown);
                    scope.keydown = function (evt) {
                        if (evt.which === 27) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            scope.close();
                        } else if (evt.which === 40 && !scope.isOpen) {
                            scope.isOpen = true;
                        }
                    };
                    scope.$watch('isOpen', function (value) {
                        if (value) {
                            scope.$broadcast('datepicker.focus');
                            scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                            scope.position.top = scope.position.top + element.prop('offsetHeight');

                            $document.bind('click', documentClickBind);
                        } else {
                            $document.unbind('click', documentClickBind);
                        }
                    });
                    scope.select = function (date) {
                        if (date === 'today') {
                            var today = new Date();
                            if (angular.isDate(ngModel.$modelValue)) {
                                date = new Date(ngModel.$modelValue);
                                date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                            } else {
                                date = new Date(today.setHours(0, 0, 0, 0));
                            }
                        }
                        scope.dateSelection(date);
                    };
                    scope.close = function () {
                        scope.isOpen = false;
                        element[0].focus();
                    };
                    scope.miniTimeChange = function () {
                        scope.$$childHead.$$childHead.select(scope.date || new Date());
                    };
                    var $popup = $compile(popupEl)(scope);
                    // Prevent jQuery cache memory leak (template is now redundant after linking)
                    popupEl.remove();
                    if (appendToBody) {
                        $document.find('body').append($popup);
                    } else {
                        element.after($popup);
                    }
                    scope.$on('$destroy', function () {
                        $popup.remove();
                        element.unbind('keydown', keydown);
                        $document.unbind('click', documentClickBind);
                    });
                }
            };
        }])
    .directive('datepickerPopupWrap', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            templateUrl: 'template/datepicker/popup.html',
            link: function (scope, element, attrs) {
                element.bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
            }
        };
    })
    .directive('datepickerMilliseconds', ['$parse','$timeout', function ($parse,$timeout) {
        return {
            restrict: 'A',
            require: ['ngModel'],
            link: function(scope, element, attr, ctrls) {
                var ngModelController = ctrls[0];
                var reValid=function(){
                    $timeout(function(){
                        ngModelController.$validate&&ngModelController.$validate();
                    })
                };
                var valid=function (viewValue) {
                    if(!viewValue){
                        reValid();
                        return ''
                    }
                    var ft=attr.datepickerPopup.split(/\s+/);
                    if(ft[1]){
                        ft=ft[1].split(':');
                        if(ft.length===1){
                            viewValue.setMinutes(0);
                            viewValue.setSeconds(0);
                        }
                        if(ft.length===2){
                            viewValue.setSeconds(0);
                        }
                    }else{
                        viewValue.setHours(0);
                        viewValue.setMinutes(0);
                        viewValue.setSeconds(0);
                    }
                    reValid();
                    return viewValue.getTime()
                };
                ngModelController.$parsers.push(valid);
            }
        };
    }])
    .run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/datepicker.html",
                "<div ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
                "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
                "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
                "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
                "</div>");
        $templateCache.put("template/datepicker/day.html",
                "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
                "  <thead>\n" +
                "    <tr>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
                "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
                "    </tr>\n" +
                "    <tr class=\"weeks\">\n" +
                "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
                "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
                "    </tr>\n" +
                "  </thead>\n" +
                "  <tbody>\n" +
                "    <tr ng-repeat=\"row in rows track by $index\">\n" +
                "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
                "      <td ng-repeat=\"dt in row track by dt.date\"  class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
                "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" " +
                "ng-click=\"select(dt.date,0,$event,!dt.remind,dt.remind)\" ng-disabled=\"dt.disabled\" ng-style=\"{'cursor':(dt.isRemind&&!dt.remind)?'not-allowed':''}\" tabindex=\"-1\">" +
                "<span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span>" +
                "<span ng-if=\"dt.remind.completed\" class=\"remind\"><em class=\"state-clr-e\">●</em>{{dt.remind.completed}}</span>" +
                "<span ng-if=\"dt.remind.error\" class=\"remind\"><em class=\"state-clr-b\">●</em>{{dt.remind.error}}</span>" +
                "<span ng-if=\"dt.remind.running\" class=\"remind\"><em class=\"state-clr-a\">●</em>{{dt.remind.running}}</span>" +
                "</button>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </tbody><tfoot></tfoot>\n" +
                "</table>\n" +
                "");
        $templateCache.put("template/datepicker/month.html",
                "<table class=\"month\" role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
                "  <thead>\n" +
                "    <tr>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
                "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
                "    </tr>\n" +
                "  </thead>\n" +
                "  <tbody>\n" +
                "    <tr ng-repeat=\"row in rows track by $index\">\n" +
                "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
                "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" dt=\"{{dt.date}}\" ng-click=\"select(dt.date,1)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n" +
                "");
        $templateCache.put("template/datepicker/popup.html",
                "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
                " <li ng-transclude></li>\n" +
                "<li class=\"timepicker-wrap\" ng-show=\"HH||mm||ss\"><div timepicker  in-datepicker=\"1\" class=\"pull-left\" style=\"width:auto\" ng-model=\"miniTime\" ng-change=\"miniTimeChange()\" hour-step=\"1\" minute-step=\"1\" second-step=\"1\" show-meridian=\"ismeridian\"></div></li>" +
                "</ul>\n" +
                "");
        $templateCache.put("template/datepicker/year.html",
                "<table class=\"year\" role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
                "  <thead>\n" +
                "    <tr>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
                "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
                "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
                "    </tr>\n" +
                "  </thead>\n" +
                "  <tbody>\n" +
                "    <tr ng-repeat=\"row in rows track by $index\">\n" +
                "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
                "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n" +
                "");
    }]);