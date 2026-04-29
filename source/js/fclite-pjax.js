/**
 * Friend Circle Lite PJAX 适配器
 * 确保友链朋友圈 Lite 版本在 PJAX 无刷新加载时正确初始化
 */

(function () {
  "use strict";

  // 页面配置
  const PAGE_CONFIG = {
    private_api_url: "https://fc-lite.268682.xyz/",
    page_turning_number: 24,
    error_img: "https://pic.imgdb.cn/item/6695daa4d9c307b7e953ee3d.jpg",
  };

  const CONTAINER_ID = "friend-circle-lite-root";
  const FCLITE_SCRIPT_URL = "/blog/js/fclite.min.js";

  /**
   * 检查当前页面是否是友链朋友圈页面
   */
  function isFcirclePage() {
    return !!document.getElementById(CONTAINER_ID);
  }

  /**
   * 动态加载 fclite.min.js 脚本
   */
  function loadFcliteScript() {
    return new Promise((resolve, reject) => {
      // 检查脚本是否已经加载
      if (typeof window.initialize_fc_lite === "function") {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = FCLITE_SCRIPT_URL;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Failed to load fclite.min.js"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 清理友链朋友圈容器
   */
  function cleanupFcircle() {
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   * 初始化友链朋友圈 Lite
   */
  async function initFcircle() {
    if (!isFcirclePage()) {
      return;
    }

    try {
      // 确保 fclite.min.js 已加载
      await loadFcliteScript();

      const container = document.getElementById(CONTAINER_ID);

      // 检查 initialize_fc_lite 函数是否存在
      if (typeof window.initialize_fc_lite !== "function") {
        return;
      }

      // 设置正确的 UserConfig
      window.UserConfig = {
        private_api_url: PAGE_CONFIG.private_api_url,
        page_turning_number: PAGE_CONFIG.page_turning_number,
        error_img: PAGE_CONFIG.error_img,
      };

      // 清空容器（防止重复内容）
      container.innerHTML = "";

      // 调用初始化函数
      window.initialize_fc_lite();
    } catch (e) {
      // 静默处理错误
    }
  }

  /**
   * 处理 PJAX 完成事件
   */
  function handlePjaxComplete(event) {
    // 延迟执行，确保 DOM 已完全更新
    setTimeout(function () {
      initFcircle();
    }, 100);
  }

  /**
   * 处理 PJAX 开始事件
   */
  function handlePjaxBefore(event) {
    if (isFcirclePage()) {
      cleanupFcircle();
    }
  }

  /**
   * 初始化适配器
   */
  function initAdapter() {
    // 监听 PJAX 事件
    document.addEventListener("pjax:complete", handlePjaxComplete);
    document.addEventListener("pjax:before", handlePjaxBefore);
  }

  // 启动适配器
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdapter);
  } else {
    initAdapter();
  }
})();
