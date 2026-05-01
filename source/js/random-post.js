// 随机文章跳转功能 - 适配 PJAX
// 文章列表将在页面加载时动态获取

(function () {
  "use strict";

  // 文章列表缓存
  var postsCache = null;

  // 获取所有文章路径
  function fetchPosts() {
    // 如果已经有缓存，直接返回
    if (postsCache) {
      return Promise.resolve(postsCache);
    }

    // 尝试从页面数据中获取文章列表
    // 方法1: 从 Hexo 生成的 search.json 获取
    return fetch("/search.json")
      .then(function (response) {
        if (!response.ok) throw new Error("search.json not found");
        return response.json();
      })
      .then(function (data) {
        postsCache = data
          .map(function (item) {
            return item.path || item.url;
          })
          .filter(function (path) {
            return (
              path &&
              !path.includes("/page/") &&
              !path.includes("/categories/") &&
              !path.includes("/tags/") &&
              !path.includes("/archives/")
            );
          });
        return postsCache;
      })
      .catch(function () {
        // 方法2: 如果 search.json 不存在，尝试从 sitemap 获取
        return fetch("/sitemap.xml")
          .then(function (response) {
            if (!response.ok) throw new Error("sitemap.xml not found");
            return response.text();
          })
          .then(function (str) {
            var parser = new window.DOMParser();
            var data = parser.parseFromString(str, "text/xml");
            var locs = data.querySelectorAll("url loc");
            postsCache = [];
            locs.forEach(function (loc) {
              var url = loc.innerHTML;
              var path = url.replace(window.location.origin, "");
              // 只保留文章链接（排除页面、分类等）
              if (
                path &&
                path.match(/^\/\d{4}\//) &&
                !path.includes("/page/")
              ) {
                postsCache.push(path.replace(/^\//, ""));
              }
            });
            return postsCache;
          });
      })
      .catch(function () {
        // 方法3: 从页面中收集文章链接
        var links = document.querySelectorAll('a[href^="/"]');
        postsCache = [];
        links.forEach(function (link) {
          var href = link.getAttribute("href");
          if (
            href &&
            href.match(/^\/\d{4}\//) &&
            !postsCache.includes(href.replace(/^\//, ""))
          ) {
            postsCache.push(href.replace(/^\//, ""));
          }
        });
        return postsCache;
      });
  }

  // 防止重复点击的标记
  var isNavigating = false;
  var lastClickTime = 0;
  var CLICK_DELAY = 1000; // 1秒内防止重复点击

  // 随机跳转函数
  function toRandomPost() {
    // 检查是否正在导航中
    if (isNavigating) {
      console.log("[Random Post] Navigation in progress, please wait...");
      return;
    }

    // 检查点击间隔
    var now = Date.now();
    if (now - lastClickTime < CLICK_DELAY) {
      console.log("[Random Post] Click too fast, please wait...");
      return;
    }
    lastClickTime = now;

    fetchPosts()
      .then(function (posts) {
        if (posts.length === 0) {
          console.warn("[Random Post] No posts available");
          // 显示提示
          if (typeof showToast === "function") {
            showToast("暂无文章可跳转", "warning");
          }
          return;
        }

        // 随机选择一篇文章
        var randomIndex = Math.floor(Math.random() * posts.length);
        var targetUrl = "/" + posts[randomIndex];

        // 避免跳转到当前页面
        var currentPath = window.location.pathname;
        var attempts = 0;
        while (
          (currentPath === targetUrl || currentPath === targetUrl + "/") &&
          attempts < 10
        ) {
          randomIndex = Math.floor(Math.random() * posts.length);
          targetUrl = "/" + posts[randomIndex];
          attempts++;
        }

        console.log("[Random Post] Jumping to:", targetUrl);

        // 标记正在导航中
        isNavigating = true;

        // 取消所有正在进行的 fetch 请求（防止 ERR_ABORTED）
        if (
          window.stellar &&
          window.stellar.pjax &&
          window.stellar.pjax.abortController
        ) {
          try {
            window.stellar.pjax.abortController.abort();
          } catch (e) {
            // 忽略取消错误
          }
        }

        // 使用 PJAX 加载（如果可用）
        try {
          if (
            window.stellar &&
            window.stellar.pjax &&
            typeof window.stellar.pjax.navigate === "function"
          ) {
            console.log("[Random Post] Using Stellar PJAX");
            window.stellar.pjax.navigate(targetUrl);
            // PJAX 导航是异步的，不需要重置 isNavigating
            // 页面切换后会重新加载脚本
          } else {
            // 普通跳转
            console.log("[Random Post] Using regular navigation");
            window.location.href = targetUrl;
          }
        } catch (err) {
          // 忽略 PJAX 错误（如 ERR_ABORTED），因为页面会正常跳转
          if (err.message && err.message.includes("Failed to fetch")) {
            console.log(
              "[Random Post] PJAX fetch error (ignored), page will navigate normally",
            );
          } else {
            console.error("[Random Post] Navigation error:", err);
          }
          isNavigating = false;
        }
      })
      .catch(function (error) {
        console.error("[Random Post] Error:", error);
        if (typeof showToast === "function") {
          showToast("随机跳转失败，请稍后重试", "error");
        }
      });
  }

  // 点击事件处理函数
  function handleRandomClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("[Random Post] Button clicked");
    toRandomPost();
  }

  // 暴露到全局
  window.toRandomPost = toRandomPost;

  // 绑定随机跳转按钮
  function bindRandomPostButtons() {
    var buttons = document.querySelectorAll(
      '[data-random-post], a[href*="toRandomPost"]',
    );
    console.log("[Random Post] Found buttons:", buttons.length);

    buttons.forEach(function (btn) {
      // 移除旧的事件监听器（如果有）
      btn.removeEventListener("click", handleRandomClick);
      // 添加新的事件监听器
      btn.addEventListener("click", handleRandomClick);
      console.log("[Random Post] Bound to button:", btn);
    });
  }

  // 监听 PJAX 完成事件，重新绑定点击事件
  document.addEventListener("pjax:complete", function () {
    console.log("[Random Post] PJAX complete, rebinding buttons");
    bindRandomPostButtons();
  });

  document.addEventListener("pjax:end", function () {
    bindRandomPostButtons();
  });

  // 初始化绑定
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindRandomPostButtons);
  } else {
    bindRandomPostButtons();
  }

  console.log("[Random Post] Initialized");
})();
