/**
 * Gallery PJAX 适配器
 * 确保 Fancybox 在 PJAX 导航后正确初始化
 */

(function () {
  "use strict";

  /**
   * 初始化 Fancybox
   */
  function initFancybox() {
    // 检查页面是否有 gallery 或需要 fancybox 的元素
    const selector =
      "[data-fancybox]:not(.error), .with-fancybox .atk-content img:not([atk-emoticon]), .gallery img";
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      return;
    }

    // 检查 Fancybox 是否已加载
    if (typeof Fancybox === "undefined") {
      // 如果 Fancybox 未加载，等待加载完成
      const checkFancybox = setInterval(() => {
        if (typeof Fancybox !== "undefined") {
          clearInterval(checkFancybox);
          bindFancybox(selector);
        }
      }, 100);

      // 5秒后停止检查
      setTimeout(() => clearInterval(checkFancybox), 5000);
    } else {
      bindFancybox(selector);
    }
  }

  /**
   * 绑定 Fancybox
   */
  function bindFancybox(selector) {
    try {
      // 先解绑旧的绑定（如果有）
      Fancybox.destroy();
    } catch (e) {
      // 忽略错误
    }

    // 重新绑定
    Fancybox.bind(selector, {
      hideScrollbar: false,
      Thumbs: {
        autoStart: false,
      },
      caption: (fancybox, slide) => {
        return slide.triggerEl.alt || slide.triggerEl.dataset.caption || null;
      },
    });

    console.log("[gallery-pjax] Fancybox initialized");
  }

  /**
   * 处理 PJAX 完成事件
   */
  function handlePjaxComplete() {
    // 延迟执行，确保 DOM 已更新
    setTimeout(initFancybox, 100);
  }

  /**
   * 初始化适配器
   */
  function initAdapter() {
    // 监听 PJAX 事件
    document.addEventListener("pjax:complete", handlePjaxComplete);

    console.log("[gallery-pjax] Adapter ready");
  }

  // 启动适配器
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdapter);
  } else {
    initAdapter();
  }
})();
