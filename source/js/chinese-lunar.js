document.addEventListener("DOMContentLoaded", () => {
  initializeCard();
});

document.addEventListener("pjax:complete", () => {
  initializeCard();
});

function initializeCard() {
  cardTimes();
  cardRefreshTimes();
}

let year,
  month,
  week,
  date,
  dates,
  weekStr,
  monthStr,
  asideTime,
  asideDay,
  asideDayNum,
  animalYear,
  ganzhiYear,
  lunarMon,
  lunarDay;

// 获取下一个春节日期
function getNextSpringFestivalDate() {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 2025-2030年的春节日期（农历正月初一对应的公历日期）
  const springFestivals = {
    2025: new Date("2025/01/29"), // 蛇年
    2026: new Date("2026/02/17"), // 马年
    2027: new Date("2027/02/06"), // 羊年
    2028: new Date("2028/01/26"), // 猴年
    2029: new Date("2029/02/13"), // 鸡年
    2030: new Date("2030/02/03"), // 狗年
  };

  // 如果今年的春节已过，返回明年的
  if (now > springFestivals[currentYear]) {
    return (
      springFestivals[currentYear + 1] || new Date(`${currentYear + 1}/02/10`)
    );
  }
  return springFestivals[currentYear] || new Date(`${currentYear}/02/10`);
}

function cardRefreshTimes() {
  const e = document.getElementById("card-widget-schedule");
  if (e) {
    const now = new Date(); // 获取当前时间
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const currentWeek = now.getDay();

    // 计算本月天数
    const isLeapYear =
      (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
      currentYear % 400 === 0;
    const monthDays = [
      31,
      isLeapYear ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    const daysInMonth = monthDays[currentMonth];

    // 计算本年进度
    const yearStart = new Date(`${currentYear}/01/01 00:00:00`);
    const yearDay = (now - yearStart) / 1e3 / 60 / 60 / 24;
    const isLeap =
      (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
      currentYear % 400 === 0;
    const yearTotalDays = isLeap ? 366 : 365;

    e.querySelector("#pBar_year").value = yearDay;
    e.querySelector("#pBar_year").max = yearTotalDays;
    e.querySelector("#p_span_year").innerHTML =
      ((yearDay / yearTotalDays) * 100).toFixed(1) + "%";
    e.querySelector(".schedule-r0 .schedule-d1 .aside-span2").innerHTML =
      `还剩<a> ${(yearTotalDays - yearDay).toFixed(0)} </a>天`;

    // 计算本月进度
    e.querySelector("#pBar_month").value = currentDate;
    e.querySelector("#pBar_month").max = daysInMonth;
    e.querySelector("#p_span_month").innerHTML =
      ((currentDate / daysInMonth) * 100).toFixed(1) + "%";
    e.querySelector(".schedule-r1 .schedule-d1 .aside-span2").innerHTML =
      `还剩<a> ${daysInMonth - currentDate} </a>天`;

    // 计算本周进度
    const weekDay = currentWeek === 0 ? 7 : currentWeek;
    e.querySelector("#pBar_week").value = weekDay;
    e.querySelector("#p_span_week").innerHTML =
      ((weekDay / 7) * 100).toFixed(1) + "%";
    e.querySelector(".schedule-r2 .schedule-d1 .aside-span2").innerHTML =
      `还剩<a> ${7 - weekDay} </a>天`;

    // 更新春节倒计时
    const newYearDate = getNextSpringFestivalDate();
    const daysUntilNewYear = Math.floor(
      (newYearDate - now) / 1e3 / 60 / 60 / 24,
    );
    e.querySelector("#schedule-days").innerHTML = daysUntilNewYear;

    // 更新春节日期显示
    const yearStr = newYearDate.getFullYear();
    const monthStr = String(newYearDate.getMonth() + 1).padStart(2, "0");
    const dateStr = String(newYearDate.getDate()).padStart(2, "0");
    e.querySelector("#schedule-date").innerHTML =
      `${yearStr}-${monthStr}-${dateStr}`;
  }
}

function cardTimes() {
  const now = new Date(); // 每次调用都获取当前时间
  year = now.getFullYear();
  month = now.getMonth();
  week = now.getDay();
  date = now.getDate();

  const e = document.getElementById("card-widget-calendar");
  if (e) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    weekStr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][week];
    const monthData = [
      { month: "1月", days: 31 },
      { month: "2月", days: isLeapYear ? 29 : 28 },
      { month: "3月", days: 31 },
      { month: "4月", days: 30 },
      { month: "5月", days: 31 },
      { month: "6月", days: 30 },
      { month: "7月", days: 31 },
      { month: "8月", days: 31 },
      { month: "9月", days: 30 },
      { month: "10月", days: 31 },
      { month: "11月", days: 30 },
      { month: "12月", days: 31 },
    ];
    monthStr = monthData[month].month;
    dates = monthData[month].days;

    const t = (week + 8 - (date % 7)) % 7;
    let n = "",
      d = false,
      s = 7 - t;
    const o =
      (dates - s) % 7 === 0
        ? Math.floor((dates - s) / 7) + 1
        : Math.floor((dates - s) / 7) + 2;
    const c = e.querySelector("#calendar-main");
    const l = e.querySelector("#calendar-date");

    l.style.fontSize = ["64px", "48px", "36px"][Math.min(o - 3, 2)];

    for (let i = 0; i < o; i++) {
      if (!c.querySelector(`.calendar-r${i}`)) {
        c.innerHTML += `<div class='calendar-r${i}'></div>`;
      }
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j === t) {
          n = 1;
          d = true;
        }
        const r = n === date ? " class='now'" : "";
        if (!c.querySelector(`.calendar-r${i} .calendar-d${j} a`)) {
          c.querySelector(`.calendar-r${i}`).innerHTML +=
            `<div class='calendar-d${j}'><a${r}>${n}</a></div>`;
        }
        if (n >= dates) {
          n = "";
          d = false;
        }
        if (d) {
          n += 1;
        }
      }
    }

    const lunarDate = chineseLunar.solarToLunar(new Date(year, month, date));
    animalYear = chineseLunar.format(lunarDate, "A");
    ganzhiYear = chineseLunar.format(lunarDate, "T").slice(0, -1);
    lunarMon = chineseLunar.format(lunarDate, "M");
    lunarDay = chineseLunar.format(lunarDate, "d");

    const newYearDate = getNextSpringFestivalDate();
    const daysUntilNewYear = Math.floor(
      (newYearDate - now) / 1e3 / 60 / 60 / 24,
    );
    asideTime = new Date(`${year}/01/01 00:00:00`);
    asideDay = (now - asideTime) / 1e3 / 60 / 60 / 24;
    asideDayNum = Math.floor(asideDay);
    const weekNum =
      week - (asideDayNum % 7) >= 0
        ? Math.ceil(asideDayNum / 7)
        : Math.ceil(asideDayNum / 7) + 1;

    e.querySelector("#calendar-week").innerHTML =
      `第${weekNum}周&nbsp;${weekStr}`;
    e.querySelector("#calendar-date").innerHTML = date
      .toString()
      .padStart(2, "0");
    e.querySelector("#calendar-solar").innerHTML =
      `${year}年${monthStr}&nbsp;第${asideDay.toFixed(0)}天`;
    e.querySelector("#calendar-lunar").innerHTML =
      `${ganzhiYear}${animalYear}年&nbsp;${lunarMon}${lunarDay}`;
    document.getElementById("schedule-days").innerHTML = daysUntilNewYear;
  }
}
