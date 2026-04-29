/**
 * Timetable Widget 课程表小组件
 * 适配 Hexo Stellar 主题
 * 显示当前课程状态，点击跳转课程表页面
 */

(function () {
  "use strict";

  // 全局状态存储
  const WIDGET_STATE_KEY = "__timetable_widget_state__";
  let updateInterval = null;

  /**
   * 获取或初始化全局状态
   */
  function getGlobalState() {
    if (typeof window === "undefined") {
      return { payload: null, statusText: "", intervalId: null };
    }

    if (!window[WIDGET_STATE_KEY]) {
      window[WIDGET_STATE_KEY] = {
        payload: null,
        statusText: "",
        intervalId: null,
      };
    }

    return window[WIDGET_STATE_KEY];
  }

  /**
   * 检查是否是课程表小组件页面
   */
  function isTimetableWidgetPage() {
    return !!document.getElementById("timetable-widget");
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
   * 解析时间字符串为分钟数
   */
  function parseTimeToMinute(text) {
    const parts = String(text || "").split(":");
    if (parts.length !== 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
  }

  /**
   * 从时间范围文本提取开始和结束分钟数
   */
  function extractRangeMinutes(timeText) {
    const match = String(timeText || "").match(
      /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/,
    );
    if (!match) return null;
    const startMinute = parseTimeToMinute(match[1]);
    const endMinute = parseTimeToMinute(match[2]);
    if (startMinute === null || endMinute === null) return null;
    return { startMinute, endMinute };
  }

  /**
   * 格式化持续时间
   */
  function formatDuration(totalSeconds) {
    const safeSecs = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeSecs / 3600);
    const minutes = Math.floor((safeSecs % 3600) / 60);
    const seconds = safeSecs % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}时`);
    if (minutes > 0) parts.push(`${minutes}分`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);

    return parts.join("");
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
   * 获取今日课程
   */
  function getTodayCourses(timetableData, now) {
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const schedules = timetableData.schedules || [];
    const courses = timetableData.courses || [];
    const currentWeek = resolveCurrentWeek(
      timetableData.settings?.startDate,
      timetableData.settings?.maxWeek || 20,
    );

    const todaySchedules = schedules.filter((s) => {
      if (s.day !== day) return false;
      if (currentWeek < s.startWeek || currentWeek > s.endWeek) return false;
      return true;
    });

    return todaySchedules
      .map((schedule) => {
        const course = courses.find((c) => c.id === schedule.id);
        if (!course) return null;

        const nodeTimes = timetableData.timeTable || [];
        const startNodeTime = nodeTimes.find(
          (nt) => nt.node === schedule.startNode,
        );
        const endNode = schedule.startNode + schedule.step - 1;
        const endNodeTime = nodeTimes.find((nt) => nt.node === endNode);

        if (!startNodeTime) return null;

        const timeText = endNodeTime
          ? `${startNodeTime.startTime} - ${endNodeTime.endTime}`
          : `${startNodeTime.startTime} - ${startNodeTime.endTime}`;

        const range = extractRangeMinutes(timeText);
        if (!range) return null;

        return {
          ...course,
          ...schedule,
          timeText,
          startMinute: range.startMinute,
          endMinute: range.endMinute,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.startMinute - b.startMinute);
  }

  /**
   * 获取本周所有课程
   */
  function getAllCoursesThisWeek(timetableData) {
    const schedules = timetableData.schedules || [];
    const courses = timetableData.courses || [];
    const currentWeek = resolveCurrentWeek(
      timetableData.settings?.startDate,
      timetableData.settings?.maxWeek || 20,
    );

    const allCourses = [];

    for (const schedule of schedules) {
      if (currentWeek < schedule.startWeek || currentWeek > schedule.endWeek)
        continue;

      const course = courses.find((c) => c.id === schedule.id);
      if (!course) continue;

      const nodeTimes = timetableData.timeTable || [];
      const startNodeTime = nodeTimes.find(
        (nt) => nt.node === schedule.startNode,
      );
      const endNode = schedule.startNode + schedule.step - 1;
      const endNodeTime = nodeTimes.find((nt) => nt.node === endNode);

      if (!startNodeTime) continue;

      const timeText = endNodeTime
        ? `${startNodeTime.startTime} - ${endNodeTime.endTime}`
        : `${startNodeTime.startTime} - ${startNodeTime.endTime}`;

      const range = extractRangeMinutes(timeText);
      if (!range) continue;

      allCourses.push({
        ...course,
        ...schedule,
        timeText,
        startMinute: range.startMinute,
        endMinute: range.endMinute,
      });
    }

    return allCourses.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.startMinute - b.startMinute;
    });
  }

  /**
   * 解析当前状态
   */
  function resolveLiveState(timetableData) {
    const now = new Date();
    const currentSecond =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const currentMinute = Math.floor(currentSecond / 60);
    const day = now.getDay() === 0 ? 7 : now.getDay();

    // 周末 (周六日)
    if (day >= 6) {
      const allCourses = getAllCoursesThisWeek(timetableData);
      const nextWeekFirstCourse = allCourses.find((c) => c.day === 1);

      if (nextWeekFirstCourse) {
        const daysUntilMonday = day === 6 ? 2 : 1;
        const secondsUntilCourse =
          daysUntilMonday * 86400 +
          nextWeekFirstCourse.startMinute * 60 -
          currentSecond;

        return {
          status: "weekend",
          title: "周末",
          lines: [
            { text: "下周首节", bold: true },
            {
              text: nextWeekFirstCourse.courseName,
              color: parseColor(nextWeekFirstCourse.color),
            },
            { text: nextWeekFirstCourse.room || "未知" },
            { text: `还有 ${formatDuration(secondsUntilCourse)}`, bold: true },
          ],
        };
      }

      return {
        status: "weekend",
        title: "周末",
        lines: [{ text: "好好休息吧" }],
      };
    }

    const courses = getTodayCourses(timetableData, now);

    // 今日无课
    if (courses.length === 0) {
      const allCourses = getAllCoursesThisWeek(timetableData);
      const nextDayCourse = allCourses.find((c) => c.day > day);

      if (nextDayCourse) {
        const daysUntil = nextDayCourse.day - day;
        const secondsUntilCourse =
          daysUntil * 86400 + nextDayCourse.startMinute * 60 - currentSecond;

        return {
          status: "no-class",
          title: "今日无课",
          lines: [
            { text: "翌日首节", bold: true },
            {
              text: nextDayCourse.courseName,
              color: parseColor(nextDayCourse.color),
            },
            { text: nextDayCourse.room || "未知" },
            { text: `还有 ${formatDuration(secondsUntilCourse)}`, bold: true },
          ],
        };
      }

      return {
        status: "no-class",
        title: "今日无课",
        lines: [{ text: "好好休息吧" }],
      };
    }

    // 查找当前状态
    for (let index = 0; index < courses.length; index++) {
      const current = courses[index];
      const next = courses[index + 1] || null;

      // 上课中
      if (
        currentMinute >= current.startMinute &&
        currentMinute < current.endMinute
      ) {
        const remainSeconds = current.endMinute * 60 - currentSecond;

        return {
          status: "in-class",
          title: "上课中",
          lines: [
            {
              text: current.courseName,
              bold: true,
              color: parseColor(current.color),
            },
            { text: current.room || "未知" },
            { text: `距下课 ${formatDuration(remainSeconds)}`, bold: true },
          ],
        };
      }

      // 课间
      if (
        next &&
        currentMinute >= current.endMinute &&
        currentMinute < next.startMinute
      ) {
        const remainSeconds = next.startMinute * 60 - currentSecond;

        return {
          status: "break",
          title: "课间",
          lines: [
            { text: "下节", bold: true },
            { text: next.courseName, color: parseColor(next.color) },
            { text: next.room || "未知" },
            { text: `还有 ${formatDuration(remainSeconds)}`, bold: true },
          ],
        };
      }
    }

    // 今日课毕
    const lastCourse = courses[courses.length - 1];
    if (currentMinute >= lastCourse.endMinute) {
      const allCourses = getAllCoursesThisWeek(timetableData);
      const nextDayCourse = allCourses.find((c) => c.day > day);

      if (nextDayCourse) {
        const daysUntil = nextDayCourse.day - day;
        const secondsUntilCourse =
          daysUntil * 86400 + nextDayCourse.startMinute * 60 - currentSecond;

        return {
          status: "finished",
          title: "今日课毕",
          lines: [
            { text: "翌日首节", bold: true },
            {
              text: nextDayCourse.courseName,
              color: parseColor(nextDayCourse.color),
            },
            { text: nextDayCourse.room || "未知" },
            { text: `还有 ${formatDuration(secondsUntilCourse)}`, bold: true },
          ],
        };
      }

      return {
        status: "finished",
        title: "今日课毕",
        lines: [{ text: "好好休息吧" }],
      };
    }

    // 第一节课前
    const firstCourse = courses[0];
    const remainSeconds = firstCourse.startMinute * 60 - currentSecond;

    return {
      status: "before-class",
      title: "课前",
      lines: [
        {
          text: firstCourse.courseName,
          bold: true,
          color: parseColor(firstCourse.color),
        },
        { text: firstCourse.room || "未知" },
        { text: `距上课 ${formatDuration(remainSeconds)}`, bold: true },
      ],
    };
  }

  /**
   * 渲染小组件
   */
  function renderWidget(timetableData) {
    const widget = document.getElementById("timetable-widget");
    if (!widget) return;

    const state = resolveLiveState(timetableData);

    let html = `
      <div class="timetable-widget-header">
        <span class="timetable-widget-status">${state.title}</span>
      </div>
    `;

    // 根据状态生成不同的布局
    switch (state.status) {
      case "in-class":
        // 上课中: 课程名 - 教室, 距下课时间
        html += `
          <div class="timetable-info-row">
            <span class="timetable-label">本节：</span>
            <div class="timetable-value">
              <span class="timetable-course-name">${state.lines[0].text}</span>
              <span class="timetable-room">- ${state.lines[1].text}</span>
            </div>
          </div>
          <div class="timetable-info-row">
            <span class="timetable-label">距下课还有：</span>
            <span class="timetable-countdown">${state.lines[2].text.replace("距下课 ", "")}</span>
          </div>
        `;
        break;

      case "break":
        // 课间: 下节课程名 - 教室, 还有时间
        html += `
          <div class="timetable-info-row">
            <span class="timetable-label">下节：</span>
            <div class="timetable-value">
              <span class="timetable-course-name">${state.lines[1].text}</span>
              <span class="timetable-room">- ${state.lines[2].text}</span>
            </div>
          </div>
          <div class="timetable-info-row">
            <span class="timetable-label">距上课还有：</span>
            <span class="timetable-countdown">${state.lines[3].text.replace("还有 ", "")}</span>
          </div>
        `;
        break;

      case "before-class":
        // 课前: 首节课程名 - 教室, 距上课时间
        html += `
          <div class="timetable-info-row">
            <span class="timetable-label">首节：</span>
            <div class="timetable-value">
              <span class="timetable-course-name">${state.lines[0].text}</span>
              <span class="timetable-room">- ${state.lines[1].text}</span>
            </div>
          </div>
          <div class="timetable-info-row">
            <span class="timetable-label">距上课还有：</span>
            <span class="timetable-countdown">${state.lines[2].text.replace("距上课 ", "")}</span>
          </div>
        `;
        break;

      case "finished":
      case "no-class":
        // 今日课毕/无课: 翌日首节课程名 - 教室, 还有时间
        if (state.lines.length >= 4) {
          html += `
            <div class="timetable-info-row">
              <span class="timetable-label">翌日首节：</span>
              <div class="timetable-value">
                <span class="timetable-course-name">${state.lines[1].text}</span>
                <span class="timetable-room">- ${state.lines[2].text}</span>
              </div>
            </div>
            <div class="timetable-info-row">
              <span class="timetable-label">距上课还有：</span>
              <span class="timetable-countdown">${state.lines[3].text.replace("还有 ", "")}</span>
            </div>
          `;
        } else {
          html += `<div class="timetable-info-row"><span class="timetable-room">${state.lines[0].text}</span></div>`;
        }
        break;

      case "weekend":
        // 周末: 下周首节课程名 - 教室, 还有时间
        if (state.lines.length >= 4) {
          html += `
            <div class="timetable-info-row">
              <span class="timetable-label">下周首节：</span>
              <div class="timetable-value">
                <span class="timetable-course-name">${state.lines[1].text}</span>
                <span class="timetable-room">- ${state.lines[2].text}</span>
              </div>
            </div>
            <div class="timetable-info-row">
              <span class="timetable-label">距上课还有：</span>
              <span class="timetable-countdown">${state.lines[3].text.replace("还有 ", "")}</span>
            </div>
          `;
        } else {
          html += `<div class="timetable-info-row"><span class="timetable-room">${state.lines[0].text}</span></div>`;
        }
        break;

      default:
        // 默认显示
        state.lines.forEach((line) => {
          html += `<div class="timetable-info-row"><span class="timetable-room">${line.text}</span></div>`;
        });
    }

    widget.innerHTML = html;
  }

  /**
   * 加载课程表数据
   */
  async function loadTimetableData() {
    try {
      const response = await fetch("/blog/data/大三下.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("加载课程表数据失败:", error);
      return null;
    }
  }

  /**
   * 更新小组件
   */
  async function updateWidget() {
    const globalState = getGlobalState();

    // 如果已经有数据，直接使用
    if (globalState.payload) {
      renderWidget(globalState.payload);
      return;
    }

    // 首次加载
    const data = await loadTimetableData();
    if (data) {
      globalState.payload = data;
      renderWidget(data);

      // 启动定时更新
      if (globalState.intervalId === null) {
        globalState.intervalId = setInterval(() => {
          if (globalState.payload) {
            renderWidget(globalState.payload);
          }
        }, 1000);
      }
    } else {
      const widget = document.getElementById("timetable-widget");
      if (widget) {
        widget.innerHTML = '<div class="timetable-widget-error">加载失败</div>';
      }
    }
  }

  /**
   * 重置全局状态（用于 PJAX 后重新加载）
   */
  function resetGlobalState() {
    if (typeof window !== "undefined") {
      window[WIDGET_STATE_KEY] = {
        payload: null,
        statusText: "",
        intervalId: null,
      };
    }
  }

  /**
   * 初始化
   */
  function init() {
    // 检查是否存在小组件
    const widget = document.getElementById("timetable-widget");
    if (!widget) {
      return;
    }

    // 如果小组件正在加载中（有 loading 样式），则执行更新
    const isLoading = widget.querySelector(".timetable-widget-loading");
    if (isLoading) {
      // PJAX 后重置状态，强制重新加载数据
      resetGlobalState();
      updateWidget();
    } else {
      // 已经有内容，只启动定时更新
      const globalState = getGlobalState();
      if (globalState.payload && globalState.intervalId === null) {
        globalState.intervalId = setInterval(() => {
          if (globalState.payload) {
            renderWidget(globalState.payload);
          }
        }, 1000);
      }
    }
  }

  /**
   * 清理
   */
  function cleanup() {
    const globalState = getGlobalState();
    if (globalState.intervalId) {
      clearInterval(globalState.intervalId);
      globalState.intervalId = null;
    }
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  // 启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // PJAX 兼容 - 在 PJAX 完成后重新初始化
  document.addEventListener("pjax:complete", () => {
    // 延迟执行，确保 DOM 已经更新
    setTimeout(() => {
      cleanup();
      init();
    }, 100);
  });

  // 页面卸载时清理
  window.addEventListener("beforeunload", cleanup);
})();
