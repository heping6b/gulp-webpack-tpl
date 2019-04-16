(function () {
  var defaults = {
    // ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    lunarMonthList: ["\u6b63\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
    // ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '三十一']
    lunarDayList: ["\u521d\u4e00", "\u521d\u4e8c", "\u521d\u4e09", "\u521d\u56db", "\u521d\u4e94", "\u521d\u516d", "\u521d\u4e03", "\u521d\u516b", "\u521d\u4e5d", "\u521d\u5341", "\u5341\u4e00", "\u5341\u4e8c", "\u5341\u4e09", "\u5341\u56db", "\u5341\u4e94", "\u5341\u516d", "\u5341\u4e03", "\u5341\u516b", "\u5341\u4e5d", "\u4e8c\u5341", "\u5eff\u4e00", "\u5eff\u4e8c", "\u5eff\u4e09", "\u5eff\u56db", "\u5eff\u4e94", "\u5eff\u516d", "\u5eff\u4e03", "\u5eff\u516b", "\u5eff\u4e5d", "\u4e09\u5341", "\u4e09\u5341\u4e00"],

    minYear: 1900,
    minMonth: 1,
    minDay: 1,
    minHour: 0,
    minMinute: 1,
    minSecond: 1,

    maxYear: 2099,
    maxMonth: 1,
    maxDay: 1,
    maxHour: 0,
    maxMinute: 1,
    maxSecond: 1,

    date: null,

    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,

    lYear: 0,
    lMonth: 0,
    lDay: 0,

    clLeapMonth: "",
    clMonth: "",
    clDay: "",

    animal: "",

    gzYear: "",
    gzMonth: "",
    gzDay: "",
    gzHour: "",
    isToday: null,
    isLeap: null,
    week: 0,
    cWeek: "",
    isTerm: null,
    term: null,
    astro: "",

    isShowYear: true,
    isShowMonth: true,
    isShowDay: true,
    isShowHour: true,
    isShowMinute: true,
    isShowSecond: true,
    isShowHourUnknown: true,
    pageH: 44,
    // 计算当前页码时，距离边界的相差个数，默认容器显示5个，距离边界为2
    baseN: 2,
    viewType: 1,
    now: new Date(),
    index: 0,
    idPrefix: 'kui-calender__all',
  };

  function S(selector) {
    var elems = document.querySelectorAll(selector);
    return elems && elems.length === 1 ? elems[0] : elems;
  }

  var MsCalender = function (options) {
    var that = this;
    Object.assign(that, defaults, options);
    that.init();
    that.getData();
    that.view();
    defaults.index++;
    console.log(that);
  }

  var __hook__ = {
    init: function () {
      var that = this;
      that.selector = {
        year: '#' + that.idPrefix + 'year' + that.index,
        month: '#' + that.idPrefix + 'month' + that.index,
        day: '#' + that.idPrefix + 'day' + that.index,
        hour: '#' + that.idPrefix + 'hour' + that.index,
        minute: '#' + that.idPrefix + 'minute' + that.index,
        second: '#' + that.idPrefix + 'second' + that.index,
      };
    },
    getData: function (now) {
      var that = this;
      that.now = that.toDate(now || that.date || that.now);
      that.lunarDate = lunarCalendar.solar2lunar();

      that.yearData = that.getYears();
      that.monthData = that.getMonth();
      that.dayData = that.getDay();
      that.hourData = that.getHour();
      that.minuteData = that.getMinute();
      that.secondData = that.getSecond();


    },

    toDate: function (date, year, month, day) {
      if (date) {
        if (typeof date === 'string') date = date.replace(/-/g, '/').replace(/T/g, ' ').replace(/\.+[0-9]+[A-Z]$/, '');
      } else if (year && month >= 0) date = new Date(year, month, day || 1);
      return date ? new Date(date) : new Date();
    },

    isLeap: function (year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? true : false;
    },

    getYears: function () {
      var that = this;
      var now = that.now.getFullYear();
      var type = that.viewType;

      if (type === 1) {
        now = that.year
      } else if (type === 2) {
        now = that.lYear
      }
      var rc = { data: [], index: 1, currentPage: 0, currentPosition: 0 };

      for (var i = that.minYear; i < that.maxYear + 1; i++) {
        if (i === now) {
          rc.currentPage = i - that.minYear;
        }
        rc.data.push(i);
      }
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    // 月份在计算时需要先加1
    getMonth: function () {
      var that = this;
      var type = that.viewType;
      var list = that.lunarMonthList;
      var lunarList = that.lunarList;
      var now = that.now.getMonth();
      var rc = { data: [], idx: [], index: 2, currentPage: 0, currentPosition: 0 };
      var lMonth = 0;

      // if (type === 1) {
      //   now = that.year;
      // } else if (type === 2) {
      //   now = that.lYear;
      // } else {
      //   now = that.now.getFullYear();
      // }

      for (var i = 0; i < 12; i++) {
        if (i === now) {
          rc.currentPage = i;
        }
        rc.idx.push(i + 1);
        if (that.viewType === 1) {
          rc.data.push(i + 1);
        } else if (that.viewType === 2) {
          rc.data.push(list[i]);
        }
      }
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    getDay: function () {
      var that = this;
      var now = that.now;
      var list = that.lunarDayList;
      var day = now.getDate();
      var days = that.getDays(now.getMonth() + 1);
      var rc = { data: [], idx: [], index: 3, currentPage: 0, currentPosition: 0 };

      for (var i = 0; i < days; i++) {
        if (i + 1 === day) {
          rc.currentPage = i;
        }
        rc.idx.push(i + 1);
        if (that.viewType === 1) {
          rc.data.push(i + 1);
        } else if (that.viewType === 2) {
          rc.data.push(list[i]);
        }
      }
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    getHour: function () {
      var that = this;
      var now = that.now.getHours();
      var rc = { data: [], index: 4, currentPage: 0, currentPosition: 0 };
      if (that.isShowHourUnknown) {
        rc.data.push('\u672a\u77e5');
      }
      for (var i = 1; i < 24; i++) {
        if (i === now) {
          rc.currentPage = i;
        }
        if (i > 0) {
          rc.data.push(i);
        }
      }
      if (0 === now) {
        rc.currentPage = i;
      }
      rc.data.push(0);
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    getMinute: function () {
      var that = this;
      var now = that.now.getMinutes();
      var rc = { data: [], index: 5, currentPage: 0, currentPosition: 0 };
      for (var i = 0; i < 60; i++) {
        if (i + 1 === now) {
          rc.currentPage = i;
        }
        rc.data.push(i + 1);
      }
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    getSecond: function () {
      var that = this;
      var now = that.now.getSeconds();
      var rc = { data: [], index: 6, currentPage: 0, currentPosition: 0 };
      for (var i = 0; i < 60; i++) {
        if (i + 1 === now) {
          rc.currentPage = i;
        }
        rc.data.push(i + 1);
      }
      rc.total = rc.data.length;
      rc.currentPosition = (rc.currentPage - that.baseN) * that.pageH * -1;
      return rc;
    },

    getDays: function (m, y, n) {
      n = 31;
      switch (m) {
        case 2:
          n = this.isLeap(y) ? 29 : 28;
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          n = 30;
          break;
      }
      return n;
    },

    view: function () {
      var that = this;
      var now = that.now;
      var year = now.getFullYear();
      that.createBox();
      that.container.innerHTML =
        /*'<div class="kui-calender">' +*/
        '<div class="kui-calender__shade"></div>' +
        '  <div class="kui-calender__panel calenderFromBottomToUp">' +
        '    <div class="kui-calender__toolbar">' +
        '      <div class="kui-calender__btns" id="kui-calender__btns-cancel">\u53d6\u6d88</div>' +
        '      <div class="kui-calender__btns">' +
        '        <span style="color: #f60;" id="kui-calender__btns-gongli">\u516c\u5386</span>' +
        '        <span id="kui-calender__btns-yangli">\u519c\u5386</span>' +
        '      </div>' +
        '      <div class="kui-calender__btns" id="kui-calender__btns-sure">\u786e\u8ba4</div>' +
        '    </div>' +
        '    <div class="kui-calender__tb kui-calender__hd">' +
        (
          that.isShowYear && '<div class="kui-calender__tr">\u5e74</div>'
        ) +
        (
          that.isShowMonth && '<div class="kui-calender__tr">\u6708</div>'
        ) +
        (
          that.isShowDay && '<div class="kui-calender__tr">\u65e5</div>'
        ) +
        (
          that.isShowHour && '<div class="kui-calender__tr">\u65f6</div>'
        ) +
        (
          that.isShowMinute && '<div class="kui-calender__tr">\u5206</div>'
        ) +
        (
          that.isShowSecond && '<div class="kui-calender__tr">\u79d2</div>'
        ) +
        '    </div>' +
        '    <div class="kui-calender__tb" style="height:220px">' +
        that.addYearHTML() +
        that.addMonthHTML() +
        that.addDayHTML() +
        that.addHourHTML() +
        that.addMinuteHTML() +
        that.addSecondHTML() +
        '      <div class="kui-calender__frame" style="height: 44px;"></div>' +
        '    </div>' +
        '</div>'
        /* + '</div>'*/
        ;
      that.bindEvent();
    },

    createBox: function () {
      var that = this;
      var el = document.createElement('div');
      el.classList.add('kui-calender');
      el.id = 'kui-calender' + that.index;
      that.container = el;
      document.body && document.body.appendChild(el);
    },

    childHTML: function (str, y, id, type) {
      var that = this;
      y = y || 0;
      if (!type || type === 1) {
        return '<li class="kui-calender__td" style="height: 44px;" index="' + str + '">' + str + '</li>'
      } else if (type === 2) {
        return '<div class="kui-calender__tr" style="height:220px"><ul id="kui-calender__all' + id + that.index + '" style="transform: translate3d(0, ' + y + 'px, 0); line-height: 44px;">' + str + '</ul></div>';
      }
    },

    listHTML: function (k) {
      var that = this;
      var rc = [];
      that[k].data.forEach(function (v, i) {
        rc.push(that.childHTML(v, i));
      });
      return rc.join('');
    },

    yearHTML: function () { return this.listHTML('yearData'); },
    monthHTML: function () { return this.listHTML('monthData'); },
    dayHTML: function () { return this.listHTML('dayData'); },
    hourHTML: function () { return this.listHTML('hourData'); },
    minuteHTML: function () { return this.listHTML('minuteData'); },
    secondHTML: function () { return this.listHTML('secondData'); },

    addYearHTML: function () {
      var that = this;
      var data = that.yearData;
      return that.isShowYear
        ? that.childHTML(that.yearHTML(), data.currentPosition, 'year', 2)
        : ''
    },
    addMonthHTML: function () {
      var that = this;
      var data = that.monthData;
      return that.isShowMonth
        ? that.childHTML(that.monthHTML(), data.currentPosition, 'month', 2)
        : ''
    },
    addDayHTML: function () {
      var that = this;
      var data = that.dayData;
      return that.isShowDay
        ? that.childHTML(that.dayHTML(), data.currentPosition, 'day', 2)
        : ''
    },
    addHourHTML: function () {
      var that = this;
      var data = that.hourData;
      return that.isShowHour
        ? that.childHTML(that.hourHTML(), data.currentPosition, 'hour', 2)
        : ''
    },
    addMinuteHTML: function () {
      var that = this;
      var data = that.minuteData;
      return that.isShowMinute
        ? that.childHTML(that.minuteHTML(), data.currentPosition, 'minute', 2)
        : ''
    },
    addSecondHTML: function () {
      var that = this;
      var data = that.secondData;
      return that.isShowSecond
        ? that.childHTML(that.secondHTML(), data.currentPosition, 'second', 2)
        : ''
    },

    upYearHTML: function () { },
    upMonthHTML: function () { },
    upDayHTML: function () { },
    upHourHTML: function () { },
    upMinuteHTML: function () { },
    upSecondHTML: function () { },

    bindEvent: function () {
      var that = this;
      var idx = that.index;

      that.yearData.el = S(that.selector.year);
      that.monthData.el = S(that.selector.month);
      that.dayData.el = S(that.selector.day);
      that.hourData.el = S(that.selector.hour);
      that.minuteData.el = S(that.selector.minute);
      that.secondData.el = S(that.selector.second);

      if (that.isShowYear) {
        that.bindTouch(that.yearData, function (r) {
          r = r || {};
          // that.year = that.yearData.data[r.currentPage];
        });
      }
      if (that.isShowMonth) {
        that.bindTouch(that.monthData, function (r) {
          r = r || {};
          // that.month = that.monthData.idx[r.currentPage];
          // that.lMonth = that.monthData.data[r.currentPage];
        });
      }

      if (that.isShowDay) {
        that.bindTouch(that.dayData, function (r) {
          r = r || {};
          // that.day = that.dayData.idx[r.currentPage];
          // that.lDay = that.dayData.data[r.currentPage];
        });
      }

      if (that.isShowHour) {
        that.bindTouch(that.hourData, function (r) {
          r = r || {};
          // that.hour = that.hourData.data[r.currentPage];
          // that.lHour = that.hourData.data[r.currentPage];
        });
      }

      if (that.isShowMinute) {
        that.bindTouch(that.minuteData, function (r) {
          r = r || {};
          // that.minute = that.minuteData.data[r.currentPage];
          // that.lMinute = that.minuteData.data[r.currentPage];
        });
      }

      if (that.isShowSecond) {
        that.bindTouch(that.secondData, function (r) {
          r = r || {};
          // that.second = that.secondData.data[r.currentPage];
          // that.lSecond = that.secondData.data[r.currentPage];
        });
      }
    },

    bindTouch: function (params, callback) {
      if (!params || !params.el) {
        return;
      }
      var that = this;
      // 容器
      var el = params.el;
      // 当前子页码
      var currentPage = params.currentPage || 0;
      // 子页码数 12
      var total = params.total;
      // 子页面高度 44
      var pageH = params.pageH || 44;
      // 页面滑动最后一页的位置 -pageH * (total - 3)
      var minH = 0;
      // 页面滑动最后一页的位置 pageH * 2
      var maxH = 0;
      // 开始位置
      var startY = 0;
      // 记录手指按下去的时间
      var startT = 0;
      // 手指按下的屏幕位置
      var startPosition = 0;
      // 记录当前页面位置
      var currentPosition = 0;
      // 手指当前滑动的距离
      var moveLength = 0;
      // 滑动的方向: 1:上; 2:下; 3:左; 4:右;
      var direction = 2;
      // 是否发生左右滑动
      var isMove = false;
      // 计算当前页码时，距离边界的相差个数，默认容器显示5个，距离边界为2
      var baseN = params.baseN || 2;
      // 标记当前滑动是否结束(手指已离开屏幕)
      var isTouchEnd = true;
      var transitionAnimation = 'all 300ms ease-out 0s';
      if (!total || !pageH) {
        return;
      }
      minH = -pageH * (total - 3);
      maxH = pageH * 2;
      startPosition = currentPosition = params.currentPosition;

      function transform(node, y) {
        ['transform', 'webkitTransform'].forEach(function (v) {
          node.style[v] = 'translate3d(0,' + (y || 0) + 'px,0)';
        });
      }

      function transition(node, val) {
        ['transition', 'webkitTransition'].forEach(function (v) {
          node.style[v] = val || '';
        });
      }

      el.addEventListener('touchstart', function (e) {
        e.preventDefault();
        // 单手指触摸或者多手指同时触摸，禁止第二个手指延迟操作事件
        if (e.touches.length === 1 || isTouchEnd) {
          var touch = e.touches[0];
          // 获取开始位置
          startY = touch.pageY;
          // 本次滑动前的初始位置
          startPosition = currentPosition;
          // 取消动画效果
          transition(el);
          // 记录手指按下的开始时间
          startT = +new Date();
          // 是否产生滑动
          isMove = false;
          // 当前滑动开始
          isTouchEnd = false;
        }
      });

      el.addEventListener('touchmove', function (e) {
        e.preventDefault();
        // 如果当前滑动已结束，不管其他手指是否在屏幕上都禁止该事件
        if (isTouchEnd) {
          return;
        }
        var touch = e.touches[0];
        // 计算移动的距离
        var deltaY = touch.pageY - startY;
        // 当前需要移动到点的位置
        var Y = startPosition + deltaY;
        // 如果Y小于minHeight或大于maxHeight，则表示页面超出边界
        if (Y < minH) {
          Y = minH;
        }
        if (Y > maxH) {
          Y = maxH;
        }
        // 获得需要移动的距离
        deltaY = Y - startPosition;
        // 设置动画效果
        transition(el, transitionAnimation);
        // 按照固定值移动
        Y = Math.floor(Y / pageH) * pageH;
        // 移动
        transform(el, Y);
        // 记录当前位置
        currentPosition = Y;
        isMove = true;
        moveLength = deltaY;
        // 判断手指滑动的方向
        direction = deltaY > 0 ? 1 : 2;
      });

      el.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (!isMove || isTouchEnd) {
          return;
        }
        var Y = currentPosition;
        // 计算当前的页码
        currentPage = (Y - pageH * baseN) / pageH;
        // 标记当前完整的滑动事件已经结束
        isTouchEnd = true;
        callback && callback({ currentPage: Math.abs(currentPage), eventType: params.eventType });
      });
    }



















  }

  Object.assign(MsCalender.prototype, __hook__);
  window.MsCalender = MsCalender;
})()

