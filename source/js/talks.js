/**
 * TgTalk 说说页面展示脚本
 * 基于 https://tgtalk.kemeow.top/ API
 */
(function () {
  // 配置项
  const CONFIG = {
    API_URL: "https://tgtalk.kemeow.top/api/echo/page", // TgTalk API 地址
    AVATAR: "https://ui-avatars.com/api/?name=TgTalk&background=random", // 默认头像
  };

  // 状态管理
  const state = {
    resizeHandler: null,
    afterRenderTimer: null,
    listenersBound: false,
  };

  /**
   * 清理旧的事件监听器和定时器
   */
  function cleanup() {
    if (state.afterRenderTimer) {
      clearTimeout(state.afterRenderTimer);
      state.afterRenderTimer = null;
    }
    if (state.resizeHandler) {
      window.removeEventListener("resize", state.resizeHandler);
      state.resizeHandler = null;
    }
  }

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间字符串
   */
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 12 * month;

    if (diff < minute) {
      return "刚刚";
    } else if (diff < hour) {
      return Math.floor(diff / minute) + "分钟前";
    } else if (diff < day) {
      return Math.floor(diff / hour) + "小时前";
    } else if (diff < month) {
      return Math.floor(diff / day) + "天前";
    } else if (diff < year) {
      return Math.floor(diff / month) + "个月前";
    } else {
      return Math.floor(diff / year) + "年前";
    }
  }

  /**
   * 处理内容中的链接和表情
   * @param {string} text - 原始文本
   * @returns {string} HTML 字符串
   */
  function processContent(text) {
    if (!text) return "";

    // 1. 处理 Telegram 表情 HTML，转换为纯文本表情
    // 匹配 <i class="emoji" ...><b>😭</b></i> 格式
    text = text.replace(/<i\s+class="emoji"[^>]*><b>([^<]+)<\/b><\/i>/g, "$1");

    // 2. 处理链接
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(linkRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return text;
  }

  /**
   * 处理图片
   * @param {Array} images - 图片数组
   * @returns {string} HTML 字符串
   */
  function processImages(images) {
    if (!images || images.length === 0) return "";

    // 过滤掉表情符号图片（通常是 Telegram 的表情贴纸）
    const validImages = images.filter((img) => {
      const imgUrl = img.url || img;
      // 排除表情符号图片（多种格式）
      const isEmoji =
        /emoji|sticker|telegram\.org\/emoji/i.test(imgUrl) ||
        /F09F[0-9A-F]{4}/i.test(imgUrl) || // Unicode 表情编码
        (/\.(webp|png)$/i.test(imgUrl) && imgUrl.includes("emoji")) ||
        imgUrl.startsWith("//telegram.org/img/emoji");
      return !isEmoji;
    });

    if (validImages.length === 0) return "";

    const imageContainer = validImages
      .map((img) => {
        const imgUrl = img.url || img;
        return `<div class="talk-image-item"><img src="${imgUrl}" alt="talk image" onclick="viewImage(this)" loading="lazy"></div>`;
      })
      .join("");

    return `<div class="talk-images">${imageContainer}</div>`;
  }

  /**
   * 渲染单条说说
   * @param {Object} talk - 说说数据
   * @returns {string} HTML 字符串
   */
  function renderTalkItem(talk) {
    const timeStr = formatTime(talk.time);
    const contentHtml = processContent(talk.text);
    const imagesHtml = processImages(talk.image);
    const talkId = talk.id || Date.now();

    return `
      <div class="talk-item" id="talk-${talkId}">
        <div class="talk-content">
          <div class="talk-header">
            <span class="talk-time">${timeStr}</span>
          </div>
          <div class="talk-text">${contentHtml}</div>
          ${imagesHtml}
          <div class="talk-footer">
            <span class="talk-views">
              <svg viewBox="0 0 1024 1024" width="14" height="14">
                <path d="M512 106.7c-213.3 0-394.7 149.3-448 341.3-10.7 42.7-10.7 85.3 0 128 53.3 192 234.7 341.3 448 341.3s394.7-149.3 448-341.3c10.7-42.7 10.7-85.3 0-128-53.3-192-234.7-341.3-448-341.3z m0 554.6c-117.3 0-213.3-96-213.3-213.3s96-213.3 213.3-213.3 213.3 96 213.3 213.3-96 213.3-213.3 213.3z m0-320c-58.7 0-106.7 48-106.7 106.7s48 106.7 106.7 106.7 106.7-48 106.7-106.7-48-106.7-106.7-106.7z" fill="#999"/>
              </svg>
              ${talk.views || 0}
            </span>
            <span class="talk-comment-btn" data-talk-id="${talkId}" data-talk-text="${encodeURIComponent(talk.text || "")}">
              <svg viewBox="0 0 1024 1024" width="14" height="14">
                <path d="M512 64C264.6 64 64 265.4 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zM512 880c-203.3 0-368-164.7-368-368s164.7-368 368-368 368 164.7 368 368-164.7 368-368 368z" fill="#999"/>
                <path d="M672 560H352c-17.7 0-32-14.3-32-32s14.3-32 32-32h320c17.7 0 32 14.3 32 32s-14.3 32-32 32z" fill="#999"/>
              </svg>
              评论
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 瀑布流布局
   * @param {HTMLElement} container - 容器元素
   */
  function waterfall(container) {
    if (!container) return;

    const items = Array.from(container.querySelectorAll(".talk-item"));
    if (items.length === 0) return;

    // 重置样式
    items.forEach((item) => {
      item.style.position = "";
      item.style.top = "";
      item.style.left = "";
      item.style.width = "";
    });

    const containerWidth = container.offsetWidth;
    const columnCount = containerWidth >= 768 ? 2 : 1;
    const columnWidth = (containerWidth - (columnCount - 1) * 16) / columnCount;
    const columnHeights = new Array(columnCount).fill(0);

    items.forEach((item, index) => {
      item.style.width = columnWidth + "px";

      // 找到最矮的列
      let minHeight = Infinity;
      let minIndex = 0;
      for (let i = 0; i < columnCount; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          minIndex = i;
        }
      }

      // 设置位置
      item.style.position = "relative";
      item.style.top = "0";
      item.style.left = minIndex * (columnWidth + 16) + "px";

      // 更新列高
      columnHeights[minIndex] += item.offsetHeight + 16;
    });

    // 设置容器高度
    container.style.height = Math.max(...columnHeights) + "px";
  }

  /**
   * 渲染说说列表
   * @param {Array} talks - 说说数据数组
   */
  function renderTalks(talks) {
    cleanup();

    const talkContainer = document.querySelector("#talk");
    if (!talkContainer) return;

    talkContainer.innerHTML = "";

    if (!talks || talks.length === 0) {
      talkContainer.innerHTML = '<div class="talk-empty">暂无说说</div>';
      return;
    }

    // 渲染每条说说
    talks.forEach((talk) => {
      talkContainer.innerHTML += renderTalkItem(talk);
    });

    // 应用瀑布流布局
    waterfall(talkContainer);

    // 窗口大小改变时重新计算布局
    state.resizeHandler = () => {
      if (state.afterRenderTimer) clearTimeout(state.afterRenderTimer);
      state.afterRenderTimer = setTimeout(() => {
        waterfall(talkContainer);
      }, 300);
    };
    window.addEventListener("resize", state.resizeHandler);

    // 绑定评论按钮点击事件
    bindCommentButtons();
  }

  /**
   * 绑定评论按钮点击事件
   */
  function bindCommentButtons() {
    const buttons = document.querySelectorAll(".talk-comment-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const talkId = this.getAttribute("data-talk-id");
        const talkText = decodeURIComponent(
          this.getAttribute("data-talk-text") || "",
        );
        scrollToComment(talkId, talkText);
      });
    });
  }

  /**
   * 加载说说数据
   */
  async function loadTalks() {
    const talkContainer = document.querySelector("#talk");
    if (!talkContainer) return;

    // 显示加载状态
    talkContainer.innerHTML = '<div class="talk-loading">加载中...</div>';

    try {
      // 从 API 加载最新数据
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) {
        throw new Error("网络响应失败");
      }

      const data = await response.json();

      // 渲染数据
      renderTalks(data.ChannelMessageData || []);
      console.log("从 API 加载说说数据");
    } catch (error) {
      console.error("加载说说失败:", error);
      talkContainer.innerHTML =
        '<div class="talk-error">加载失败，请稍后重试</div>';
    }
  }

  /**
   * 图片查看器
   * @param {HTMLElement} img - 图片元素
   */
  window.viewImage = function (img) {
    const overlay = document.createElement("div");
    overlay.className = "talk-image-overlay";
    overlay.innerHTML = `<img src="${img.src}" alt="full image">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  };

  /**
   * 滚动到评论区并引用说说内容
   * @param {string} talkId - 说说 ID
   * @param {string} talkText - 说说内容
   */
  window.scrollToComment = function (talkId, talkText) {
    // 检查是否启用了 Twikoo 评论
    const twikooContainer =
      document.querySelector("#twikoo") || document.querySelector(".twikoo");
    const commentSection =
      document.querySelector("#comments") ||
      document.querySelector(".comments");

    if (twikooContainer) {
      // 如果启用了 Twikoo，滚动到评论区并引用内容
      twikooContainer.scrollIntoView({ behavior: "smooth", block: "start" });

      // 等待 Twikoo 加载完成后引用内容
      setTimeout(() => {
        // 尝试找到 Twikoo 的输入框
        const inputBox =
          twikooContainer.querySelector("textarea") ||
          twikooContainer.querySelector(".el-textarea__inner");
        if (inputBox) {
          // 设置引用内容
          const quoteText = `> 引用说说：${talkText.substring(0, 100)}${talkText.length > 100 ? "..." : ""}\n\n`;
          inputBox.value = quoteText + inputBox.value;
          inputBox.focus();

          // 触发输入事件
          const event = new Event("input", { bubbles: true });
          inputBox.dispatchEvent(event);
        }
      }, 1000);
    } else if (commentSection) {
      // 如果没有 Twikoo，滚动到通用评论区
      commentSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // 如果没有评论区，提示用户
      alert("评论区未启用");
    }
  };

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTalks);
  } else {
    loadTalks();
  }
})();
