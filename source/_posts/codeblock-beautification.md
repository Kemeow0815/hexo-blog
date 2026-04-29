---
title: Hexo Stellar 代码块美化指南
tags:
  - Hexo
  - Stellar
  - CSS
  - 代码美化
categories: 技术教程
description: 参考其他博客的美化方案，为 Hexo Stellar 主题添加优雅的代码块样式，包含顶部按钮、语法高亮、作者签名等功能。
abbrlink: 248a939e
date: 2026-04-25 16:00:00
---

# Hexo Stellar 代码块美化指南

## 效果预览

通过本文的美化方案，你的代码块将会拥有：

- 🎨 **macOS 风格顶部按钮**：三个彩色圆点，鼠标悬停时变色
- ✨ **优雅借鉴提示**：顶部显示"优雅借鉴"文字
-  **精美语法高亮**：清晰的代码颜色区分
- 📝 **作者签名**：代码块右下角显示作者信息和站点名称（带月亮图标）
- 🎯 **悬停效果**：鼠标悬停时按钮变色提示
- 📱 **响应式设计**：完美适配移动端

## 实现步骤

### 1. 创建自定义 CSS 文件

在博客的 `source/css/` 目录下创建 `custom-codeblock.css` 文件：

```bash
# 文件路径
source/css/custom-codeblock.css
```

### 2. 添加美化样式

将以下代码复制到 `custom-codeblock.css` 文件中：

```css
/* 代码块美化样式 */

:root {
  --code-autor: '© YourName🌙';
  --code-tip: "优雅借鉴";
}

/* 语法高亮容器 */
.md-text .highlight {
  position: relative;
  display: block;
  overflow-x: hidden;
  background: var(--block);
  color: #9c67a1;
  padding: 30px 5px 2px 5px !important;
  box-shadow: 0 10px 30px 0px rgb(0 0 0 / 40%);
  border-radius: 12px;
  margin: 1.5em 0;
}

/* 代码块顶部提示（类似 macOS 窗口按钮） */
.hljs::before {
  content: var(--code-tip);
  position: absolute;
  left: 15px;
  top: 10px;
  overflow: visible;
  width: 12px;
  height: 12px;
  border-radius: 16px;
  box-shadow: 20px 0 #a9a6a1, 40px 0 #999;
  -webkit-box-shadow: 20px 0 #a9a6a1, 40px 0 #999;
  background-color: #999;
  white-space: nowrap;
  text-indent: 75px;
  font-size: 16px;
  line-height: 12px;
  font-weight: 700;
  color: #999;
  transition: all 0.3s ease;
}

/* 鼠标悬停时变色效果 */
.highlight:hover .hljs::before {
  color: #35cd4b;
  box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  background-color: #fc625d;
}

/* ... 更多样式请参考完整 CSS 文件 ... */
```

### 3. 在主题配置中引入

编辑 `_config.stellar.yml` 文件，添加 inject 配置：

```yaml
######## head tags ########
preconnect:
  # - https://gcore.jsdelivr.net

# 自定义注入到 head 的 HTML 代码
inject:
  head:
    - '<link rel="stylesheet" href="/css/custom-codeblock.css" type="text/css">'
```

### 4. 重新生成博客

```bash
hexo clean
hexo generate
hexo server
```

## 自定义配置

### 修改作者签名

在 `custom-codeblock.css` 文件顶部修改：

```css
:root {
  --code-autor: '© 你的名字🌙';  /* 修改这里 */
  --code-tip: "优雅借鉴";        /* 或者修改提示文字 */
}
```

### 调整颜色方案

可以根据个人喜好修改语法高亮的颜色：

```css
.hljs-keyword { color: #c78300; }    /* 关键字颜色 */
.hljs-string { color: #4caf50; }     /* 字符串颜色 */
.hljs-comment { color: #57a64a; }    /* 注释颜色 */
.hljs-number { color: #2094f3; }     /* 数字颜色 */
```

### 修改顶部按钮样式

```css
/* 默认状态 */
.hljs::before {
  box-shadow: 20px 0 #a9a6a1, 40px 0 #999;  /* 三个圆点的颜色 */
  background-color: #999;                    /* 第一个圆点颜色 */
}

/* 悬停状态 */
.highlight:hover .hljs::before {
  box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;  /* 悬停时的颜色 */
  background-color: #fc625d;                    /* 第一个圆点悬停颜色 */
}
```

