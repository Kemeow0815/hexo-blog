---
title: Hexo Stellar 添加 TgTalk 说说页面
tags:
  - Hexo
  - Stellar
  - TgTalk
  - 说说
categories: 技术教程
description: 为 Hexo Stellar 主题添加基于 TgTalk 的说说页面，展示 Telegram 频道消息。
abbrlink: 2ad1033e
date: 2026-04-25 20:00:00
---

# Hexo Stellar 添加 TgTalk 说说页面

## 效果预览

创建一个类似「即刻」的说说页面，展示来自 TgTalk 的消息：

- 📱 **实时展示**：从 TgTalk API 获取最新消息
- 🎨 **精美样式**：卡片式设计，支持悬停效果
- 🖼️ **图片展示**：支持图片网格和全屏查看
- ⏱️ **时间显示**：智能时间格式化（刚刚、X 分钟前）
- 📊 **浏览量**：显示每条说说的浏览次数
- 💾 **本地缓存**：30 分钟缓存，提升加载速度

## 实现步骤

### 1. 创建 JavaScript 文件

在 `source/js/` 目录下创建 `talks.js` 文件：

```javascript
/**
 * TgTalk 说说页面展示脚本
 */
(function() {
  const CONFIG = {
    API_URL: 'https://tgtalk.kemeow.top/api/echo/page',
    CACHE_KEY: 'tgTalkCache',
    CACHE_TIME_KEY: 'tgTalkCacheTime',
    CACHE_DURATION: 30 * 60 * 1000,
    AVATAR: 'https://ui-avatars.com/api/?name=TgTalk&background=random',
  };

  // 格式化时间
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 12 * month;
    
    if (diff < minute) return '刚刚';
    else if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    else if (diff < day) return Math.floor(diff / hour) + '小时前';
    else if (diff < month) return Math.floor(diff / day) + '天前';
    else if (diff < year) return Math.floor(diff / month) + '个月前';
    else return Math.floor(diff / year) + '年前';
  }

  // 渲染说说列表
  function renderTalks(talks) {
    const talkContainer = document.querySelector('#talk');
    if (!talkContainer) return;
    
    talkContainer.innerHTML = '';
    
    if (!talks || talks.length === 0) {
      talkContainer.innerHTML = '<div class="talk-empty">暂无说说</div>';
      return;
    }
    
    talks.forEach(talk => {
      talkContainer.innerHTML += renderTalkItem(talk);
    });
  }

  // 加载数据
  async function loadTalks() {
    try {
      const response = await fetch(CONFIG.API_URL);
      const data = await response.json();
      renderTalks(data.ChannelMessageData || []);
    } catch (error) {
      console.error('加载说说失败:', error);
    }
  }

  loadTalks();
})();
```

### 2. 创建说说页面

在 `source/moment/` 目录下编辑 `index.md`：

```markdown
---
menu_id: more
title: 即刻
layout: page
comments: false
---

<div id="talk" class="talk-container"></div>

<script src="/js/talks.js"></script>
```

### 3. 添加 CSS 样式

在 `themes/stellar/source/css/_custom.styl` 中添加：

```stylus
/* 说说页面样式 */
#talk
  max-width: 900px
  margin: 0 auto
  padding: 20px 0

.talk-item
  display: flex
  gap: 16px
  margin-bottom: 24px
  padding: 20px
  background: var(--card)
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
  transition: all 0.3s ease
  
  &:hover
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08)
    transform: translateY(-2px)

.talk-avatar
  img
    width: 48px
    height: 48px
    border-radius: 50%

.talk-header
  display: flex
  justify-content: space-between
  margin-bottom: 12px

.talk-author
  font-weight: 600

.talk-time
  color: var(--text-p4)

.talk-images
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))
  gap: 8px
```

### 4. 重新生成博客

```bash
hexo clean
hexo generate
hexo server
```

## 功能说明

### API 配置

