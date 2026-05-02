---
title: Hexo Stellar 添加 Toast Notification 通知悬浮窗
description: 为 Hexo Stellar 主题添加轻量级通知悬浮窗组件，支持成功、错误、警告、信息等多种类型。
categories: 
- 技术教程
tags: 
- Hexo
- Stellar
- 通知
cover: "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/hexo-toast-confirm.webp"
swiper_index: 9
swiper_cover: "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/hexo-toast-confirm.webp"
swiper_desc: 为 Hexo Stellar 主题添加轻量级通知悬浮窗组件，支持成功、错误、警告、信息等多种类型。
abbrlink: 794688f8
date: "2026-04-29 15:00:00"
ai_summary: 文章介绍了如何为Hexo Stellar主题添加Toast Notification组件，使页面上显示优雅的通知消息。该组件支持多种类型（成功、错误、警告、信息），自动消失，并具有进度条显示和动画效果。此外，还支持自定义位置、按钮和关闭回调等特性。
---
## 前言

为博客添加了 Toast Notification 通知悬浮窗组件，可以在页面上显示优雅的通知消息。本文将详细介绍实现过程。

## 效果预览

- **多种类型**：成功、错误、警告、信息
- **自动消失**：默认 5 秒后自动关闭
- **进度条显示**：直观显示剩余时间
- **动画效果**：平滑的滑入滑出动画
- **明暗模式**：自动适配深色/浅色主题
- **PJAX 兼容**：页面切换时自动关闭

## 实现步骤

### 1. 创建样式文件

创建样式文件：

```
source/css/toast-notification.styl
```

```stylus
// Toast Notification 通知悬浮窗样式

// 通知容器
#toast-container
  position: fixed
  top: 20px
  right: 20px
  z-index: 9999
  display: flex
  flex-direction: column
  gap: 12px
  pointer-events: none

// 通知项
.toast-item
  display: flex
  align-items: center
  gap: 12px
  padding: 14px 18px
  min-width: 280px
  max-width: 400px
  background: var(--card)
  border-radius: $border-card
  box-shadow: $boxshadow-card-float
  pointer-events: auto
  transform: translateX(120%)
  opacity: 0
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)
  border-left: 4px solid transparent
  
  &.show
    transform: translateX(0)
    opacity: 1

// 类型样式
.toast-item
  &.toast-success
    border-left-color: #10b981
    .toast-icon
      background: rgba(16, 185, 129, 0.1)
      color: #10b981
  
  &.toast-error
    border-left-color: #ef4444
    .toast-icon
      background: rgba(239, 68, 68, 0.1)
      color: #ef4444
  
  &.toast-warning
    border-left-color: #f59e0b
    .toast-icon
      background: rgba(245, 158, 11, 0.1)
      color: #f59e0b
  
  &.toast-info
    border-left-color: #3b82f6
    .toast-icon
      background: rgba(59, 130, 246, 0.1)
      color: #3b82f6
```

### 2. 创建交互脚本

创建脚本文件：

```
source/js/toast-notification.js
```

```javascript
(function () {
  "use strict";

  const CONFIG = {
    duration: 5000,
    maxCount: 5,
  };

  const ICONS = {
    success: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  };

  let toastContainer = null;
  const activeToasts = new Map();

  function getContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function show(options) {
    const config = {
      type: "info",
      title: "",
      message: "",
      duration: CONFIG.duration,
      ...options,
    };

    // 创建通知元素...
    // 详细代码见完整文件
  }

  // 快捷方法
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
    success,
    error,
    warning,
    info,
  };
})();
```

### 3. 全局加载资源

在 `_config.stellar.yml` 中添加：

```yaml
inject:
  head:
    - '<link rel="stylesheet" href="/css/toast-notification.css" type="text/css">'
  script:
    - '<script defer src="/js/toast-notification.js"></script>'
```

## 在线演示

点击下面的按钮查看通知效果：

### 基础类型

