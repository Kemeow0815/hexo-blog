---
title: Hexo Stellar 主题明暗模式切换功能实现指南
tags:
  - Hexo
  - Stellar
  - 主题开发
  - JavaScript
categories: 技术教程
description: 详细介绍如何在 Hexo Stellar 博客主题中实现明暗模式切换功能，包含完整的代码实现和配置说明。
abbrlink: 59445
date: 2026-04-25 15:30:00
---

# Hexo Stellar 主题明暗模式切换功能实现指南

## 功能概述

本文介绍如何在 Hexo Stellar 博客主题中实现一个优雅的主题切换功能，通过导航栏的三个按钮（月亮、太阳、AI 图标）来快速切换**深色模式**、**浅色模式**和**跟随系统模式**，切换时会显示一个 3 秒后自动消失的弹窗提示。

## 效果展示

- 🌙 **点击月亮图标**：切换到深色模式，显示提示"切换到深色模式"
- ☀️ **点击太阳图标**：切换到浅色模式，显示提示"切换到浅色模式"
- 🤖 **点击 AI 图标**：切换到跟随系统模式，显示提示"跟随系统"

## 实现原理

### 1. Stellar 主题的主题机制

Stellar 主题使用 `data-theme` 属性来控制明暗模式：

```stylus
// 浅色模式
:root[data-theme="light"]
  dynamic-theme-light()

// 深色模式
:root[data-theme="dark"]
  dynamic-theme-dark()

// 跟随系统（不设置 data-theme 属性）
:root
  dynamic-theme-light()
  @media (prefers-color-scheme: dark)
    dynamic-theme-dark()
```

主题会自动适配所有组件，包括：
- 导航栏和侧边栏
- 文章内容和代码块
- 评论系统（Giscus、Artalk 等）
- 标签插件（投票、聊天框等）
- 搜索功能

### 2. 核心实现代码

在 `themes/stellar/layout/_partial/scripts/theme.ejs` 中添加以下功能：

#### 2.1 切换到指定主题的函数

```javascript
// 切换到指定主题模式
const switchToTheme = (theme, message) => {
  applyTheme(theme)
  window.localStorage.setItem('Stellar.theme', theme)
  utils.dark.mode = theme === 'auto' 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
    : theme;
  utils.dark.method.toggle.start();
  hud?.toast?.(message)
}
```

**功能说明：**
- `applyTheme(theme)`：应用主题到页面
- `localStorage`：保存用户偏好，下次访问时自动应用
- `utils.dark.mode`：更新内部状态
- `hud.toast(message)`：显示提示消息（3 秒后自动消失）

#### 2.2 绑定主题切换按钮

```javascript
// 绑定三个主题切换按钮
const bindThemeButtons = () => {
  const moonBtn = document.getElementById('ThemeM')
  const sunBtn = document.getElementById('ThemeL')
  const aiBtn = document.getElementById('ThemeAI')

  if (moonBtn) {
    moonBtn.closest('a')?.addEventListener('click', (e) => {
      e.preventDefault()
      switchToTheme('dark', '切换到深色模式')
    })
  }

  if (sunBtn) {
    sunBtn.closest('a')?.addEventListener('click', (e) => {
      e.preventDefault()
      switchToTheme('light', '切换到浅色模式')
    })
  }

  if (aiBtn) {
    aiBtn.closest('a')?.addEventListener('click', (e) => {
      e.preventDefault()
      switchToTheme('auto', '跟随系统')
    })
  }
}
```

**功能说明：**
- 通过按钮中的图片 ID 查找对应元素
- 使用 `closest('a')` 找到外层链接并绑定点击事件
- `e.preventDefault()` 阻止默认跳转行为
- 调用 `switchToTheme` 切换主题并显示提示

#### 2.3 初始化和 PJAX 支持

```javascript
(() => {
  // 应用用户保存的主题偏好
  const theme = window.localStorage.getItem('Stellar.theme')
  if (theme !== null) {
    applyTheme(theme)
  } else {
    utils.dark.mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  utils.dark.method.toggle.start();
  
  // 绑定主题切换按钮
  bindThemeButtons()
})()

// PJAX 后重新绑定按钮（Stellar 使用 PJAX 实现无刷新导航）
document.addEventListener('pjax:complete', bindThemeButtons)
```

## 配置说明

### 1. 在 `_config.stellar.yml` 中配置导航栏按钮

