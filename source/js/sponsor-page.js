/**
 * Sponsor Page 赞助页面数据加载
 * 适配 PJAX 无刷新加载
 */

(function () {
  "use strict";

  const API_URL = "https://sponsor.268682.xyz/data/sponsors/sponsors.json";

  /**
   * 加载赞助数据
   */
  async function loadSponsors() {
    const container = document.getElementById("sponsor-list");
    if (!container) return;

    // 检查是否已经加载过数据
    if (container.dataset.loaded === "true") return;

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.sponsors && data.sponsors.length > 0) {
        renderSponsors(data.sponsors, container);
        container.dataset.loaded = "true";
      } else {
        container.innerHTML = '<div class="sponsor-empty">暂无赞赏记录</div>';
      }
    } catch (error) {
      console.error("加载赞助数据失败:", error);
      container.innerHTML =
        '<div class="sponsor-error">加载失败，请稍后重试</div>';
    }
  }

  /**
   * 渲染赞助列表
   */
  function renderSponsors(sponsors, container) {
    // 按日期倒序排序
    const sortedSponsors = sponsors.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    let html = '<div class="sponsor-grid">';

    sortedSponsors.forEach((sponsor) => {
      // 如果有 URL，则使用 a 标签包裹，否则使用 div
      const hasUrl = sponsor.url && sponsor.url.trim() !== "";
      const tag = hasUrl ? "a" : "div";
      const hrefAttr = hasUrl
        ? `href="${sponsor.url}" target="_blank" rel="noopener"`
        : "";

      html += `
        <${tag} ${hrefAttr} class="sponsor-item ${hasUrl ? "sponsor-item-link" : ""}">
          <div class="sponsor-avatar">
            <img src="${sponsor.avatar || "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/kemiao0815.webp"}" alt="${sponsor.name}" loading="lazy">
          </div>
          <div class="sponsor-info">
            <span class="sponsor-name">${sponsor.name}</span>
            <span class="sponsor-amount">${sponsor.amount}</span>
            <span class="sponsor-date">${sponsor.date}</span>
          </div>
        </${tag}>
      `;
    });

    html += "</div>";
    container.innerHTML = html;
  }

  /**
   * 初始化
   */
  function init() {
    if (document.getElementById("sponsor-list")) {
      loadSponsors();
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
    // 重置加载状态
    const container = document.getElementById("sponsor-list");
    if (container) {
      container.dataset.loaded = "false";
    }
    setTimeout(init, 100);
  });
})();
