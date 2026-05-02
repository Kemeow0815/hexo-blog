---
title: Hexo Stellar 主题添加 AI 摘要功能完整指南
description: 为 Hexo Stellar 主题添加 AI 自动摘要功能，支持 Spark AI 接口，包含打字机动画效果，让文章更具科技感。
categories: 
 - 技术教程
tags: 
- 博客
- AI摘要
- Hexo
cover: "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/hexo-ai-summary.webp"
date: "2026-05-02 15:00:00"
swiper_index: 8
swiper_cover: "https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/hexo-ai-summary.webp"
swiper_desc: 为 Hexo Stellar 主题添加 AI 自动摘要功能，支持 Spark AI 接口，让文章更具科技感。
abbrlink: ai-summary-guide
ai_summary: 文章介绍了如何为Hexo Stellar主题添加AI摘要功能，使每篇文章都能自动生成简洁的摘要，并以优雅的打字机动画效果展示在文章顶部。该功能包括自动生成、打字机动画、优雅样式和深色模式适配等特性，并分为后端脚本、前端模板和前端脚本三个部分实现。实现步骤包括安装依赖、配置环境变量、创建后端生成脚本、前端样式、前端脚本和EJS模板等。使用方法包括生成摘要和手动添加摘要。常见问题包括检查API地址和密钥是否正确、网络连接是否正常等。
---
## 前言

随着 AI 技术的普及，越来越多的博客开始集成 AI 摘要功能。本文将详细介绍如何为 Hexo Stellar 主题添加 AI 自动摘要功能，让每篇文章都能自动生成简洁的摘要，并以优雅的打字机动画效果展示在文章顶部。

## 效果预览

AI 摘要组件具有以下特性：

- **自动生成**：调用 AI API 自动为文章生成摘要
- **打字机动画**：摘要文字以打字机效果逐字显示
- **优雅样式**：卡片式设计，带有渐变边框和图标
- **深色模式适配**：自动适配明暗主题
- **PJAX 兼容**：页面切换时自动重新初始化
- **免责声明**：底部显示 AI 生成内容的免责声明

## 实现原理

整个系统分为三个部分：

1. **后端脚本**：Node.js 脚本读取文章，调用 AI API 生成摘要，写入文章 frontmatter
2. **前端模板**：EJS 模板读取 frontmatter 中的摘要并渲染到页面
3. **前端脚本**：JavaScript 实现打字机动画效果

## 实现步骤

### 1. 安装依赖

在项目根目录下安装必要的依赖：

```bash
cnpm install axios glob dotenv
```

### 2. 配置环境变量

创建 `.env` 文件，配置 AI API 相关信息：

```env
# AI 摘要生成配置
# API 地址 (OpenAI 格式)
AI_SUMMARY_API=https://ai.zsxcoder.top/api/spark-proxy
# API Key
AI_SUMMARY_KEY=your-api-key-here
# 模型名称
AI_SUMMARY_MODEL=lite
# 并发数 (建议设为1，避免API限流)
AISUMMARY_CONCURRENCY=1
# 是否重新生成所有摘要 (true/false)
AISUMMARY_COVER_ALL=false
# 最大 Token 数 (用于截取文章内容)
AISUMMARY_MAX_TOKEN=5000
# 最小内容长度 (用于判断是否跳过)
AISUMMARY_MIN_CONTENT_LENGTH=50
# 自定义 Prompt
AI_SUMMARY_PROMPT=请为以下文章生成一个简洁的摘要，100-200字左右，突出重点内容。摘要应该描述文章的主要内容和目的，不要包含具体的代码实现细节或代码片段。
```

### 3. 创建后端生成脚本

创建 `scripts/generate-ai-summary.js` 文件：

