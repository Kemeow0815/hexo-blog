/**
 * Reward Widget 赞赏者侧边栏组件
 * 适配 PJAX 无刷新加载
 */

(function () {
  "use strict";

  const API_URL = "https://sponsor.268682.xyz/data/sponsors/sponsors.json";
  const CAROUSEL_INTERVAL = 3000; // 轮播间隔 3秒

  let carouselInterval = null;
  let currentIndex = 0;
  let sponsors = [];
  let shuffledSponsors = [];
  let isInitialized = false;

  /**
   * 加载赞助数据
   */
  async function loadRewardData() {
    const cardContainer = document.getElementById("reward-card-inner");
    const listContainer = document.getElementById("reward-list");

    if (!cardContainer || !listContainer) return;

    // 检查是否已经加载过
    if (cardContainer.dataset.loaded === "true") return;

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.sponsors && data.sponsors.length > 0) {
        sponsors = data.sponsors;
        // 随机排序
        shuffledSponsors = shuffleArray([...sponsors]);

        renderCard(shuffledSponsors, cardContainer);
        renderList(shuffledSponsors, listContainer);
        startCarousel();

        cardContainer.dataset.loaded = "true";
      } else {
        cardContainer.innerHTML =
          '<div class="reward-empty">暂无赞赏记录</div>';
        listContainer.innerHTML = "";
      }
    } catch (error) {
      console.error("加载赞赏数据失败:", error);
      cardContainer.innerHTML = '<div class="reward-empty">加载失败</div>';
      listContainer.innerHTML = "";
    }
  }

  /**
   * 随机排序数组
   */
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * 渲染主卡片
   */
  function renderCard(sponsors, container) {
    let html = "";

    sponsors.forEach((sponsor, index) => {
      const hasUrl = sponsor.url && sponsor.url.trim() !== "";
      const urlAttr = hasUrl ? `data-url="${sponsor.url}"` : "";
      const linkClass = hasUrl ? "reward-card-item-link" : "";

      html += `
        <div class="reward-card-item ${linkClass}" data-index="${index}" ${urlAttr} style="display: ${index === 0 ? "flex" : "none"};">
          <div class="reward-card-avatar">
            <img src="${sponsor.avatar || "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/kemiao0815.webp"}" alt="${sponsor.name}" loading="lazy">
          </div>
          <div class="reward-card-info">
            <span class="reward-card-name">${sponsor.name}</span>
            <span class="reward-card-desc">感谢来自${sponsor.name}的投喂</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // 为可点击的项添加点击事件
    const linkItems = container.querySelectorAll(".reward-card-item-link");
    linkItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        const url = this.getAttribute("data-url");
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      });
    });
  }

  /**
   * 渲染简化列表
   */
  function renderList(sponsors, container) {
    // 取前20个显示
    const listSponsors = sponsors.slice(0, 20);

    let html = "";
    listSponsors.forEach((sponsor) => {
      const hasUrl = sponsor.url && sponsor.url.trim() !== "";

      if (hasUrl) {
        html += `<a href="${sponsor.url}" target="_blank" rel="noopener" class="reward-list-item">${sponsor.name}</a>`;
      } else {
        html += `<span class="reward-list-item">${sponsor.name}</span>`;
      }
    });

    container.innerHTML = html;
  }

  /**
   * 开始轮播
   */
  function startCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }

    const items = document.querySelectorAll(".reward-card-item");
    if (items.length <= 1) return;

    carouselInterval = setInterval(() => {
      // 隐藏当前
      items[currentIndex].style.display = "none";

      // 随机选择下一个（不重复当前）
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * items.length);
      } while (nextIndex === currentIndex && items.length > 1);

      currentIndex = nextIndex;
      items[currentIndex].style.display = "flex";
    }, CAROUSEL_INTERVAL);
  }

  /**
   * 停止轮播
   */
  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  /**
   * 初始化
   */
  function init() {
    const card = document.getElementById("reward-card");
    if (!card) return;

    // 避免重复初始化
    if (isInitialized) return;
    isInitialized = true;

    // 加载数据
    loadRewardData();

    // 鼠标悬停时暂停轮播
    card.addEventListener("mouseenter", stopCarousel);
    card.addEventListener("mouseleave", startCarousel);
  }

  /**
   * 清理
   */
  function cleanup() {
    stopCarousel();
    isInitialized = false;

    // 重置加载状态
    const cardContainer = document.getElementById("reward-card-inner");
    if (cardContainer) {
      cardContainer.dataset.loaded = "false";
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // PJAX 兼容
  document.addEventListener("pjax:complete", function () {
    cleanup();
    setTimeout(init, 100);
  });

  // 页面卸载时清理
  window.addEventListener("beforeunload", cleanup);
})();
