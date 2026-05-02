/**
 * AI 摘要生成脚本 - 适配 Hexo
 * 参考: https://github.com/ljxme/static-aisummary
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { glob } = require("glob");

// 配置
const config = {
  api: process.env.AI_SUMMARY_API || "https://ai.zsxcoder.top/api/spark-proxy",
  key: process.env.AI_SUMMARY_KEY || "",
  model: process.env.AI_SUMMARY_MODEL || "lite",
  concurrency: parseInt(process.env.AISUMMARY_CONCURRENCY) || 2,
  coverAll: process.env.AISUMMARY_COVER_ALL === "true",
  maxToken: parseInt(process.env.AISUMMARY_MAX_TOKEN) || 5000,
  minContentLength: parseInt(process.env.AISUMMARY_MIN_CONTENT_LENGTH) || 50,
  prompt:
    process.env.AI_SUMMARY_PROMPT ||
    "请为以下文章生成一个简洁的摘要，100-200字左右，突出重点内容：",
};

// 配置信息仅在需要时输出
// console.log('AI 摘要生成配置:');
// console.log('- API:', config.api);
// console.log('- Model:', config.model);
// console.log('- Concurrency:', config.concurrency);
// console.log('- Cover All:', config.coverAll);

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("读取文件失败:", filePath, err.message);
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

  yaml.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // 移除引号
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      data[key] = value;
    }
  });

  return { data, content: body };
}

// 序列化 frontmatter
function stringifyFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (
      typeof value === "string" &&
      (value.includes(":") || value.includes("\n"))
    ) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

// 提取纯文本内容
function extractText(content) {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除链接，保留文字
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/`([^`]+)`/g, "$1") // 移除行内代码，保留文字
    .replace(/[#*\-_>]/g, "") // 移除 Markdown 标记
    .replace(/\s+/g, " ") // 合并空白
    .trim();
}

// 延迟函数
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 生成摘要（带重试）
async function generateSummary(text, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // 根据 API 要求构建请求体
      const requestBody = {
        model: config.model,
        content: config.prompt + "\n\n" + text.slice(0, config.maxToken),
      };

      const response = await axios.post(config.api, requestBody, {
        headers: {
          "Content-Type": "application/json",
          ...(config.key && { Authorization: `Bearer ${config.key}` }),
        },
        timeout: 60000,
      });

      // 处理响应
      if (response.data && response.data.summary) {
        return response.data.summary.trim();
      }

      if (response.data && response.data.content) {
        return response.data.content.trim();
      }

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error(
        "Invalid response format: " +
          JSON.stringify(response.data).slice(0, 100),
      );
    } catch (err) {
      const isLastRetry = i === retries - 1;

      // 如果是限流错误，等待后重试
      if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        (err.response.data.error.includes("QpsOverFlow") ||
          err.response.data.error.includes("ConcurrencyOverFlow"))
      ) {
        if (!isLastRetry) {
          const waitTime = (i + 1) * 2000; // 递增等待时间
          console.log(`  API 限流，等待 ${waitTime / 1000} 秒后重试...`);
          await delay(waitTime);
          continue;
        }
      }

      if (err.response) {
        console.error("  API 错误:", err.response.status, err.response.data);
      } else {
        console.error("  生成摘要失败:", err.message);
      }
      throw err;
    }
  }
}

// 处理单个文件
async function processFile(filePath) {
  console.log("处理文件:", filePath);

  const content = readFile(filePath);
  if (!content) return;

  const { data, content: body } = parseFrontmatter(content);

  // 检查是否已有摘要且不覆盖
  if (data.ai_summary && !config.coverAll) {
    console.log("  已有摘要，跳过");
    return;
  }

  // 提取文本
  const text = extractText(body);
  if (text.length < config.minContentLength) {
    console.log("  内容太短，跳过");
    return;
  }

  try {
    console.log("  生成摘要中...");
    let summary = await generateSummary(text);

    // 清理摘要：移除多余换行，确保单行格式
    summary = summary
      .replace(/\n+/g, " ") // 将换行替换为空格
      .replace(/\s+/g, " ") // 合并多个空格
      .trim();

    // 限制长度
    if (summary.length > 500) {
      summary = summary.slice(0, 500) + "...";
    }

    // 更新 frontmatter
    data.ai_summary = summary;

    // 写回文件
    const newContent = stringifyFrontmatter(data) + "\n" + body;
    fs.writeFileSync(filePath, newContent, "utf-8");

    console.log("  摘要生成成功:", summary.slice(0, 50) + "...");
  } catch (err) {
    console.error("  生成摘要失败:", err.message);
  }
}

// 并发控制
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = task()
      .then((result) => ({ status: "fulfilled", value: result }))
      .catch((error) => ({ status: "rejected", reason: error }));
    results.push(promise);

    if (results.length >= concurrency) {
      executing.push(Promise.race(results));
      await Promise.race(executing);
      executing.splice(executing.indexOf(promise), 1);
    }
  }

  await Promise.all(results);
}

// 主函数
async function main() {
  console.log("开始生成 AI 摘要...\n");

  // 查找所有文章
  const files = await glob("source/_posts/**/*.md");
  console.log(`找到 ${files.length} 篇文章\n`);

  // 创建任务
  const tasks = files.map((file) => () => processFile(file));

  // 并发执行
  await runWithConcurrency(tasks, config.concurrency);

  console.log("\nAI 摘要生成完成!");
}

main().catch((err) => {
  console.error("程序出错:", err);
  process.exit(1);
});