```javascript
/**
 * AI 摘要生成脚本 - 适配 Hexo
 * 参考: https://github.com/ljxme/static-aisummary
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { glob } = require('glob');

// 配置
const config = {
  api: process.env.AI_SUMMARY_API,
  key: process.env.AI_SUMMARY_KEY || '',
  model: process.env.AI_SUMMARY_MODEL || 'lite',
  concurrency: parseInt(process.env.AISUMMARY_CONCURRENCY) || 1,
  coverAll: process.env.AISUMMARY_COVER_ALL === 'true',
  maxToken: parseInt(process.env.AISUMMARY_MAX_TOKEN) || 5000,
  minContentLength: parseInt(process.env.AISUMMARY_MIN_CONTENT_LENGTH) || 50,
  prompt: process.env.AI_SUMMARY_PROMPT || '请为以下文章生成一个简洁的摘要，100-200字左右，突出重点内容：'
};

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('读取文件失败:', filePath, err.message);
    return null;
  }
}

// 解析 frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, content: content };
  
  const yaml = match[1];
  const body = content.slice(match[0].length);
  const data = {};
  
  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      data[key] = value;
    }
  });
  
  return { data, content: body };
}

// 序列化 frontmatter
function stringifyFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && (value.includes(':') || value.includes('\n'))) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// 提取纯文本内容（移除 Markdown 标记和代码）
function extractText(content) {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文字
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`([^`]+)`/g, '$1') // 移除行内代码
    .replace(/[#*\-_>]/g, '') // 移除 Markdown 标记
    .replace(/\s+/g, ' ') // 合并空白
    .trim();
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 生成摘要（带重试）
async function generateSummary(text, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const requestBody = {
        model: config.model,
        content: config.prompt + '\n\n' + text.slice(0, config.maxToken)
      };
      
      const response = await axios.post(config.api, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          ...(config.key && { 'Authorization': `Bearer ${config.key}` })
        },
        timeout: 60000
      });

      if (response.data && response.data.summary) {
        return response.data.summary.trim();
      }
      
      if (response.data && response.data.content) {
        return response.data.content.trim();
      }
      
      throw new Error('Invalid response format');
    } catch (err) {
      const isLastRetry = i === retries - 1;
      
      // 限流错误处理
      if (err.response?.data?.error?.includes('QpsOverFlow') || 
          err.response?.data?.error?.includes('ConcurrencyOverFlow')) {
        if (!isLastRetry) {
          const waitTime = (i + 1) * 2000;
          console.log(`  API 限流，等待 ${waitTime/1000} 秒后重试...`);
          await delay(waitTime);
          continue;
        }
      }
      
      throw err;
    }
  }
}

// 处理单个文件
async function processFile(filePath) {
  console.log('处理文件:', filePath);
  
  const content = readFile(filePath);
  if (!content) return;
  
  const { data, content: body } = parseFrontmatter(content);
  
  // 检查是否已有摘要且不覆盖
  if (data.ai_summary && !config.coverAll) {
    console.log('  已有摘要，跳过');
    return;
  }
  
  // 提取文本
  const text = extractText(body);
  if (text.length < config.minContentLength) {
    console.log('  内容太短，跳过');
    return;
  }
  
  try {
    console.log('  生成摘要中...');
    let summary = await generateSummary(text);
    
    // 清理摘要格式
    summary = summary
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (summary.length > 500) {
      summary = summary.slice(0, 500) + '...';
    }
    
    // 更新 frontmatter
    data.ai_summary = summary;
    
    // 写回文件
    const newContent = stringifyFrontmatter(data) + '\n' + body;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    console.log('  摘要生成成功:', summary.slice(0, 50) + '...');
  } catch (err) {
    console.error('  生成摘要失败:', err.message);
  }
}

// 主函数
async function main() {
  console.log('开始生成 AI 摘要...\n');
  
  const files = await glob('source/_posts/**/*.md');
  console.log(`找到 ${files.length} 篇文章\n`);
  
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\nAI 摘要生成完成!');
}

main().catch(err => {
  console.error('程序出错:', err);
  process.exit(1);
});
```

### 4. 创建前端样式

创建 `source/css/ai-summary.css` 文件：

```css
/* AI 摘要样式 - 适配 Hexo Stellar 主题 */

.ai-summary-container {
  margin: 1.5rem 2rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--card) 0%, var(--block) 100%);
  border: 1px solid var(--block-border);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

/* 文章顶部位置的 AI 摘要 */
.article.banner + .ai-summary-container {
  margin-top: 1rem;
  margin-bottom: 0;
}

.ai-summary-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--theme) 0%, var(--accent) 100%);
}

/* 标题区域 */
.ai-summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ai-summary-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.ai-summary-icon svg {
  width: 100%;
  height: 100%;
  fill: var(--theme);
}

.ai-summary-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.ai-summary-tag {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--theme);
  color: #fff;
  font-size: 0.7rem;
  border-radius: 10px;
}

/* 内容区域 */
.ai-summary-content {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text-p1);
  min-height: 1.8em;
}

/* 打字机效果 */
.ai-summary-content.typing::after {
  content: '|';
  animation: blink 1s infinite;
  color: var(--theme);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 免责声明 */
.ai-summary-disclaimer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--block-border);
  font-size: 0.75rem;
  color: var(--text-p3);
}

/* 深色模式适配 */
[data-theme="dark"] .ai-summary-container {
  background: linear-gradient(135deg, var(--card) 0%, var(--block) 100%);
  border-color: var(--block-border);
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ai-summary-container {
    padding: 0.875rem 1rem;
    margin: 1rem 0;
  }
}
```

### 5. 创建前端脚本

创建 `source/js/ai-summary.js` 文件：

```javascript
/**
 * AI 摘要前端展示脚本 - 适配 Hexo Stellar 主题
 */