<div class="toast-demo" style="margin: 20px 0; padding: 20px; background: var(--block); border-radius: 12px; text-align: center;">
  <button onclick="Toast.success('操作成功！', '成功')" style="margin: 8px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">成功通知</button>
  <button onclick="Toast.error('操作失败，请重试。', '错误')" style="margin: 8px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">错误通知</button>
  <button onclick="Toast.warning('请注意，此操作不可撤销。', '警告')" style="margin: 8px; padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">警告通知</button>
  <button onclick="Toast.info('这是一条提示信息。', '信息')" style="margin: 8px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">信息通知</button>
  <button onclick="Toast.closeAll()" style="margin: 8px; padding: 10px 20px; background: var(--text-p3); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">关闭所有</button>
</div>

### 自定义位置

<div class="toast-demo" style="margin: 20px 0; padding: 20px; background: var(--block); border-radius: 12px; text-align: center;">
  <button onclick="Toast.info('左上角通知', '位置演示', {position: 'top-left'})" style="margin: 8px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">左上角</button>
  <button onclick="Toast.info('右上角通知', '位置演示', {position: 'top-right'})" style="margin: 8px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">右上角</button>
  <button onclick="Toast.info('左下角通知', '位置演示', {position: 'bottom-left'})" style="margin: 8px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">左下角</button>
  <button onclick="Toast.info('右下角通知', '位置演示', {position: 'bottom-right'})" style="margin: 8px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">右下角</button>
</div>

### 自定义按钮

<div class="toast-demo" style="margin: 20px 0; padding: 20px; background: var(--block); border-radius: 12px; text-align: center;">
  <button onclick="Toast.show({type: 'info', title: '发现新版本', message: '是否立即更新到最新版本？', button: {text: '立即更新', onclick: function() { Toast.success('开始更新...', '更新'); }}})" style="margin: 8px; padding: 10px 20px; background: #06b6d4; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">带按钮的通知</button>
</div>

## 使用方法

### 基础用法

```javascript
// 显示成功通知
Toast.success('操作成功！');

// 显示错误通知
Toast.error('操作失败，请重试。');

// 显示警告通知
Toast.warning('请注意，此操作不可撤销。');

// 显示信息通知
Toast.info('这是一条提示信息。');
```

### 带标题的通知

```javascript
Toast.success('文章发布成功！', '发布成功', {
  duration: 3000  // 3秒后自动关闭
});
```

### 完整配置

```javascript
Toast.show({
  type: 'success',      // 类型：success, error, warning, info
  title: '标题',        // 标题（可选）
  message: '消息内容',   // 消息内容
  duration: 5000        // 显示时长（毫秒），0 表示不自动关闭
});
```

### 关闭所有通知

```javascript
Toast.closeAll();
```

### 自定义位置

支持四个位置显示：

```javascript
// 左上角
Toast.info('左上角通知', '提示', {
  position: 'top-left'
});

// 右上角（默认）
Toast.info('右上角通知', '提示', {
  position: 'top-right'
});

// 左下角
Toast.info('左下角通知', '提示', {
  position: 'bottom-left'
});

// 右下角
Toast.info('右下角通知', '提示', {
  position: 'bottom-right'
});
```

### 自定义按钮

```javascript
Toast.show({
  type: 'info',
  title: '发现新版本',
  message: '是否立即更新？',
  button: {
    text: '立即更新',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 12h16"/></svg>',
    onclick: function() {
      console.log('用户点击了更新按钮');
      // 执行更新操作
    }
  }
});
```

### 关闭回调

```javascript
const toast = Toast.success('操作成功！', '成功', {
  duration: 3000
});

// 监听关闭事件
toast.onClose = function() {
  console.log('通知已关闭');
};

// 手动关闭
toast.close();
```

### 鼠标悬停暂停

当鼠标悬停在通知上时，自动关闭计时器会暂停，移开后继续计时：

```javascript
Toast.info('这条通知会在鼠标悬停时暂停计时', '提示', {
  duration: 10000  // 10秒
});
```

## 适配特性

- **明暗模式**：自动适配深色/浅色主题
- **多端响应**：桌面端右上角显示，移动端全宽顶部显示
- **PJAX 兼容**：页面切换时自动关闭所有通知
- **最大数量限制**：最多同时显示 5 条通知

## 总结

通过自定义 Toast Notification 组件，我们为 Hexo Stellar 主题添加了优雅的通知功能。这个实现不依赖第三方库，轻量且易于定制。
