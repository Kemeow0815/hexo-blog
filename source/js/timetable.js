/**
 * Timetable 课程表组件
 * 适配 Hexo Stellar 主题
 */

(function () {
  "use strict";

  // 课程数据
  let timetableData = null;
  let currentWeek = 1;
  let maxWeek = 20;

  /**
   * 获取 DOM 元素
   */
  function getElements() {
    return {
      tableName: document.getElementById("table-name"),
      weekInfo: document.getElementById("week-info"),
      currentWeekBadge: document.getElementById("current-week-badge"),
      currentWeekDisplay: document.getElementById("current-week-display"),
      prevWeekBtn: document.getElementById("prev-week"),
      nextWeekBtn: document.getElementById("next-week"),
      gridBody: document.getElementById("grid-body"),
      mobileList: document.getElementById("mobile-list"),
      saturdayCols: document.querySelectorAll(".day-col.saturday"),
    };
  }

  /**
   * 检查当前页面是否是课程表页面
   */
  function isTimetablePage() {
    return !!document.getElementById("timetable-app");
  }

  /**
   * 初始化
   */
  async function init() {
    // 检查是否是课程表页面
    if (!isTimetablePage()) {
      return;
    }

    try {
      const response = await fetch("/blog/data/大三下.json");
      timetableData = await response.json();
      maxWeek = timetableData.settings.maxWeek;
      currentWeek = resolveCurrentWeek(
        timetableData.settings.startDate,
        maxWeek,
      );

      renderHeader();
      renderTimetable();
      bindEvents();

      // 初始化主题按钮图标
      updateThemeToggleIcon();
    } catch (error) {
      console.error("加载课程表失败:", error);
    }
  }

  /**
   * 计算当前周
   */
  function resolveCurrentWeek(startDateText, maxWeek) {
    const startDate = new Date(startDateText);
    if (isNaN(startDate.getTime())) return 1;

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor(
      (now.getTime() - startDate.getTime()) / msPerDay,
    );
    const week = Math.floor(diffDays / 7) + 1;

    return Math.min(Math.max(1, week), maxWeek);
  }

  /**
   * 判断是否显示周末
   */
  function shouldShowSaturday(week) {
    const weekendDisplay = timetableData.settings.weekendDisplay;
    if (!weekendDisplay || !weekendDisplay.enabled) {
      return timetableData.settings.showSat;
    }
    return (
      weekendDisplay.weeks.includes(week) && weekendDisplay.days.includes("sat")
    );
  }

  /**
   * 渲染头部信息
   */
  function renderHeader() {
    const elements = getElements();
    if (!elements.tableName) return;

    elements.tableName.textContent =
      timetableData.settings.tableName || "课程表";
    elements.weekInfo.textContent = `共 ${maxWeek} 周`;
    elements.currentWeekDisplay.textContent = `第 ${currentWeek} 周`;

    const actualCurrentWeek = resolveCurrentWeek(
      timetableData.settings.startDate,
      maxWeek,
    );
    if (currentWeek === actualCurrentWeek) {
      elements.currentWeekBadge.style.display = "inline-block";
    } else {
      elements.currentWeekBadge.style.display = "none";
    }

    // 控制按钮状态
    elements.prevWeekBtn.disabled = currentWeek <= 1;
    elements.nextWeekBtn.disabled = currentWeek >= maxWeek;

    // 显示/隐藏周六列
    const showSaturday = shouldShowSaturday(currentWeek);
    elements.saturdayCols.forEach((col) => {
      col.style.display = showSaturday ? "flex" : "none";
    });

    // 更新 grid 布局类
    const gridHeader = document.querySelector(".grid-header");

    if (gridHeader) {
      if (showSaturday) {
        gridHeader.classList.add("show-saturday");
      } else {
        gridHeader.classList.remove("show-saturday");
      }
    }
  }

  /**
   * 渲染课程表
   */
  function renderTimetable() {
    renderDesktopView();
    renderMobileView();
  }

  /**
   * 渲染桌面端视图
   */
  function renderDesktopView() {
    const elements = getElements();
    if (!elements.gridBody) return;

    const nodeTimes = timetableData.timeTable;
    const schedules = timetableData.schedules;
    const courses = timetableData.courses;
    const showSaturday = shouldShowSaturday(currentWeek);

    let html = "";

    // 每两节一行
    for (let node = 1; node <= timetableData.settings.nodes; node += 2) {
      const nextNode = Math.min(node + 1, timetableData.settings.nodes);
      const timeInfo = nodeTimes.find((t) => t.node === node);
      const nextTimeInfo = nodeTimes.find((t) => t.node === nextNode);

      html += `
        <div class="grid-row ${showSaturday ? "show-saturday" : ""}">
          <div class="time-col">
            <div class="node-text">第 ${node}-${nextNode} 节</div>
            <div class="time-text">${timeInfo?.startTime || "--:--"} - ${nextTimeInfo?.endTime || "--:--"}</div>
          </div>
      `;

      // 周一到周五，以及周六（如果启用）
      const days = showSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

      days.forEach((day) => {
        const daySchedules = schedules.filter(
          (s) =>
            s.day === day &&
            s.startNode === node &&
            currentWeek >= s.startWeek &&
            currentWeek <= s.endWeek,
        );

        if (daySchedules.length > 0) {
          html += `<div class="day-col">`;
          daySchedules.forEach((schedule) => {
            const course = courses.find((c) => c.id === schedule.id);
            if (course) {
              html += renderCourseCard(course, schedule);
            }
          });
          html += `</div>`;
        } else {
          html += `<div class="day-col empty">—</div>`;
        }
      });

      html += `</div>`;
    }

    elements.gridBody.innerHTML = html;
  }

  /**
   * 渲染移动端视图
   */
  function renderMobileView() {
    const elements = getElements();
    if (!elements.mobileList) return;

    const schedules = timetableData.schedules;
    const courses = timetableData.courses;
    const showSaturday = shouldShowSaturday(currentWeek);

    const days = showSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const dayNames = ["", "周一", "周二", "周三", "周四", "周五", "周六"];

    let html = "";

    days.forEach((day) => {
      const daySchedules = schedules.filter(
        (s) =>
          s.day === day &&
          currentWeek >= s.startWeek &&
          currentWeek <= s.endWeek,
      );

      html += `
        <div class="mobile-day-card">
          <div class="mobile-day-header">${dayNames[day]}</div>
          <div class="mobile-day-content">
      `;

      if (daySchedules.length > 0) {
        daySchedules.sort((a, b) => a.startNode - b.startNode);
        daySchedules.forEach((schedule) => {
          const course = courses.find((c) => c.id === schedule.id);
          if (course) {
            html += renderMobileCourseCard(course, schedule);
          }
        });
      } else {
        html += `<p class="no-course">本周暂无课程</p>`;
      }

      html += `</div></div>`;
    });

    elements.mobileList.innerHTML = html;
  }

  /**
   * 渲染课程卡片
   */
  function renderCourseCard(course, schedule) {
    const color = parseColor(course.color);
    return `
      <div class="course-card" style="border-color: ${color}; background: ${color}15;">
        <div class="course-name">${course.courseName}</div>
        <div class="course-info">
          <div>${schedule.startWeek}-${schedule.endWeek}周</div>
          <div>教室：${schedule.room || "未填写"}</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染移动端课程卡片
   */
  function renderMobileCourseCard(course, schedule) {
    const nodeTimes = timetableData.timeTable;
    const startTime = nodeTimes.find((t) => t.node === schedule.startNode);
    const endTime = nodeTimes.find(
      (t) => t.node === schedule.startNode + schedule.step - 1,
    );
    const color = parseColor(course.color);

    return `
      <div class="mobile-course-card" style="border-color: ${color}; background: ${color}15;">
        <div class="mobile-course-name">${course.courseName}</div>
        <div class="mobile-course-info">
          <div>时间：${startTime?.startTime || "--:--"} - ${endTime?.endTime || "--:--"}</div>
          <div>周次：${schedule.startWeek}-${schedule.endWeek}周</div>
          <div>教室：${schedule.room || "未填写"}</div>
        </div>
      </div>
    `;
  }

  /**
   * 解析颜色
   */
  function parseColor(rawColor) {
    if (!rawColor) return "#3b82f6";
    // 处理 ARGB 格式 #AARRGGBB
    if (rawColor.startsWith("#") && rawColor.length === 9) {
      return `#${rawColor.slice(3)}`;
    }
    return rawColor;
  }

  /**
   * 更新主题切换按钮图标
   */
  function updateThemeToggleIcon() {
    const themeToggle = document.getElementById("timetable-theme-toggle");
    if (!themeToggle) return;

    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "auto";
    const isDark =
      currentTheme === "dark" ||
      (currentTheme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const iconLight = themeToggle.querySelector(".icon-light");
    const iconDark = themeToggle.querySelector(".icon-dark");

    if (iconLight && iconDark) {
      iconLight.style.display = isDark ? "none" : "block";
      iconDark.style.display = isDark ? "block" : "none";
    }
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    let newTheme;

    // light -> dark -> auto -> light
    switch (currentTheme) {
      case "light":
        newTheme = "dark";
        break;
      case "dark":
        newTheme = "auto";
        break;
      default:
        newTheme = "light";
    }

    // 应用主题
    if (newTheme === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", newTheme);
    }

    // 保存到本地存储
    window.localStorage.setItem("Stellar.theme", newTheme);

    // 触发主题切换动画/效果
    if (typeof utils !== "undefined" && utils.dark) {
      utils.dark.mode =
        newTheme === "auto"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : newTheme;
      utils.dark.method.toggle.start();
    }

    // 更新按钮图标
    updateThemeToggleIcon();

    // 显示提示
    const messages = {
      light: "已切换到明亮模式",
      dark: "已切换到深色模式",
      auto: "已切换到跟随系统",
    };
    if (typeof hud !== "undefined" && hud.toast) {
      hud.toast(messages[newTheme]);
    }
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    const elements = getElements();

    // 移除旧的事件监听器（如果有）
    const newPrevBtn = elements.prevWeekBtn.cloneNode(true);
    const newNextBtn = elements.nextWeekBtn.cloneNode(true);
    elements.prevWeekBtn.parentNode.replaceChild(
      newPrevBtn,
      elements.prevWeekBtn,
    );
    elements.nextWeekBtn.parentNode.replaceChild(
      newNextBtn,
      elements.nextWeekBtn,
    );

    // 绑定新的事件
    newPrevBtn.addEventListener("click", () => {
      if (currentWeek > 1) {
        currentWeek--;
        renderHeader();
        renderTimetable();
      }
    });

    newNextBtn.addEventListener("click", () => {
      if (currentWeek < maxWeek) {
        currentWeek++;
        renderHeader();
        renderTimetable();
      }
    });

    // 绑定主题切换按钮
    const themeToggle = document.getElementById("timetable-theme-toggle");
    if (themeToggle) {
      const newThemeToggle = themeToggle.cloneNode(true);
      themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
      newThemeToggle.addEventListener("click", toggleTheme);
    }

    // 初始化主题按钮图标
    updateThemeToggleIcon();
  }

  // 启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // PJAX 兼容
  document.addEventListener("pjax:complete", init);
})();
