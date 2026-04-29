/**
 * Toast Notification 通知悬浮窗
 * 轻量级通知组件，支持多种类型、自动消失、动画效果
 * 支持自定义位置、自定义按钮、回调函数
 */

(function () {
  "use strict";

  // 配置
  const CONFIG = {
    duration: 5000, // 默认显示时长（毫秒）
    maxCount: 5, // 最大同时显示数量
    position: "top-right", // 默认位置：top-left, top-right, bottom-left, bottom-right
  };

  // 图标 SVG
  const ICONS = {
    success:
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error:
      '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    warning:
      '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    close:
      '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  };

  // 容器缓存
  const containers = {
    "top-left": null,
    "top-right": null,
    "bottom-left": null,
    "bottom-right": null,
  };

  let toastCount = 0;
  const activeToasts = new Map();

  /**
   * 获取或创建通知容器
   */
  function getContainer(position) {
    if (!containers[position]) {
      const container = document.createElement("div");
      container.id = `toast-container-${position}`;
      container.className = `toast-container ${position}`;
      document.body.appendChild(container);
      containers[position] = container;
    }
    return containers[position];
  }

  /**
   * 创建通知元素
   */
  function createToastElement(options) {
    const toast = document.createElement("div");
    toast.className = `toast-item toast-${options.type}`;
    toast.id = `toast-${Date.now()}-${toastCount++}`;

    // 图标
    const iconHtml = `<div class="toast-icon">${ICONS[options.type] || ICONS.info}</div>`;

    // 内容
    const titleHtml = options.title
      ? `<div class="toast-title">${escapeHtml(options.title)}</div>`
      : "";
    const messageHtml = `<div class="toast-message">${escapeHtml(options.message)}</div>`;

    // 关闭按钮
    const closeHtml = `<button class="toast-close" aria-label="关闭">${ICONS.close}</button>`;

    // 自定义按钮
    let buttonHtml = "";
    if (options.button) {
      const btn = options.button;
      const btnIcon = btn.icon
        ? `<span class="btn-icon">${btn.icon}</span>`
        : "";
      const btnText = `<span class="btn-text">${escapeHtml(btn.text)}</span>`;
      buttonHtml = `<button class="toast-action-btn">${btnIcon}${btnText}</button>`;
    }

    // 进度条
    const progressHtml =
      options.duration > 0
        ? `<div class="toast-progress" style="width: 100%;"></div>`
        : "";

    toast.innerHTML = `${iconHtml}<div class="toast-content">${titleHtml}${messageHtml}${buttonHtml}</div>${closeHtml}${progressHtml}`;

    return toast;
  }

  /**
   * 转义 HTML 特殊字符
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 显示通知
   */
  function show(options) {
    // 合并默认配置
    const config = {
      type: "info",
      title: "",
      message: "",
      duration: CONFIG.duration,
      position: CONFIG.position,
      button: null,
      onClose: null,
      ...options,
    };

    // 检查最大数量限制
    if (activeToasts.size >= CONFIG.maxCount) {
      const firstToast = activeToasts.values().next().value;
      if (firstToast) {
        close(firstToast.id);
      }
    }

    // 创建通知元素
    const toast = createToastElement(config);
    const container = getContainer(config.position);

    // 对外暴露的 API
    const externalApi = {
      close: () => close(toast.id),
      onClose: config.onClose,
    };

    // 绑定关闭事件
    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        close(toast.id);
      });
    }

    // 绑定自定义按钮事件
    if (config.button) {
      const actionBtn = toast.querySelector(".toast-action-btn");
      if (actionBtn) {
        actionBtn.addEventListener("click", () => {
          if (config.button.onclick) {
            config.button.onclick();
          }
          close(toast.id);
        });
      }
    }

    // 添加到容器
    container.appendChild(toast);

    // 触发显示动画
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // 存储通知信息
    const toastData = {
      id: toast.id,
      element: toast,
      startTime: Date.now(),
      duration: config.duration,
      timer: null,
      progressInterval: null,
      externalApi: externalApi,
    };

    activeToasts.set(toast.id, toastData);

    // 设置自动关闭
    if (config.duration > 0) {
      // 进度条动画
      const progressBar = toast.querySelector(".toast-progress");
      if (progressBar) {
        const updateProgress = () => {
          const elapsed = Date.now() - toastData.startTime;
          const remaining = Math.max(0, config.duration - elapsed);
          const percentage = (remaining / config.duration) * 100;
          progressBar.style.width = `${percentage}%`;

          if (remaining <= 0) {
            clearInterval(toastData.progressInterval);
          }
        };
        toastData.progressInterval = setInterval(updateProgress, 50);
      }

      // 自动关闭定时器
      toastData.timer = setTimeout(() => {
        close(toast.id);
      }, config.duration);

      // 鼠标悬停时暂停计时器
      let remainingTime = config.duration;
      let lastTime = Date.now();

      toast.addEventListener("mouseenter", () => {
        const now = Date.now();
        remainingTime -= now - lastTime;
        clearTimeout(toastData.timer);
        clearInterval(toastData.progressInterval);
      });

      toast.addEventListener("mouseleave", () => {
        lastTime = Date.now();
        toastData.timer = setTimeout(() => {
          close(toast.id);
        }, remainingTime);

        // 恢复进度条动画
        const progressBar = toast.querySelector(".toast-progress");
        if (progressBar) {
          const updateProgress = () => {
            const elapsed = Date.now() - lastTime;
            const currentRemaining = Math.max(0, remainingTime - elapsed);
            const percentage = (currentRemaining / config.duration) * 100;
            progressBar.style.width = `${percentage}%`;

            if (currentRemaining <= 0) {
              clearInterval(toastData.progressInterval);
            }
          };
          toastData.progressInterval = setInterval(updateProgress, 50);
        }
      });
    }

    return externalApi;
  }

  /**
   * 关闭通知
   */
  function close(id) {
    const toastData = activeToasts.get(id);
    if (!toastData) return;

    const { element, timer, progressInterval, externalApi } = toastData;

    // 清除定时器
    if (timer) clearTimeout(timer);
    if (progressInterval) clearInterval(progressInterval);

    // 触发隐藏动画
    element.classList.remove("show");
    element.classList.add("hide");

    // 执行关闭回调
    if (externalApi.onClose) {
      externalApi.onClose();
    }

    // 动画结束后移除元素
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      activeToasts.delete(id);

      // 如果没有通知了，移除容器
      if (activeToasts.size === 0) {
        Object.keys(containers).forEach((pos) => {
          if (containers[pos]) {
            containers[pos].remove();
            containers[pos] = null;
          }
        });
      }
    }, 300);
  }

  /**
   * 关闭所有通知
   */
  function closeAll() {
    activeToasts.forEach((toastData) => {
      close(toastData.id);
    });
  }

  /**
   * 快捷方法
   */
  function success(message, title, options = {}) {
    return show({ type: "success", message, title, ...options });
  }

  function error(message, title, options = {}) {
    return show({ type: "error", message, title, ...options });
  }

  function warning(message, title, options = {}) {
    return show({ type: "warning", message, title, ...options });
  }

  function info(message, title, options = {}) {
    return show({ type: "info", message, title, ...options });
  }

  // 暴露全局 API
  window.Toast = {
    show,
    close,
    closeAll,
    success,
    error,
    warning,
    info,
    config: CONFIG,
  };

  // PJAX 兼容：页面切换时关闭所有通知
  document.addEventListener("pjax:before", closeAll);
})();
