/**
 * 友链朋友圈 PJAX 适配器
 * 确保友链朋友圈在 PJAX 无刷新加载时正确初始化和销毁
 * 使用 iframe 沙箱完全隔离脚本环境，并同步深色模式
 */

(function () {
  "use strict";

  // 配置
  const CONFIG = {
    containerId: "friend-circle-container",
    apiUrl: "https://fc.268682.xyz/",
    pageSize: 24,
    errorImg:
      "https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/logo.png",
  };

  /**
   * 检查当前页面是否是友链朋友圈页面
   */
  function isFcirclePage() {
    return !!document.getElementById(CONFIG.containerId);
  }

  /**
   * 获取当前主题模式
   */
  function getCurrentTheme() {
    // 从 html 元素的 data-theme 属性获取
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    if (htmlTheme === "dark" || htmlTheme === "light") {
      return htmlTheme;
    }
    // 如果没有设置，检查系统偏好
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  /**
   * 创建 iframe 沙箱来运行友链朋友圈
   */
  function createFcircleIframe(container) {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "width: 100%; border: none; overflow: hidden;";
    iframe.scrolling = "no";
    iframe.setAttribute("data-fcircle-iframe", "true");

    const currentTheme = getCurrentTheme();

    // 构建 iframe 内容
    const iframeContent = `
<!DOCTYPE html>
<html data-theme="${currentTheme}">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/blog/css/yyyz.min.css" type="text/css">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent;
            color: var(--text, inherit);
        }
        #friend-circle-container {
            max-width: 100%;
        }

        /* ==================== 深色模式适配 ==================== */

        /* 基础变量 */
        :root[data-theme="dark"] {
            /* Element Plus 变量 */
            --el-bg-color: #1a1a1a;
            --el-bg-color-overlay: #2d2d2d;
            --el-text-color-primary: #e0e0e0;
            --el-text-color-regular: #c0c0c0;
            --el-text-color-secondary: #a0a0a0;
            --el-border-color: #404040;
            --el-border-color-light: #505050;
            --el-fill-color: #2d2d2d;
            --el-fill-color-light: #3a3a3a;
            --el-fill-color-lighter: #454545;
            --el-overlay-color-light: rgba(0, 0, 0, 0.5);

            /* 友链朋友圈变量 */
            --lmm-fontcolor: #a9a9b3;
            --lmm-background: #252627;
            --lmm-floorcolor: #454545;
        }

        :root[data-theme="light"], :root:not([data-theme]) {
            /* Element Plus 变量 */
            --el-bg-color: #ffffff;
            --el-bg-color-overlay: #ffffff;
            --el-text-color-primary: #303133;
            --el-text-color-regular: #606266;
            --el-text-color-secondary: #909399;
            --el-border-color: #dcdfe6;
            --el-border-color-light: #e4e7ed;
            --el-fill-color: #f0f2f5;
            --el-fill-color-light: #f5f7fa;
            --el-fill-color-lighter: #fafafa;
            --el-overlay-color-light: rgba(0, 0, 0, 0.5);

            /* 友链朋友圈变量 */
            --lmm-fontcolor: #363636;
            --lmm-background: #f7f9fe;
            --lmm-floorcolor: #a9a9b3;
        }

        /* ==================== 弹窗/Tooltip 深色模式 ==================== */

        /* Element Plus Popper/Tooltip */
        :root[data-theme="dark"] .el-popper {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
            color: var(--el-text-color-primary) !important;
        }

        :root[data-theme="dark"] .el-popper.is-light {
            background: var(--el-bg-color-overlay) !important;
            border: 1px solid var(--el-border-color-light) !important;
        }

        :root[data-theme="dark"] .el-popper.is-light .el-popper__arrow::before {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color-light) !important;
        }

        :root[data-theme="dark"] .el-popper.is-dark {
            background: var(--el-text-color-primary) !important;
            color: var(--el-bg-color) !important;
        }

        /* 弹窗内容区域 */
        :root[data-theme="dark"] .el-popper .el-popper__content,
        :root[data-theme="dark"] .el-tooltip__popper,
        :root[data-theme="dark"] .el-popover {
            background: var(--el-bg-color-overlay) !important;
            color: var(--el-text-color-primary) !important;
            border-color: var(--el-border-color) !important;
        }

        /* 弹窗箭头 */
        :root[data-theme="dark"] .el-popper .el-popper__arrow::before,
        :root[data-theme="dark"] .el-tooltip__popper .popper__arrow::after,
        :root[data-theme="dark"] .el-popover .popper__arrow::after {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
        }

        /* ==================== Dialog 对话框深色模式 ==================== */

        :root[data-theme="dark"] .el-dialog {
            background: var(--el-bg-color) !important;
            border: 1px solid var(--el-border-color) !important;
            background-image: none !important;
        }

        :root[data-theme="dark"] .el-dialog__header {
            background: var(--el-bg-color) !important;
            border-bottom: 1px solid var(--el-border-color) !important;
            background-image: none !important;
        }

        :root[data-theme="dark"] .el-dialog__title {
            color: var(--el-text-color-primary) !important;
        }

        :root[data-theme="dark"] .el-dialog__body {
            background: var(--el-bg-color) !important;
            color: var(--el-text-color-regular) !important;
            background-image: none !important;
        }

        :root[data-theme="dark"] .el-dialog__footer {
            background: var(--el-bg-color) !important;
            border-top: 1px solid var(--el-border-color) !important;
            background-image: none !important;
        }

        /* 移除所有弹窗的渐变色 */
        :root[data-theme="dark"] .el-dialog,
        :root[data-theme="dark"] .el-dialog * {
            background-image: none !important;
        }

        /* 友链朋友圈特定弹窗样式 */
        :root[data-theme="dark"] [class*="cf-"],
        :root[data-theme="dark"] [class*="cf-"] * {
            background-image: none !important;
        }

        /* ==================== 遮罩层深色模式 ==================== */

        :root[data-theme="dark"] .el-overlay {
            background: rgba(0, 0, 0, 0.7) !important;
        }

        :root[data-theme="dark"] .el-overlay-dialog {
            background: rgba(0, 0, 0, 0.7) !important;
        }

        /* ==================== 下拉菜单深色模式 ==================== */

        :root[data-theme="dark"] .el-dropdown__popper {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .el-dropdown-menu {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .el-dropdown-menu__item {
            color: var(--el-text-color-regular) !important;
        }

        :root[data-theme="dark"] .el-dropdown-menu__item:hover {
            background: var(--el-fill-color-light) !important;
            color: var(--el-text-color-primary) !important;
        }

        /* ==================== 消息提示深色模式 ==================== */

        :root[data-theme="dark"] .el-message {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
            color: var(--el-text-color-primary) !important;
        }

        :root[data-theme="dark"] .el-message-box {
            background: var(--el-bg-color) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .el-message-box__title {
            color: var(--el-text-color-primary) !important;
        }

        :root[data-theme="dark"] .el-message-box__content {
            color: var(--el-text-color-regular) !important;
        }

        /* ==================== 通知深色模式 ==================== */

        :root[data-theme="dark"] .el-notification {
            background: var(--el-bg-color-overlay) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .el-notification__title {
            color: var(--el-text-color-primary) !important;
        }

        :root[data-theme="dark"] .el-notification__content {
            color: var(--el-text-color-regular) !important;
        }

        /* ==================== 友链朋友圈特定组件深色模式 ==================== */

        /* 文章卡片 */
        :root[data-theme="dark"] .cf-article {
            background: var(--lmm-background) !important;
            color: var(--lmm-fontcolor) !important;
            border-color: var(--lmm-floorcolor) !important;
        }

        :root[data-theme="dark"] .cf-article-title {
            color: var(--lmm-fontcolor) !important;
        }

        :root[data-theme="dark"] .cf-article-desc {
            color: var(--lmm-floorcolor) !important;
        }

        /* 统计面板 */
        :root[data-theme="dark"] #cf-state {
            background: var(--lmm-background) !important;
            color: var(--lmm-fontcolor) !important;
        }

        :root[data-theme="dark"] .cf-label {
            color: var(--lmm-floorcolor) !important;
        }

        :root[data-theme="dark"] .cf-message {
            color: var(--lmm-fontcolor) !important;
        }

        /* 加载更多按钮 */
        :root[data-theme="dark"] .cf-load-more {
            background: var(--lmm-background) !important;
            color: var(--lmm-fontcolor) !important;
            border-color: var(--lmm-floorcolor) !important;
        }

        /* 随机文章弹窗 */
        :root[data-theme="dark"] .cf-random-article {
            background: var(--el-bg-color-overlay) !important;
            color: var(--el-text-color-primary) !important;
            border-color: var(--el-border-color) !important;
        }

        /* 友链列表 */
        :root[data-theme="dark"] .cf-friend-list {
            background: var(--lmm-background) !important;
        }

        :root[data-theme="dark"] .cf-friend-item {
            background: var(--el-fill-color) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .cf-friend-name {
            color: var(--lmm-fontcolor) !important;
        }

        :root[data-theme="dark"] .cf-friend-desc {
            color: var(--lmm-floorcolor) !important;
        }

        /* 输入框 */
        :root[data-theme="dark"] .el-input__inner,
        :root[data-theme="dark"] .el-textarea__inner {
            background: var(--el-fill-color) !important;
            color: var(--el-text-color-primary) !important;
            border-color: var(--el-border-color) !important;
        }

        /* 按钮 */
        :root[data-theme="dark"] .el-button--default {
            background: var(--el-fill-color) !important;
            color: var(--el-text-color-primary) !important;
            border-color: var(--el-border-color) !important;
        }

        :root[data-theme="dark"] .el-button--primary {
            background: var(--el-color-primary) !important;
            color: #fff !important;
            border-color: var(--el-color-primary) !important;
        }
    </style>
</head>
<body>
    <div id="friend-circle-container">与主机通讯中……</div>
    <script>
        var UserConfig = {
            private_api_url: '${CONFIG.apiUrl}',
            page_turning_number: ${CONFIG.pageSize},
            error_img: '${CONFIG.errorImg}'
        };
    <\/script>
    <script src="/blog/js/yyyz.min.js" defer><\/script>
    <script>
        // 监听高度变化并通知父页面
        function notifyHeight() {
            var height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'fcircle-height', height: height }, '*');
        }

        // 定期检查高度变化
        var lastHeight = 0;
        setInterval(function() {
            var currentHeight = document.body.scrollHeight;
            if (currentHeight !== lastHeight) {
                lastHeight = currentHeight;
                notifyHeight();
            }
        }, 500);

        // 初始通知
        window.addEventListener('load', notifyHeight);

        // 监听来自父页面的主题变化消息
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'fcircle-theme') {
                document.documentElement.setAttribute('data-theme', e.data.theme);
            }
        });
    <\/script>
</body>
</html>`;

    // 使用 srcdoc 设置内容
    iframe.srcdoc = iframeContent;

    // 监听来自 iframe 的消息
    const messageHandler = function (e) {
      if (e.data && e.data.type === "fcircle-height") {
        iframe.style.height = e.data.height + "px";
      }
    };
    window.addEventListener("message", messageHandler);

    // 保存消息处理器引用以便清理
    iframe._messageHandler = messageHandler;

    return iframe;
  }

  /**
   * 同步主题到 iframe
   */
  function syncThemeToIframe() {
    const iframe = document.querySelector("iframe[data-fcircle-iframe]");
    if (iframe && iframe.contentWindow) {
      const currentTheme = getCurrentTheme();
      iframe.contentWindow.postMessage(
        {
          type: "fcircle-theme",
          theme: currentTheme,
        },
        "*",
      );
    }
  }

  /**
   * 监听主题变化
   */
  function observeThemeChanges() {
    // 使用 MutationObserver 监听 data-theme 属性变化
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          syncThemeToIframe();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // 保存 observer 引用以便清理
    window._fcircleThemeObserver = observer;
  }

  /**
   * 停止监听主题变化
   */
  function stopObservingThemeChanges() {
    if (window._fcircleThemeObserver) {
      window._fcircleThemeObserver.disconnect();
      window._fcircleThemeObserver = null;
    }
  }

  /**
   * 清理友链朋友圈
   */
  function cleanupFcircle() {
    stopObservingThemeChanges();

    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    // 移除 iframe
    const iframe = container.querySelector("iframe[data-fcircle-iframe]");
    if (iframe) {
      // 移除消息监听
      if (iframe._messageHandler) {
        window.removeEventListener("message", iframe._messageHandler);
      }
      iframe.remove();
    }

    // 重置容器内容
    container.innerHTML = "与主机通讯中……";
  }

  /**
   * 初始化友链朋友圈
   */
  function initFcircle() {
    if (!isFcirclePage()) return;

    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    console.log("[fcircle-pjax] Initializing fcircle in iframe sandbox");

    // 清空容器
    container.innerHTML = "";

    // 创建 iframe 沙箱
    const iframe = createFcircleIframe(container);
    container.appendChild(iframe);

    // 监听主题变化
    observeThemeChanges();
  }

  /**
   * 处理 PJAX 完成事件 - 进入新页面
   */
  function handlePjaxComplete(event) {
    if (!isFcirclePage()) return;

    console.log("[fcircle-pjax] Entering fcircle page");

    // 延迟初始化，确保 DOM 已更新
    setTimeout(initFcircle, 50);
  }

  /**
   * 处理 PJAX 开始前事件 - 离开当前页面
   */
  function handlePjaxBefore(event) {
    if (isFcirclePage()) {
      console.log("[fcircle-pjax] Leaving fcircle page, cleaning up...");
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

    // 首次加载时检查是否需要初始化
    if (isFcirclePage()) {
      console.log("[fcircle-pjax] Initial page is fcircle");
      // 延迟初始化，确保其他脚本已加载
      setTimeout(initFcircle, 100);
    }

    console.log("[fcircle-pjax] Adapter initialized");
  }

  // 启动适配器
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdapter);
  } else {
    initAdapter();
  }
})();
