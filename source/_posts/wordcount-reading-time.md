---
title: Hexo Stellar 添加文章字数统计和阅读时长
tags: 
categories: 技术教程
description: 为 Hexo Stellar 主题添加文章字数统计、阅读时长估算和标签显示功能。
abbrlink: 1a11017e
date: "2026-04-25 18:00:00"
ai_summary: 文章介绍了如何在Hexo Stellar主题中添加文章字数统计和阅读时长的显示效果。首先，创建了一个名为wordcount.js的文件，用于计算文章的字数和阅读时长。然后，修改了文章导航栏模板，在页面底部添加了字数和阅读时长的显示。最后，通过CSS样式调整了显示格式，使得字数和阅读时长以更友好的方式呈现。
---
# Hexo Stellar 添加文章字数统计和阅读时长

## 效果预览

在文章标题下方、面包屑导航下方显示：

- 📅 **发布时间**和**更新时间**
- 📊 **字数统计**：显示文章总字数
- ⏱️ **阅读时长**：估算阅读所需时间
- 🏷️ **标签列表**：显示文章标签

## 实现步骤

### 1. 创建字数统计辅助函数

在 `themes/stellar/scripts/helpers/` 目录下创建 `wordcount.js` 文件：

```javascript
/**
 * 字数统计
 * @param {string} content - 文章内容
 * @returns {number} 字数
 */
hexo.extend.helper.register('wordcount', function(content) {
  if (!content) return 0;
  
  // 移除 HTML 标签
  const text = content.replace(/<[^>]+>/g, '');
  
  // 计算中文字符数
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // 计算英文单词数
  const english = (text.match(/[a-zA-Z0-9_\u00C0-\u00FF]+/g) || []).length;
  
  return chinese + english;
});

/**
 * 阅读时长计算（分钟）
 * @param {string} content - 文章内容
 * @returns {number} 阅读时长（分钟）
 */
hexo.extend.helper.register('min2read', function(content) {
  if (!content) return 0;
  
  const words = this.wordcount(content);
  
  // 假设每分钟阅读 300 字
  const minutes = Math.ceil(words / 300);
  
  return minutes > 0 ? minutes : 1;
});
```

### 2. 修改文章导航栏模板

编辑 `themes/stellar/layout/_partial/main/navbar/article_banner.ejs` 文件，在 `// 3.left.bottom` 部分添加：

```javascript
// 3.left.bottom
el += partial('dateinfo')
// 新增：字数显示 | 阅读时长显示
if (page.layout == "post") {
  el += '<div class="flex-row" id="page-words"><span style="padding: 4px;">本文：' + wordcount(page.content) + '字</span><span class="sep updated" style="padding: 4px;"></span><span class="text updated" style="padding: 4px;">阅读时长：' + min2read(page.content) + '分</span></div>';
  // 新增：标签显示
  if (page.tags && page.tags.length > 0) {
    el += '<div class="flex-row" id="tag"><span>&nbsp;标签：</span>';
    el += list_categories(page.tags, {
      class: "cap breadcrumb",
      show_count: false,
      separator: '&nbsp; ',
      style: "none"
    });
    el += '&nbsp;</div>';
  }
}
// end 2.left
el += `</div>`
```

### 3. 添加 CSS 样式

在 `themes/stellar/source/css/_custom.styl` 文件末尾添加：

```stylus
/* 文章内字数统计&阅读时长 */
.bread-nav div#page-words span.sep:before
  content: '|'

.bread-nav div#page-words span.updated
  visibility: hidden

.bread-nav:hover div#page-words span.updated
  visibility: visible

#page-words
  font-size: $fs-14
  color: var(--text-p3)
  margin-top: 4px

#tag
  font-size: $fs-14
  color: var(--text-p3)
  margin-top: 4px
  
  .cap.breadcrumb
    color: var(--text-link)
    
    &:hover
      color: var(--theme)
```

### 4. 重新生成博客

```bash
hexo clean
hexo generate
hexo server
```

## 功能说明

### 字数统计

- **计算规则**：中文字符数 + 英文单词数
- **显示位置**：文章标题下方
- **显示格式**：`本文：XXX 字`

### 阅读时长

- **计算规则**：总字数 ÷ 300 字/分钟
- **向上取整**：不足 1 分钟按 1 分钟计算
- **显示格式**：`阅读时长：X 分`

### 标签显示

- **条件显示**：仅当文章有标签时显示
- **格式**：`标签：tag1  tag2  tag3`
- **可点击**：点击标签可跳转到标签页面

## 自定义配置

### 修改阅读速度

在 `wordcount.js` 中修改除数：

```javascript
// 每分钟阅读 400 字（适合快速阅读）
const minutes = Math.ceil(words / 400);

// 每分钟阅读 200 字（适合技术文章）
const minutes = Math.ceil(words / 200);
```

### 修改显示样式

在 `_custom.styl` 中调整：

```stylus
#page-words
  font-size: $fs-13      // 字体大小
  color: var(--text-p2)  // 文字颜色
  margin-top: 8px        // 上边距
```

### 修改显示格式

在 `article_banner.ejs` 中修改字符串：

```javascript
// 修改为英文显示
el += 'Words: ' + wordcount(page.content) + ' | '
el += 'Reading time: ' + min2read(page.content) + ' min'
```

## 技术细节

### wordcount 函数

1. 移除 HTML 标签，避免统计标签字符
2. 使用中文字符 Unicode 范围 `[\u4e00-\u9fa5]`
3. 使用英文单词正则 `[a-zA-Z0-9_\u00C0-\u00FF]+`

### min2read 函数

1. 调用 `wordcount` 获取总字数
2. 除以阅读速度（默认 300 字/分钟）
3. 使用 `Math.ceil` 向上取整

### list_categories

Hexo 内置的标签列表生成函数：
- `class`: CSS 类名
- `show_count`: 是否显示文章数
- `separator`: 标签分隔符
- `style`: 列表样式

## 效果展示

```
主页 / 文章 / 博客 / 折腾
发布于：53 分钟前 | 更新于：刚刚
本文：880 字 / 阅读时长：4 分
标签：hexo  博客

# Hexo Stellar 主题装修笔记
```

## 注意事项

1. **仅对文章生效**：`page.layout == "post"` 时才显示
2. **标签可选**：没有标签时不显示标签行
3. **性能优化**：字数统计在生成时计算，不影响页面加载速度
4. **主题适配**：使用主题变量，自动适配明暗模式

## 参考资料

- [Hexo Helper API](https://hexo.io/api/helper)
- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [EJS 模板语法](https://ejs.co/)

---

**作者**: Kemeow0815  
**发布日期**: 2026-04-25  
**本文链接**: /2026/04/25/wordcount-reading-time/