(function() {
  'use strict';

  const config = {
    typingAnimate: true,
    typingSpeed: 30,
    containerSelector: '.ai-summary-container',
    summaryAttribute: 'data-ai-summary'
  };

  // 打字机效果
  function typeWriter(element, text, speed) {
    let i = 0;
    element.textContent = '';
    element.classList.add('typing');

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        element.classList.remove('typing');
        element.classList.add('typed');
      }
    }

    type();
  }

  // 初始化 AI 摘要
  function initAISummary() {
    const containers = document.querySelectorAll(config.containerSelector);

    containers.forEach(container => {
      const summaryEl = container.querySelector('.ai-summary-content');
      if (!summaryEl) return;

      const summary = summaryEl.getAttribute(config.summaryAttribute);
      if (!summary) return;

      if (config.typingAnimate) {
        typeWriter(summaryEl, summary, config.typingSpeed);
      } else {
        summaryEl.textContent = summary;
      }
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAISummary);
  } else {
    initAISummary();
  }

  // PJAX 适配
  document.addEventListener('pjax:complete', initAISummary);
  document.addEventListener('pjax:end', initAISummary);
})();
```

### 6. 创建 EJS 模板

创建 `themes/stellar/layout/_partial/widgets/ai-summary.ejs` 文件：

```ejs
<%
/**
 * AI 摘要组件 - 适配 Hexo Stellar 主题
 */

const aiSummary = page.ai_summary || '';
if (!aiSummary) return '';
%>

<div class="ai-summary-container">
  <div class="ai-summary-header">
    <div class="ai-summary-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    </div>
    <div class="ai-summary-title">AI 摘要</div>
    <div class="ai-summary-tag">Spark AI</div>
  </div>
  <div class="ai-summary-content" data-ai-summary="<%= aiSummary %>">
    <%= aiSummary %>
  </div>
  <div class="ai-summary-disclaimer">
    本摘要由 AI 生成，仅供参考，内容准确性请以原文为准。
  </div>
</div>
```

### 7. 修改页面模板

编辑 `themes/stellar/layout/page.ejs`，在文章 banner 后添加 AI 摘要：

```javascript
function layoutDiv() {
  var el = ''
  if (page.nav_tabs) {
    el += partial('_partial/main/navbar/nav_tabs_blog')
  }
  if (page.h1 || page.title || (page.content && page.content.length > 0)) {
    el += partial('_partial/main/navbar/article_banner')
  }
  // AI 摘要 - 显示在文章顶部
  if (page.ai_summary) {
    el += partial('_partial/widgets/ai-summary')
  }
  el += `<article class="${articleClass()}">`
  // ... 其余代码
}
```

### 8. 注册 Widget

在 `themes/stellar/_data/widgets.yml` 中添加 AI 摘要组件：

```yaml
# AI 摘要组件
ai_summary:
  layout: ai-summary
```

### 9. 引入 CSS 和 JS

在 `_config.stellar.yml` 中添加资源引入：

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/ai-summary.css">
  script:
    - <script src="/js/ai-summary.js"></script>
```

## 使用方法

### 生成摘要

运行以下命令为所有文章生成 AI 摘要：

```bash
node scripts/generate-ai-summary.js
```

脚本会：
1. 扫描 `source/_posts/` 目录下的所有 Markdown 文件
2. 检查文章是否已有 `ai_summary` 字段
3. 调用 AI API 生成摘要
4. 将摘要写入文章的 frontmatter

### 手动添加摘要

也可以在文章 frontmatter 中手动添加摘要：

```yaml
---
title: 文章标题
date: 2026-05-02
ai_summary: 这是文章的 AI 生成摘要，简要介绍文章内容...
---
```

## 配置说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `AI_SUMMARY_API` | AI API 地址 | - |
| `AI_SUMMARY_KEY` | API 密钥 | - |
| `AI_SUMMARY_MODEL` | 模型名称 | lite |
| `AISUMMARY_CONCURRENCY` | 并发数 | 1 |
| `AISUMMARY_COVER_ALL` | 是否覆盖已有摘要 | false |
| `AISUMMARY_MAX_TOKEN` | 最大 Token 数 | 5000 |
| `AI_SUMMARY_PROMPT` | 自定义 Prompt | - |

## 常见问题

### Q: 摘要生成失败怎么办？

A: 检查以下几点：
1. API 地址和密钥是否正确
2. 网络连接是否正常
3. API 是否有 QPS 限制，适当降低并发数

### Q: 如何更换 AI 模型？

A: 修改 `.env` 中的 `AI_SUMMARY_MODEL` 为对应的模型名称，如 `gpt-3.5-turbo`、`claude` 等。

### Q: 摘要显示位置可以调整吗？

A: 可以，修改 `page.ejs` 中 AI 摘要的插入位置即可。

### Q: 如何关闭打字机动画？

A: 修改 `ai-summary.js` 中的 `typingAnimate` 为 `false`。

## 总结

通过本文的介绍，你已经成功为 Hexo Stellar 主题添加了 AI 摘要功能。这个功能不仅提升了博客的科技感，还能帮助读者快速了解文章内容。你可以根据需要调整样式和配置，打造属于自己的 AI 摘要组件。

## 参考资源

- [Hexo 官方文档](https://hexo.io/docs/)
- [Stellar 主题文档](https://xaoxuu.com/wiki/stellar/)
- [static-aisummary 项目](https://github.com/ljxme/static-aisummary)