```yaml
nav:
  left:
    # 其他导航项...
    Moon:
      icon: '<img id="ThemeM" src="https://upyun.thatcdn.cn/public/img/icon/Moon.png"/>'
      url: javaScript:void('永夜');
    Sun:
      icon: '<img id="ThemeL" src="https://upyun.thatcdn.cn/public/img/icon/Sun.png"/>'
      url: javaScript:void('永昼');
    AI:
      icon: '<img id="ThemeAI" src="https://upyun.thatcdn.cn/public/img/icon/AI.png"/>'
      url: javaScript:void('跟随系统');
```

**关键点：**
- `id="ThemeM"`：月亮按钮（深色模式）
- `id="ThemeL"`：太阳按钮（浅色模式）
- `id="ThemeAI"`：AI 按钮（跟随系统）
- `url: javaScript:void('...')`：阻止默认跳转

### 2. 主题偏好设置

```yaml
style:
  prefers_theme: auto # auto / light / dark
  smooth_scroll: true
```

- `auto`：跟随系统
- `light`：强制浅色
- `dark`：强制深色

## 技术细节

### 1. Toast 提示实现

Stellar 主题内置了 `hud.toast` 函数：

```javascript
const hud = {
  toast: (msg, duration) => {
    const d = Number(isNaN(duration) ? 2000 : duration);
    var el = document.createElement('div');
    el.classList.add('toast');
    el.classList.add('show');
    el.innerHTML = msg;
    document.body.appendChild(el);

    setTimeout(function () { document.body.removeChild(el) }, d);
  }
}
```

**特点：**
- 默认显示 2 秒（可自定义）
- 自动添加和移除 DOM 元素
- CSS 动画控制显示/隐藏效果

### 2. 主题状态管理

```javascript
utils.dark = {
  mode: 'light', // 当前模式
  method: {
    toggle: new RunItem() // 切换时的回调队列
  },
  push: (fn) => utils.dark.method.toggle.push(fn) // 添加回调
}
```

切换主题时会自动触发所有注册的回调函数，用于更新组件状态。

### 3. 本地存储

使用 `localStorage` 保存用户偏好：

```javascript
window.localStorage.setItem('Stellar.theme', theme)
const theme = window.localStorage.getItem('Stellar.theme')
```

**优势：**
- 持久化存储，刷新页面不丢失
- 每个域名独立存储
- 容量 5MB，足够存储配置

## 自定义提示消息

如果想修改提示消息的内容或显示时长，可以修改 `switchToTheme` 函数：

```javascript
const switchToTheme = (theme, message, duration = 3000) => {
  // ... 其他代码
  hud?.toast?.(message, duration) // 自定义显示时长
}
```

或者自定义 Toast 样式：

```css
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  transition: opacity 0.3s;
}

.toast.show {
  opacity: 1;
}
```

## 扩展功能

### 1. 添加更多主题模式

可以扩展为支持更多模式（如护眼模式、阅读模式等）：

```javascript
const switchToTheme = (theme, message) => {
  if (theme === 'eye-protect') {
    document.documentElement.setAttribute('data-theme', 'eye-protect')
    // 添加特定样式
  }
  // ...
}
```

### 2. 同步到后端

如果需要跨设备同步主题偏好：

```javascript
const switchToTheme = (theme, message) => {
  // ... 应用主题
  
  // 同步到后端
  fetch('/api/user/preferences', {
    method: 'POST',
    body: JSON.stringify({ theme })
  })
}
```

### 3. 快捷键支持

添加键盘快捷键快速切换：

```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 't') {
    // Ctrl+T 切换主题
    switchTheme()
  }
})
```

## 总结

通过以上实现，我们为 Hexo Stellar 博客主题添加了一个功能完善、用户体验良好的主题切换功能：

✅ **三个独立按钮**：分别控制深色、浅色、跟随系统  
✅ **即时反馈**：切换时显示 Toast 提示  
✅ **持久化**：记住用户偏好  
✅ **完整适配**：所有组件自动适配明暗主题  
✅ **PJAX 支持**：无刷新导航后功能正常  

这个功能不仅提升了用户体验，也展示了 Stellar 主题强大的可扩展性。你可以根据自己的需求进一步定制和扩展这个功能。

## 参考资料

- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [Stellar GitHub 仓库](https://github.com/xaoxuu/hexo-theme-stellar)
- [Hexo 官方文档](https://hexo.io/zh-cn/)

---

**作者**: [你的名字]  
**发布日期**: 2026-04-25  
**本文链接**: /2026/04/25/theme-switch-guide/
