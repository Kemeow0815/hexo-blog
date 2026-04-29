/**
 * 每日一言组件
 * 适配 PJAX 无刷新加载
 */

(function() {
  'use strict';

  /**
   * 获取一言数据
   */
  function fetchHitokoto() {
    const textEl = document.getElementById('hitokoto-text');
    const fromEl = document.getElementById('hitokoto-from');
    
    // 检查元素是否存在
    if (!textEl) return;
    
    // 显示加载中
    textEl.textContent = '加载中...';
    if (fromEl) fromEl.textContent = '';

    fetch('https://60s.050815.xyz/v2/hitokoto?encoding=json')
      .then(function(res) { return res.json(); })
      .then(function(result) {
        if (result.code === 200 && result.data && result.data.hitokoto) {
          textEl.textContent = '「' + result.data.hitokoto + '」';
          if (fromEl) fromEl.textContent = result.data.from ? '—— ' + result.data.from : '';
        } else {
          textEl.textContent = '「生活不止眼前的苟且」';
        }
      })
      .catch(function(err) {
        console.error('一言加载失败:', err);
        if (textEl) textEl.textContent = '「生活不止眼前的苟且」';
      });
  }

  /**
   * 初始化
   */
  function init() {
    // 检查是否存在一言组件
    if (document.getElementById('hitokoto-text')) {
      fetchHitokoto();
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // PJAX 兼容 - 在 PJAX 完成后重新加载一言
  document.addEventListener('pjax:complete', function() {
    // 延迟执行，确保 DOM 已经更新
    setTimeout(init, 100);
  });

})();
