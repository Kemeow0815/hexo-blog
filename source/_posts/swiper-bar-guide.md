---
title: Hexo Stellar 添加 Swiper Bar 轮播组件
description: 为 Hexo Stellar 主题添加文章轮播组件，支持置顶文章展示、自动轮播、触摸滑动等功能。
categories:
  - 技术教程
tags:
  - Hexo
  - Stellar
  - 轮播
  - Swiper
cover: 'https://p.268682.xyz/pic?img=ua'
swiper_index: 10
swiper_cover: 'https://p.268682.xyz/pic?img=ua'
swiper_desc: 为 Hexo Stellar 主题添加文章轮播组件，支持置顶文章展示、自动轮播、触摸滑动等功能。
abbrlink: 6973b1b8
date: 2026-04-29 14:30:00
---

## 前言

最近为博客添加了 Swiper Bar 轮播组件，可以在首页顶部展示置顶文章或最新文章。本文将详细介绍实现过程。

## 效果预览

- **自动轮播**：5 秒自动切换
- **置顶文章**：支持设置置顶文章优先展示
- **触摸滑动**：移动端支持手势滑动
- **明暗模式**：自动适配深色/浅色主题
- **PJAX 兼容**：导航后自动重新初始化

## 实现步骤

### 1. 创建样式文件

创建样式文件：

```
source/css/swiper-bar.styl
```

```stylus
// Swiper Bar 轮播组件样式 - 适配 Stellar 主题

// 轮播容器
.swiper-bar-container
  width: 100%
  margin: 1rem 0
  border-radius: $border-card-l
  overflow: hidden
  background: var(--card)
  box-shadow: $boxshadow-card
  hoverable-card()
  z-index: 0

// Swiper 主体
.blog-slider
  width: 100%
  position: relative
  border-radius: $border-card
  overflow: hidden

// 轮播项
.blog-slider__item
  display: flex
  align-items: center
  padding: 20px
  gap: 20px
  background: var(--block)
  
  @media screen and (max-width: 768px)
    flex-direction: column
    padding: 16px
    gap: 16px

// 图片区域
.blog-slider__img
  width: 280px
  height: 180px
  flex-shrink: 0
  border-radius: $border-card-s
  overflow: hidden
  position: relative
  
  img
    width: 100%
    height: 100%
    object-fit: cover
    transition: transform 0.3s ease
  
  &:hover img
    transform: scale(1.05)
  
  @media screen and (max-width: 768px)
    width: 100%
    height: 200px
  
  @media screen and (max-width: 480px)
    height: 160px
```

### 2. 创建交互脚本

创建脚本文件：

```
source/js/swiper-bar.js
```

```javascript
(function () {
  "use strict";

  const CONFIG = {
    selector: ".blog-slider",
    autoplayDelay: 5000,
  };

  let swiperInstance = null;

  function initSwiper() {
    const container = document.querySelector(CONFIG.selector);
    if (!container) return;

    if (swiperInstance) {
      swiperInstance.destroy();
      swiperInstance = null;
    }

    const slides = container.querySelectorAll(".blog-slider__item");
    if (slides.length === 0) return;

    let currentIndex = 0;
    let autoplayTimer = null;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove("swiper-slide-active");
        slide.style.display = "none";
        if (i === index) {
          slide.classList.add("swiper-slide-active");
          slide.style.display = "flex";
        }
      });
      updatePagination(index);
      currentIndex = index;
    }

    function updatePagination(activeIndex) {
      const bullets = container.querySelectorAll(".swiper-pagination-bullet");
      bullets.forEach((bullet, i) => {
        bullet.classList.toggle("swiper-pagination-bullet-active", i === activeIndex);
      });
    }

    function nextSlide() {
      const next = (currentIndex + 1) % slides.length;
      showSlide(next);
    }

    function prevSlide() {
      const prev = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(prev);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, CONFIG.autoplayDelay);
    }

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

    // 鼠标悬停时暂停
    container.addEventListener("mouseenter", stopAutoplay);
    container.addEventListener("mouseleave", startAutoplay);

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoplay();
    }, { passive: true });

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

    showSlide(0);
    startAutoplay();

    swiperInstance = {
      destroy: function () {
        stopAutoplay();
        container.removeEventListener("mouseenter", stopAutoplay);
        container.removeEventListener("mouseleave", startAutoplay);
      },
    };
  }

  function handlePjaxComplete() {
    setTimeout(initSwiper, 100);
  }

  function init() {
    initSwiper();
    document.addEventListener("pjax:complete", handlePjaxComplete);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

### 3. 创建 EJS 模板

创建模板文件：

```
themes/stellar/layout/_partial/main/post_list/swiper_bar.ejs
```

```ejs
<%
// 获取置顶文章
let swiperPosts = [];
site.posts.forEach(function(post) {
  if (post.swiper_index !== undefined) {
    swiperPosts.push(post);
  }
});

