/**
 * AI 摘要前端展示脚本 - 适配 Hexo Stellar 主题
 * 参考: https://github.com/ljxme/static-aisummary
 */

(function() {
  'use strict';

  // 配置
  const config = {
    typingAnimate: true,        // 是否开启打字机动画
    typingSpeed: 30,            // 打字速度（毫秒/字）
    containerSelector: '.ai-summary-container', // 容器选择器
    summaryAttribute: 'data-ai-summary' // 摘要数据属性
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

      // 如果开启了打字机动画
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

  console.log('[AI Summary] Initialized');
})();
