/**
 * Swiper Bar - 文章轮播组件
 * 适配 Hexo Stellar 主题
 */

(function () {
  "use strict";

  // 配置
  const CONFIG = {
    selector: ".blog-slider",
    autoplayDelay: 5000,
    slidePerView: 1,
    spaceBetween: 20,
  };

  let swiperInstance = null;

  /**
   * 初始化 Swiper 轮播
   */
  function initSwiper() {
    const container = document.querySelector(CONFIG.selector);
    if (!container) {
      return;
    }

    // 如果已经初始化，先销毁
    if (swiperInstance) {
      swiperInstance.destroy();
      swiperInstance = null;
    }

    // 获取所有轮播项
    const slides = container.querySelectorAll(".blog-slider__item");
    if (slides.length === 0) {
      return;
    }

    let currentIndex = 0;
    let autoplayTimer = null;

    // 显示指定索引的幻灯片
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove("swiper-slide-active");
        slide.style.display = "none";
        if (i === index) {
          slide.classList.add("swiper-slide-active");
          slide.style.display = "flex";
        }
      });

      // 更新分页器
      updatePagination(index);
      currentIndex = index;
    }

    // 更新分页器状态
    function updatePagination(activeIndex) {
      const bullets = container.querySelectorAll(".swiper-pagination-bullet");
      bullets.forEach((bullet, i) => {
        bullet.classList.toggle(
          "swiper-pagination-bullet-active",
          i === activeIndex,
        );
      });
    }

    // 下一张
    function nextSlide() {
      const next = (currentIndex + 1) % slides.length;
      showSlide(next);
    }

    // 上一张
    function prevSlide() {
      const prev = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(prev);
    }

    // 开始自动播放
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, CONFIG.autoplayDelay);
    }

    // 停止自动播放
    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // 绑定事件
    const prevBtn = container.querySelector(".blog-slider__button--prev");
    const nextBtn = container.querySelector(".blog-slider__button--next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prevSlide();
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextSlide();
        startAutoplay();
      });
    }

    // 分页器点击事件
    const bullets = container.querySelectorAll(".swiper-pagination-bullet");
    bullets.forEach((bullet, i) => {
      bullet.addEventListener("click", () => {
        showSlide(i);
        startAutoplay();
      });
    });

    // 鼠标悬停时暂停自动播放
    container.addEventListener("mouseenter", stopAutoplay);
    container.addEventListener("mouseleave", startAutoplay);

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      },
      { passive: true },
    );

    container.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
      },
      { passive: true },
    );

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // 初始化显示第一张
    showSlide(0);

    // 开始自动播放
    startAutoplay();

    // 保存实例引用
    swiperInstance = {
      destroy: function () {
        stopAutoplay();
        container.removeEventListener("mouseenter", stopAutoplay);
        container.removeEventListener("mouseleave", startAutoplay);
      },
    };
  }

  /**
   * 处理 PJAX 完成事件
   */
  function handlePjaxComplete() {
    // 延迟初始化，确保 DOM 已更新
    setTimeout(initSwiper, 100);
  }

  /**
   * 初始化
   */
  function init() {
    // 首次加载
    initSwiper();

    // 监听 PJAX 事件
    document.addEventListener("pjax:complete", handlePjaxComplete);
  }

  // 启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