// 按 swiper_index 排序
swiperPosts.sort(function(a, b) {
  return (b.swiper_index || 0) - (a.swiper_index || 0);
});

// 最多显示 5 篇
swiperPosts = swiperPosts.slice(0, 5);

// 如果没有置顶文章，显示最新的 3 篇
if (swiperPosts.length === 0) {
  site.posts.sort('date', -1).limit(3).forEach(function(post) {
    swiperPosts.push(post);
  });
}

if (swiperPosts.length === 0) return '';
%>

<div class="swiper-bar-container">
  <div class="blog-slider">
    <% swiperPosts.forEach(function(post, index) { %>
    <div class="blog-slider__item" style="<%= index === 0 ? '' : 'display: none;' %>">
      <div class="blog-slider__img">
        <% 
        let coverUrl = '';
        if (post.swiper_cover) {
          coverUrl = post.swiper_cover;
        } else if (post.cover) {
          coverUrl = post.cover;
        } else if (post.poster && post.poster.image) {
          coverUrl = post.poster.image;
        } else {
          coverUrl = 'https://p.268682.xyz/pic?img=ua';
        }
        %>
        <img src="<%= coverUrl %>" alt="<%= post.title %>">
        
        <% if (post.swiper_index !== undefined) { %>
        <div class="blog-slider__pin">
          <svg viewBox="0 0 24 24"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
          置顶
        </div>
        <% } %>
      </div>
      
      <div class="blog-slider__content">
        <h3 class="blog-slider__title">
          <a href="<%= url_for(post.path) %>"><%= post.title %></a>
        </h3>
        
        <div class="blog-slider__desc">
          <% if (post.swiper_desc) { %>
            <%= post.swiper_desc %>
          <% } else if (post.description) { %>
            <%= post.description %>
          <% } else if (post.excerpt) { %>
            <%= strip_html(post.excerpt).substring(0, 120) %>...
          <% } else { %>
            <%= strip_html(post.content).substring(0, 120) %>...
          <% } %>
        </div>
        
        <div class="blog-slider__meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"/></svg>
            <%= date(post.date, config.date_format) %>
          </span>
          
          <% if (post.categories && post.categories.length > 0) { %>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7L12 12L22 7L12 2Z"/></svg>
            <% post.categories.forEach(function(cat, i) { %>
              <%= i > 0 ? ' / ' : '' %><%= cat.name %>
            <% }); %>
          </span>
          <% } %>
        </div>
      </div>
    </div>
    <% }); %>
    
    <button class="blog-slider__button blog-slider__button--prev">
      <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"/></svg>
    </button>
    <button class="blog-slider__button blog-slider__button--next">
      <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"/></svg>
    </button>
    
    <div class="blog-slider__pagination">
      <% swiperPosts.forEach(function(post, index) { %>
        <div class="swiper-pagination-bullet <%= index === 0 ? 'swiper-pagination-bullet-active' : '' %>"></div>
      <% }); %>
    </div>
  </div>
</div>
```

### 4. 修改首页布局

编辑 `themes/stellar/layout/index.ejs`，在文章列表前添加：

```ejs
<%- partial('_partial/main/navbar/nav_tabs_blog') %>
<%- partial('_partial/main/post_list/swiper_bar') %>
<%- layout_post_list(function(post){
  return partial('_partial/main/post_list/post_card', {post: post})
}) %>
```

### 5. 全局加载资源

在 `_config.stellar.yml` 中添加：

```yaml
inject:
  head:
    - '<link rel="stylesheet" href="/blog/css/swiper-bar.css" type="text/css">'
  script:
    - '<script defer src="/blog/js/swiper-bar.js"></script>'
```

## 使用方法

### 置顶文章

在文章的 Front-matter 中添加：

```yaml
swiper_index: 10      # 数字越大越靠前
swiper_cover: /images/cover.jpg  # 轮播封面图
swiper_desc: 文章简介描述       # 轮播描述
```

### 自动 fallback

如果没有设置置顶文章，会自动显示最新的 3 篇文章。

## 适配特性

- **明暗模式**：自动适配深色/浅色主题
- **多端响应**：桌面端左右布局，移动端上下布局
- **PJAX 兼容**：导航后自动重新初始化
- **默认封面**：无封面文章使用默认图片

## 总结

通过自定义 Swiper Bar 组件，我们为 Hexo Stellar 主题添加了文章轮播功能。这个实现不依赖第三方库，轻量且易于定制。
