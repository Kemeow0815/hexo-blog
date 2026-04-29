/**
 * Donate 捐赠组件
 * 适配 PJAX 无刷新加载
 */

(function() {
  'use strict';

  let isInitialized = false;

  /**
   * 显示二维码
   */
  function showQRCode() {
    const qrCode = document.getElementById('donate-wechat');
    if (qrCode) {
      qrCode.style.display = 'block';
      document.addEventListener('click', hideQRCode);
    }
  }

  /**
   * 隐藏二维码
   */
  function hideQRCode(event) {
    const qrCode = document.getElementById('donate-wechat');
    const donateIcon = document.querySelector('[data-donate-toggle]');

    if (qrCode && !qrCode.contains(event.target) && (!donateIcon || !donateIcon.contains(event.target))) {
      qrCode.style.display = 'none';
      document.removeEventListener('click', hideQRCode);
    }
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 使用事件委托，避免重复绑定
    document.removeEventListener('click', handleDonateClick);
    document.addEventListener('click', handleDonateClick);
  }

  /**
   * 处理点击事件
   */
  function handleDonateClick(event) {
    const donateToggle = event.target.closest('[data-donate-toggle]');
    if (donateToggle) {
      event.preventDefault();
      event.stopPropagation();
      showQRCode();
    }
  }

  /**
   * 初始化
   */
  function init() {
    // 检查是否存在捐赠组件
    if (!document.getElementById('donate')) {
      return;
    }

    // 避免重复初始化
    if (isInitialized) return;
    isInitialized = true;

    bindEvents();
  }

  /**
   * 清理
   */
  function cleanup() {
    document.removeEventListener('click', handleDonateClick);
    document.removeEventListener('click', hideQRCode);
    isInitialized = false;
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // PJAX 兼容
  document.addEventListener('pjax:complete', function() {
    cleanup();
    setTimeout(init, 100);
  });

  // 页面卸载时清理
  window.addEventListener('beforeunload', cleanup);
})();
