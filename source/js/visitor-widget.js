// 来访者组件 - 适配 Stellar 主题
// 参考: https://blog.yvyang.top/posts/33615/

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    CACHE_DURATION: 1000 * 60 * 60, // 缓存1小时
    API_URL: 'https://v2.xxapi.cn/api/ua',
    FALLBACK_API: 'https://api.ip.sb/geoip'
  };

  const CACHE_KEY = 'visitor_info_cache';

  // 省份列表
  const PROVINCES = [
    '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区',
    '香港特别行政区', '澳门特别行政区',
    '北京市', '天津市', '上海市', '重庆市',
    '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
    '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
    '河南省', '湖北省', '湖南省', '广东省', '海南省',
    '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省'
  ].sort((a, b) => b.length - a.length);

  // 欢迎语
  const GREETINGS = {
    "中国": {
      "北京": "北——京——欢迎你~~~",
      "天津": "讲段相声，品盏茶汤",
      "河北": "燕赵大地，慷慨悲歌",
      "山西": "晋善晋美，表里山河",
      "内蒙古": "天苍苍野茫茫，风吹草低见牛羊",
      "辽宁": "辽沈大地，豪爽敞亮",
      "吉林": "白山黑水，雾凇奇缘",
      "黑龙江": "冰雪童话，北国风光",
      "上海": "魔都闪耀，海纳百川",
      "江苏": "江南水乡，温婉如画",
      "浙江": "诗画浙江，人间天堂",
      "安徽": "徽风皖韵，山水人文",
      "福建": "山海福建，爱拼会赢",
      "江西": "物华天宝，人杰地灵",
      "山东": "孔孟之乡，好客山东",
      "河南": "中原腹地，华夏之源",
      "湖北": "千湖之省，荆楚风华",
      "湖南": "潇湘山水，敢为人先",
      "广东": "粤韵风华，食在广东",
      "广西": "桂林山水甲天下",
      "海南": "椰风海韵，天涯海角",
      "四川": "天府之国，巴适得板",
      "贵州": "山地公园，多彩贵州",
      "云南": "彩云之南，心灵故乡",
      "西藏": "圣洁西藏，心灵净土",
      "陕西": "千年古都，常来长安",
      "甘肃": "丝路明珠，壮美甘肃",
      "青海": "大美青海，三江之源",
      "宁夏": "塞上江南，神奇宁夏",
      "新疆": "大美新疆，亚克西",
      "台湾": "宝岛台湾，血脉相连",
      "香港": "东方之珠，魅力香港",
      "澳门": "莲花宝地，中西交融",
      "其他": "欢迎来到我的博客✨"
    },
    "美国": "Hello! Welcome from the USA 🇺🇸",
    "日本": "ようこそ！一緒に桜を見ましょう 🌸",
    "俄罗斯": "Привет! 来自战斗民族的朋友 🇷🇺",
    "法国": "Bonjour! C'est la vie 🇫🇷",
    "德国": "Hallo! 严谨与浪漫的结合 🇩🇪",
    "澳大利亚": "G'day! 欢迎来到南半球 🇦🇺",
    "加拿大": "Hello! 枫叶之国欢迎你 🇨🇦",
    "其他": "Welcome! 世界因你而精彩 🌍"
  };

  // 获取缓存
  function getFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CONFIG.CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  // 设置缓存
  function setToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.warn('[Visitor] Cache failed:', e);
    }
  }

  // 获取时间问候
  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 11) return "早上好🌤️ 一日之计在于晨";
    if (h < 13) return "中午好☀️ 记得午休喔~";
    if (h < 17) return "下午好🕞 饮茶先啦！";
    if (h < 19) return "即将下班🚶‍♂️ 记得按时吃饭~";
    return "晚上好🌙 夜生活嗨起来！";
  }

  // 解析地址
  function parseAddress(address) {
    if (!address) return { country: '其他', province: '', city: '' };

    let country = '其他';
    let addr = address.trim();

    if (addr.startsWith('中国')) {
      country = '中国';
      addr = addr.substring(2);
    } else if (addr.includes('台湾')) {
      country = '台湾';
    } else if (addr.includes('香港')) {
      country = '香港特别行政区';
    } else if (addr.includes('澳门')) {
      country = '澳门特别行政区';
    } else if (/[A-Za-z]/.test(addr)) {
      country = addr.split(',')[0]?.trim() || '其他';
      return { country, province: '', city: '' };
    }

    if (country !== '中国') {
      return { country, province: '', city: '' };
    }

    let province = '';
    let remaining = addr;

    for (const prov of PROVINCES) {
      if (addr.startsWith(prov)) {
        province = prov;
        remaining = addr.substring(prov.length);
        break;
      }
    }

    let city = '未知';
    if (remaining) {
      remaining = remaining.replace(/^[省市自治区]/, '');
      const cityMatch = remaining.match(/^([\u4e00-\u9fa5]+?(?:市|地区|自治州|州|盟|县|区|旗)?)$/);
      if (cityMatch && cityMatch[1]) {
        city = cityMatch[1];
      }
      if (['北京市', '天津市', '上海市', '重庆市'].includes(province)) {
        city = province.replace('市', '') + (remaining ? ' ' + remaining : '');
      }
    }

    const provinceKey = province
      .replace('省', '')
      .replace('自治区', '')
      .replace('特别行政区', '')
      .replace('市', '');

    return { country, province, provinceKey, city };
  }

  // 格式化 IP 显示
  function formatIp(ip) {
    if (!ip) return '未知';
    return ip.includes(":") ? "IPv6 地址" : ip;
  }

  // 格式化位置
  function formatLocation(country, province, city) {
    if (!country) return '神秘地区';
    if (country === '中国') {
      if (['北京市', '天津市', '上海市', '重庆市'].includes(province)) {
        return province;
      }
      if (city && city !== '未知') {
        return `${province} ${city}`;
      }
      return province;
    }
    return country;
  }

  // 获取欢迎语
  function getGreeting(country, provinceKey) {
    const countryData = GREETINGS[country];
    if (!countryData) return GREETINGS["其他"];
    if (typeof countryData === 'string') return countryData;
    return countryData[provinceKey] || countryData["其他"] || GREETINGS["其他"];
  }

  // 显示加载状态
  function showLoading(element) {
    element.innerHTML = `
      <div class="visitor-loading">
        <div class="visitor-spinner"></div>
        <span>正在获取位置信息...</span>
      </div>
    `;
  }

  // 显示错误信息
  function showError(element, message = '获取信息失败') {
    element.innerHTML = `
      <div class="visitor-error">
        <div class="visitor-error-icon">😕</div>
        <p>${message}</p>
        <button class="visitor-retry" onclick="window.initVisitorWidget && window.initVisitorWidget()">🔄 重试</button>
      </div>
    `;
  }

  // 显示欢迎信息
  function showWelcome(element, data) {
    const apiData = data?.data || data;
    const userIp = apiData?.ip || data?.ip;

    if (!apiData?.address && !data?.address) {
      showError(element, '无法获取位置信息');
      return;
    }

    const address = apiData?.address || data?.address || '';
    const { country, province, provinceKey, city } = parseAddress(address);
    const ipDisplay = formatIp(userIp);
    const pos = formatLocation(country, province, city);
    const greeting = getGreeting(country, provinceKey);
    const timeGreeting = getTimeGreeting();

    element.innerHTML = `
      <div class="visitor-content">
        <div class="visitor-line">
          <span class="visitor-icon">📍</span>
          欢迎来自 <strong>${pos}</strong> 的朋友
        </div>
        <div class="visitor-line">
          <span class="visitor-icon">🌐</span>
          你的 IP：<span class="visitor-ip" title="点击显示" onclick="this.classList.toggle('show')">${ipDisplay}</span>
        </div>
        <div class="visitor-line">
          <span class="visitor-icon">⏰</span>
          ${timeGreeting}
        </div>
        <div class="visitor-greeting">
          <span class="visitor-tip">💡</span>
          <span>${greeting}</span>
        </div>
      </div>
    `;
  }

  // 获取 IP 信息
  async function fetchIpInfo() {
    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
      if (result?.code !== 200 && !result?.data) {
        throw new Error('API error');
      }
      return result;
    } catch (error) {
      console.warn('[Visitor] Primary API failed, trying fallback:', error);
      // 备用 API
      try {
        const response = await fetch(CONFIG.FALLBACK_API);
        if (!response.ok) throw new Error('Fallback API error');
        const data = await response.json();
        return {
          data: {
            ip: data.ip,
            address: `${data.country} ${data.region} ${data.city}`
          }
        };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }

  // 初始化组件
  async function initVisitorWidget() {
    const containers = document.querySelectorAll('#welcome-info, .visitor-widget-content, [data-visitor-widget]');
    if (containers.length === 0) return;

    containers.forEach(async (container) => {
      // 检查缓存
      const cached = getFromCache();
      if (cached) {
        showWelcome(container, cached);
        return;
      }

      showLoading(container);

      try {
        const data = await fetchIpInfo();
        setToCache(data);
        showWelcome(container, data);
      } catch (error) {
        console.error('[Visitor] Failed to fetch:', error);
        showError(container);
      }
    });
  }

  // 暴露到全局
  window.initVisitorWidget = initVisitorWidget;

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorWidget);
  } else {
    initVisitorWidget();
  }

  // PJAX 适配
  document.addEventListener('pjax:complete', initVisitorWidget);
  document.addEventListener('pjax:end', initVisitorWidget);

  console.log('[Visitor Widget] Initialized');
})();
