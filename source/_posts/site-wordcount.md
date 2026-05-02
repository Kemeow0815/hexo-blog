---
title: Hexo Stellar 添加全站字数统计
tags: 
categories: 技术教程
description: 为 Hexo Stellar 主题添加页面底部全站文章字数统计功能。
abbrlink: 5d63715b
date: "2026-04-25 19:00:00"
ai_summary: 文章介绍了如何在Hexo Stellar主题中添加全站字数统计功能，通过创建辅助函数和修改模板文件，实现了在博客页面底部实时显示总字数的功能。具体步骤包括：1. 创建计算全站文章总字数的辅助函数；2. 修改Footer模板文件，添加全站字数统计；3. 添加CSS样式；4. 重新生成博客。该功能可以让用户快速了解博客的总字数，方便用户进行内容管理和优化。
---
# Hexo Stellar 添加全站字数统计

## 效果预览

在博客页面底部（Footer）显示：

```
共发表 X 篇 Blog · 总计 XXXXX 字
```

实时统计全站所有文章的总字数。

## 实现步骤

### 1. 创建全站字数统计辅助函数

在 `themes/stellar/scripts/helpers/` 目录下创建 `totalcount.js` 文件：

```javascript
/**
 * 计算全站文章总字数
 * @returns {number} 总字数
 */
hexo.extend.helper.register('totalcount', function() {
  var total = 0;
  
  // 获取所有文章
  var posts = this.site.posts;
  
  // 遍历所有文章
  posts.forEach(function(post) {
    if (post.content) {
      // 移除 HTML 标签
      var text = post.content.replace(/<[^>]+>/g, '');
      
      // 计算中文字符数
      var chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      
      // 计算英文单词数
      var english = (text.match(/[a-zA-Z0-9_\u00C0-\u00FF]+/g) || []).length;
      
      total += chinese + english;
    }
  });
  
  return total;
});
```

### 2. 修改 Footer 模板

编辑 `themes/stellar/layout/_partial/main/footer.ejs` 文件，在 `// footer` 部分添加：

```javascript
// footer
el += '<div class="text">'
if (content) {
  el += markdown(content)
}
// 添加全站字数统计
el += '<div style="margin-top: 8px; text-align: center;">'
el += '<span class="totalcount">共发表 ' + site.posts.length + ' 篇 Blog · </span>'
el += '<span class="post-count">总计 ' + totalcount(site) + ' 字</span>'
el += '</div>'
el += '</div>'
// runtime script
```

### 3. 添加 CSS 样式

在 `themes/stellar/source/css/_custom.styl` 文件末尾添加：

```stylus
/* 页面底部字数统计 */
.post-count
  scrollbar-width: none
  color: var(--text-p2)

.totalcount
  color: var(--text-p2)

.page-footer
  text-align: center
  margin: 0 auto
  width: 100%
```

### 4. 重新生成博客

```bash
hexo clean
hexo generate
hexo server
```

## 功能说明

### 字数统计

- **统计范围**：全站所有文章（posts）
- **计算规则**：中文字符数 + 英文单词数
- **显示位置**：页面底部 Footer 区域
- **显示格式**：`共发表 X 篇 Blog · 总计 XXXXX 字`

### 技术细节

#### 1. Helper 函数

使用 `hexo.extend.helper.register` 注册全局辅助函数：

```javascript
hexo.extend.helper.register('totalcount', function() {
  // this.site 包含所有站点数据
  var posts = this.site.posts;
  // ...
});
```

#### 2. 文章遍历

遍历所有文章并累加字数：

```javascript
posts.forEach(function(post) {
  if (post.content) {
    // 计算字数
    total += chinese + english;
  }
});
```

#### 3. 字符匹配

- **中文**：`[\u4e00-\u9fa5]` - Unicode 范围
- **英文**：`[a-zA-Z0-9_\u00C0-\u00FF]+` - 单词匹配

### 性能优化

由于需要遍历所有文章，建议在生成时计算，而不是在页面加载时：

```javascript
// ✅ 生成时计算（推荐）
el += '总计 ' + totalcount(site) + ' 字'

// ❌ 页面加载时计算（不推荐）
// 需要额外的 JavaScript 代码
```

## 自定义配置

### 修改显示格式

在 `footer.ejs` 中修改字符串：

```javascript
// 简洁版
el += '<span class="totalcount">Posts: ' + site.posts.length + '</span>'
el += '<span class="post-count"> | Words: ' + totalcount(site) + '</span>'

// 详细版
el += '<span class="totalcount">文章总数：' + site.posts.length + ' 篇</span>'
el += '<span class="post-count"> · 总字数：' + totalcount(site) + ' 字</span>'
```

### 修改样式

在 `_custom.styl` 中调整：

```stylus
.post-count, .totalcount
  color: var(--text-p1)  // 文字颜色
  font-size: $fs-13      // 字体大小
  font-weight: 500       // 字重
```

### 添加千位分隔符

```javascript
// 在 totalcount.js 中修改返回值
return total.toLocaleString();  // 12345 -> 12,345
```

## 注意事项

1. **性能考虑**：文章数量多时可能影响生成速度
2. **缓存策略**：建议在生产环境使用缓存
3. **准确性**：代码块中的字符也会被统计
4. **兼容性**：使用 `this.site` 访问站点数据

## 效果展示

页面底部显示：

```
© 2024 Kemeow0815
共发表 5 篇 Blog · 总计 12345 字

🦉 本站已安全运行：X 年 X 天 X 小时 X 分钟 X 秒 🦉
```

## 参考资料

- [Hexo Helper API](https://hexo.io/api/helper)
- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [JavaScript 正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)

---

**作者**: Kemeow0815  
**发布日期**: 2026-04-25  
**本文链接**: /2026/04/25/site-wordcount/