## 功能特点

### 1. macOS 风格顶部按钮

代码块顶部显示三个类似 macOS 窗口的控制按钮，鼠标悬停时会变色：

- **默认状态**：
  - 🔴 红色圆点 (#ff5f56)
  - 🟡 黄色圆点 (#ffbd2e)
  - 🟢 绿色圆点 (#27c935)
- **悬停状态**：
  - 🔴 深红色 (#ff3b30)
  - 🟠 橙色 (#ff9500)
  - 🟢 鲜绿色 (#34c759)

### 2. 智能语法高亮

支持多种编程语言的语法高亮：

- **HTML/XML**
- **JavaScript/TypeScript**
- **CSS/Less**
- **Python**
- **Java**
- **C/C++**
- **Go/Rust**
- **PHP/Ruby**
- **SQL**
- **Shell/Bash**
- **JSON/YAML**
- **Markdown**
- 等等...

### 3. 作者签名

在每个代码块的右下角显示作者信息和站点名称，格式为：

```
🌙 © YourName · SiteName
```

默认带有半透明效果，鼠标悬停时变清晰。

### 4. 响应式设计

在移动端自动调整样式：

```css
@media screen and (max-width: 768px) {
  .md-text .highlight {
    padding: 25px 3px 2px 3px !important;
    margin: 1em 0;
  }
}
```

### 5. 暗色模式适配

自动适配 Stellar 主题的明暗模式：

```css
[data-theme="dark"] .hljs::before {
  box-shadow: 20px 0 #666, 40px 0 #555;
  background-color: #555;
}
```

## 高级定制

### 添加更多语言标签

在 CSS 文件中添加：

```css
.hljs.language-kotlin::before {
  content: "Kotlin";
}

.hljs.language-scala::before {
  content: "Scala";
}
```

### 自定义滚动条样式

```css
.hljs-ln::-webkit-scrollbar {
  height: 10px;
  border-radius: 5px;
  background: #333;
}

.hljs-ln::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 5px;
}
```

### 添加代码折叠功能

```css
code.hljs {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 10;  /* 默认显示 10 行 */
  -webkit-box-orient: vertical;
}

.hljsOpen {
  -webkit-line-clamp: 99999 !important;
}
```

## 效果对比

### 美化前

- 普通的代码块样式
- 无特色
- 缺少视觉层次

### 美化后

- ✨ macOS 风格顶部按钮
- 🎨 精美的语法高亮
- 📝 作者签名
- 🌈 悬停交互效果
- 📱 完美的响应式支持

## 参考资料

- [Stellar 代码块个人向美化](https://log.cns.red/Stellar%E4%BB%A3%E7%A0%81%E5%9D%97%E4%B8%AA%E4%BA%BA%E5%90%91%E7%BE%8E%E5%8C%96/)
- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [Highlight.js 文档](https://highlightjs.org/)

## 常见问题

### Q: 代码块样式没有变化？

A: 请检查：
1. CSS 文件路径是否正确
2. 是否在 `_config.stellar.yml` 中添加了 inject 配置
3. 是否执行了 `hexo clean && hexo generate`
4. 浏览器缓存是否已清除

### Q: 如何修改作者签名？

A: 在 `custom-codeblock.css` 文件顶部的 `:root` 中修改 `--code-autor` 变量

### Q: 顶部按钮不显示？

A: 请检查以下几点：
1. 确保 CSS 文件正确加载（打开浏览器开发者工具查看网络请求）
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 确保代码块使用了正确的语法高亮标记，例如：

````markdown
```javascript
// 你的代码
```
````

4. 检查 CSS 选择器是否正确（应该是 `.highlight::before`）

### Q: 移动端显示异常？

A: 检查是否正确添加了响应式样式，或调整移动端的 padding 和 margin 值

## 总结

通过以上配置，你的 Hexo Stellar 博客代码块将拥有：

✅ **高颜值**：macOS 风格设计，视觉体验优秀  
✅ **易用性**：配置简单，只需添加 CSS 文件  
✅ **可定制**：所有元素都可以自定义  
✅ **响应式**：完美适配各种设备  
✅ **主题适配**：自动适配明暗模式  

立即动手美化你的代码块吧！

---

**作者**: Kemeow0815  
**发布日期**: 2026-04-25  
**本文链接**: /2026/04/25/codeblock-beautification/