```javascript
const CONFIG = {
  API_URL: 'https://tgtalk.kemeow.top/api/echo/page', // TgTalk API
  CACHE_DURATION: 30 * 60 * 1000, // 缓存 30 分钟
};
```

### 数据结构

TgTalk API 返回的数据格式：

```json
{
  "nextBefore": 0,
  "Region": "HK",
  "version": "2.1.7",
  "ChannelMessageData": [
    {
      "id": "3",
      "text": "换了个号。。。",
      "image": [],
      "time": 1776846917000,
      "views": "1"
    }
  ]
}
```

### 核心功能

#### 1. 时间格式化

```javascript
function formatTime(timestamp) {
  // 根据时间差返回友好格式
  // 刚刚、X 分钟前、X 小时前、X 天前...
}
```

#### 2. 图片处理

```javascript
function processImages(images) {
  // 生成图片网格
  // 支持全屏查看
}
```

#### 3. 本地缓存

```javascript
function loadFromCache() {
  // 从 localStorage 加载缓存
  // 30 分钟有效期
}

function saveToCache(data) {
  // 保存数据到 localStorage
}
```

#### 4. 瀑布流布局

```javascript
function waterfall(container) {
  // 响应式布局
  // 移动端单列，桌面端双列
}
```

## 自定义配置

### 修改 API 地址

```javascript
const CONFIG = {
  API_URL: 'https://your-tgtalk-domain.com/api/echo/page',
};
```

### 修改头像

```javascript
const CONFIG = {
  AVATAR: 'https://your-avatar-url.com/avatar.jpg',
};
```

### 修改缓存时间

```javascript
const CONFIG = {
  CACHE_DURATION: 60 * 60 * 1000, // 1 小时
};
```

### 修改作者名称

在 `renderTalkItem` 函数中修改：

```javascript
<span class="talk-author">你的昵称</span>
```

## 样式定制

### 修改卡片样式

```stylus
.talk-item
  background: var(--card)  // 背景色
  border-radius: 12px       // 圆角
  padding: 20px            // 内边距
```

### 修改图片网格

```stylus
.talk-images
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
  // 调整图片最小宽度
```

### 修改响应式断点

```stylus
@media screen and (max-width: 768px)
  // 修改移动端样式
```

## 高级功能

### 1. 图片全屏查看

点击图片时显示全屏预览：

```javascript
window.viewImage = function(img) {
  const overlay = document.createElement('div');
  overlay.className = 'talk-image-overlay';
  overlay.innerHTML = `<img src="${img.src}">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
};
```

### 2. 链接自动识别

自动将文本中的 URL 转换为可点击链接：

```javascript
function processLinks(text) {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(linkRegex, (url) => {
    return `<a href="${url}" target="_blank">${url}</a>`;
  });
}
```

### 3. 浏览量统计

显示每条说说的浏览次数：

```javascript
<div class="talk-views">
  <svg>...</svg>
  ${talk.views || 0}
</div>
```

## 效果展示

### 桌面端

```
┌─────────────────────────────────────┐
│ 👤 TgTalk          刚刚            │
│                                    │
│ 换了个号。。。                      │
│                                    │
│ 👁️ 1                               │
└─────────────────────────────────────┘
```

### 移动端

```
┌───────────────────┐
│ 👤 TgTalk  刚刚  │
│                   │
│ 换了个号。。。    │
│                   │
│ 👁️ 1             │
└───────────────────┘
```

## 注意事项

1. **API 可用性**：确保 TgTalk API 可访问
2. **CORS 问题**：如果遇到跨域问题，需要配置 CORS
3. **缓存策略**：根据实际需求调整缓存时间
4. **图片加载**：使用 `loading="lazy"` 延迟加载

## 参考资料

- [TgTalk 项目](https://tgtalk.kemeow.top/)
- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [Hexo 官方文档](https://hexo.io/zh-cn/)

---

**作者**: Kemeow0815  
**发布日期**: 2026-04-25  
**本文链接**: /moment/
