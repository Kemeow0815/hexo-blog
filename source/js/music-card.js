// 音乐卡片组件 - 适配 Stellar 主题
// 支持本地音乐、Meting API、多端适配、PJAX

(function () {
  "use strict";

  // 默认配置
  const DEFAULT_CONFIG = {
    // 本地音乐列表（当不启用 Meting API 时使用）
    localPlaylist: [
      {
        name: "示例歌曲",
        artist: "未知艺术家",
        url: "/music/song1.mp3",
        pic: "/images/music-cover.jpg",
      },
    ],
    // Meting API 配置
    meting: {
      enable: false, // 是否启用 Meting API
      api: "https://api.i-meto.com/meting/api",
      server: "netease", // netease, tencent, kugou, xiami, baidu
      type: "playlist", // playlist, album, artist, song
      id: "", // 歌单/专辑/艺人 ID
    },
    // 组件配置
    autoplay: false,
    random: true, // 随机播放
    cacheDuration: 1000 * 60 * 60, // 歌单缓存时间（1小时）
  };

  // 获取配置
  function getConfig() {
    if (window.MUSIC_CARD_CONFIG) {
      return Object.assign({}, DEFAULT_CONFIG, window.MUSIC_CARD_CONFIG);
    }
    return DEFAULT_CONFIG;
  }

  // 缓存管理
  const CACHE_KEY = "music_card_cache";

  function getCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp, config } = JSON.parse(cached);
      const config_now = getConfig();
      // 检查缓存是否过期或配置是否改变
      if (
        Date.now() - timestamp > config_now.meting.cacheDuration ||
        JSON.stringify(config) !== JSON.stringify(config_now.meting)
      ) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(data, config) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          config,
        }),
      );
    } catch (e) {
      console.warn("[MusicCard] Cache failed:", e);
    }
  }

  // 获取歌单数据
  async function fetchPlaylist(config) {
    // 如果启用了 Meting API
    if (config.meting && config.meting.enable && config.meting.id) {
      const cache = getCache();
      if (cache) {
        console.log("[MusicCard] Using cached playlist");
        return cache;
      }

      try {
        const { api, server, type, id } = config.meting;
        const url = `${api}?server=${server}&type=${type}&id=${id}`;
        const response = await fetch(url, { timeout: 10000 });
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCache(data, config.meting);
          return data;
        }
      } catch (error) {
        console.warn(
          "[MusicCard] Meting API failed, using local playlist:",
          error,
        );
      }
    }

    // 使用本地音乐列表
    return config.localPlaylist || [];
  }

  // 格式化时间
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // 音乐卡片类
  class MusicCard {
    constructor(container, config) {
      this.container = container;
      this.config = config;
      this.audio = null;
      this.playlist = [];
      this.currentIndex = 0;
      this.history = [];
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
      this.isDragging = false;

      this.init();
    }

    async init() {
      this.renderSkeleton();
      this.playlist = await fetchPlaylist(this.config);

      if (this.playlist.length === 0) {
        this.renderError("暂无音乐");
        return;
      }

      // 随机选择第一首
      if (this.config.random) {
        this.currentIndex = Math.floor(Math.random() * this.playlist.length);
      }

      this.render();
      this.bindEvents();
    }

    renderSkeleton() {
      this.container.innerHTML = `
        <div class="music-card-skeleton">
          <div class="music-card-header">
            <div class="music-cover skeleton"></div>
            <div class="music-info">
              <div class="music-name skeleton"></div>
              <div class="music-artist skeleton"></div>
            </div>
          </div>
          <div class="music-controls skeleton">
            <div class="ctrl-btn"></div>
            <div class="ctrl-btn play"></div>
            <div class="ctrl-btn"></div>
          </div>
          <div class="music-progress skeleton">
            <div class="progress-bar"></div>
            <div class="time-info">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
    }

    renderError(message) {
      this.container.innerHTML = `
        <div class="music-card-error">
          <div class="error-icon">🎵</div>
          <p>${message}</p>
        </div>
      `;
    }

    render() {
      const song = this.playlist[this.currentIndex];
      if (!song) return;

      this.container.innerHTML = `
        <div class="music-card ${this.isPlaying ? "is-playing" : ""}" data-index="${this.currentIndex}">
          <audio class="music-audio" preload="metadata">
            <source src="${song.url}" type="audio/mpeg">
          </audio>
          
          <div class="music-card-header">
            <div class="music-cover-wrapper">
              <img class="music-cover" src="${song.pic || "/images/music-default.jpg"}" alt="${song.name}" loading="lazy">
              <div class="music-cover-overlay">
                <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg class="pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </div>
            </div>
            <div class="music-info">
              <div class="music-name" title="${song.name}">${song.name}</div>
              <div class="music-artist" title="${song.artist}">${song.artist}</div>
            </div>
          </div>
          
          <div class="music-controls">
            <button class="ctrl-btn prev" title="上一首">
              <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="ctrl-btn play-pause" title="${this.isPlaying ? "暂停" : "播放"}">
              <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg class="pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="ctrl-btn next" title="下一首">
              <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
          
          <div class="music-progress">
            <div class="progress-bar">
              <div class="progress-track"></div>
              <div class="progress-fill" style="width: 0%"></div>
              <div class="progress-thumb"></div>
            </div>
            <div class="time-info">
              <span class="current-time">0:00</span>
              <span class="duration">0:00</span>
            </div>
          </div>
          
          <div class="music-volume">
            <svg class="volume-icon" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input type="range" class="volume-slider" min="0" max="100" value="80">
          </div>
        </div>
      `;

      this.audio = this.container.querySelector(".music-audio");

      // 恢复音量
      const savedVolume = localStorage.getItem("music_card_volume");
      if (savedVolume !== null) {
        this.audio.volume = parseInt(savedVolume) / 100;
        this.container.querySelector(".volume-slider").value =
          parseInt(savedVolume);
      } else {
        this.audio.volume = 0.8;
      }
    }

    bindEvents() {
      if (!this.audio) return;

      // 音频事件
      this.audio.addEventListener("play", () => {
        this.isPlaying = true;
        this.updatePlayState();
      });

      this.audio.addEventListener("pause", () => {
        this.isPlaying = false;
        this.updatePlayState();
      });

      this.audio.addEventListener("ended", () => {
        this.next();
      });

      this.audio.addEventListener("timeupdate", () => {
        if (!this.isDragging) {
          this.currentTime = this.audio.currentTime;
          this.updateProgress();
        }
      });

      this.audio.addEventListener("loadedmetadata", () => {
        this.duration = this.audio.duration;
        this.container.querySelector(".duration").textContent = formatTime(
          this.duration,
        );
      });

      // 监听跳转完成事件
      this.audio.addEventListener("seeked", () => {
        const actualTime = this.audio.currentTime;
        const expectedTime = this.currentTime;

        console.log("[MusicCard] Seeked to:", formatTime(actualTime));

        // 检测是否支持跳转（如果实际位置与预期位置相差超过 2 秒）
        if (Math.abs(actualTime - expectedTime) > 2 && expectedTime > 2) {
          console.warn(
            "[MusicCard] Audio may not support seeking. Expected:",
            formatTime(expectedTime),
            "Actual:",
            formatTime(actualTime),
          );
          this.showSeekWarning();
        }

        this.currentTime = actualTime;
        this.updateProgress();
      });

      // 监听跳转开始事件
      this.audio.addEventListener("seeking", () => {
        console.log("[MusicCard] Seeking...");
      });

      // 监听错误事件
      this.audio.addEventListener("error", (e) => {
        console.error("[MusicCard] Audio error:", e);
      });

      // 控制按钮
      this.container
        .querySelector(".play-pause")
        .addEventListener("click", () => {
          this.togglePlay();
        });

      this.container.querySelector(".prev").addEventListener("click", () => {
        this.prev();
      });

      this.container.querySelector(".next").addEventListener("click", () => {
        this.next();
      });

      // 进度条拖动
      const progressBar = this.container.querySelector(".progress-bar");
      const progressTrack = this.container.querySelector(".progress-track");
      const progressFill = this.container.querySelector(".progress-fill");
      const thumb = this.container.querySelector(".progress-thumb");

      // 点击进度条任意位置跳转
      const handleProgressClick = (e) => {
        if (this.isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = progressBar.getBoundingClientRect();
        const clientX =
          e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        console.log("[MusicCard] Seek to:", percent * 100 + "%");
        this.seek(percent);
      };

      progressBar.addEventListener("click", handleProgressClick);
      progressTrack.addEventListener("click", handleProgressClick);
      progressFill.addEventListener("click", handleProgressClick);

      // 拖动功能
      let startX,
        startPercent,
        hasDragged = false;

      const onDragStart = (e) => {
        this.isDragging = true;
        hasDragged = false;
        startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
        const rect = progressBar.getBoundingClientRect();
        startPercent = (startX - rect.left) / rect.width;
        e.preventDefault();

        // 添加拖动中的样式
        this.container.classList.add("is-dragging");
      };

      const onDragMove = (e) => {
        if (!this.isDragging) return;
        hasDragged = true;
        const clientX = e.type.includes("touch")
          ? e.touches[0].clientX
          : e.clientX;
        const rect = progressBar.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        this.updateProgressUI(percent);
      };

      const onDragEnd = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.container.classList.remove("is-dragging");

        // 如果发生了拖动，阻止后续的点击事件
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }

        const clientX = e.type.includes("touch")
          ? e.changedTouches
            ? e.changedTouches[0].clientX
            : startX
          : e.clientX;
        const rect = progressBar.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        console.log(
          "[MusicCard] Drag end, seek to:",
          (percent * 100).toFixed(1) + "%",
        );
        this.seek(percent);

        // 重置标记
        setTimeout(() => {
          hasDragged = false;
        }, 100);
      };

      thumb.addEventListener("mousedown", onDragStart);
      thumb.addEventListener("touchstart", onDragStart, { passive: false });
      document.addEventListener("mousemove", onDragMove);
      document.addEventListener("touchmove", onDragMove, { passive: false });
      document.addEventListener("mouseup", onDragEnd);
      document.addEventListener("touchend", onDragEnd);

      // 音量控制
      const volumeSlider = this.container.querySelector(".volume-slider");
      volumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value / 100;
        this.audio.volume = volume;
        localStorage.setItem("music_card_volume", e.target.value);
      });

      // 封面点击播放/暂停
      const coverWrapper = this.container.querySelector(".music-cover-wrapper");
      if (coverWrapper) {
        coverWrapper.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.togglePlay();
        });
      }
    }

    togglePlay() {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play().catch((err) => {
          console.warn("[MusicCard] Play failed:", err);
        });
      }
    }

    prev() {
      if (this.history.length > 0) {
        this.currentIndex = this.history.pop();
      } else {
        this.currentIndex =
          (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      }
      this.loadAndPlay();
    }

    next() {
      this.history.push(this.currentIndex);

      if (this.config.random && this.playlist.length > 1) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * this.playlist.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
      } else {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      }

      this.loadAndPlay();
    }

    loadAndPlay() {
      const song = this.playlist[this.currentIndex];
      if (!song) return;

      this.audio.src = song.url;
      this.audio.load();

      // 更新封面和信息
      const cover = this.container.querySelector(".music-cover");
      const name = this.container.querySelector(".music-name");
      const artist = this.container.querySelector(".music-artist");

      cover.src = song.pic || "/images/music-default.jpg";
      cover.alt = song.name;
      name.textContent = song.name;
      name.title = song.name;
      artist.textContent = song.artist;
      artist.title = song.artist;

      this.audio.play().catch((err) => {
        console.warn("[MusicCard] Auto-play failed:", err);
      });
    }

    seek(percent) {
      if (!this.audio) return;

      // 确保音频已加载且有 duration
      const duration = this.audio.duration || this.duration;
      if (!duration || isNaN(duration) || duration === Infinity) {
        console.warn("[MusicCard] Cannot seek: duration not available");
        return;
      }

      const newTime = percent * duration;
      console.log(
        "[MusicCard] Seeking to:",
        formatTime(newTime),
        "/",
        formatTime(duration),
      );

      try {
        this.audio.currentTime = newTime;
        this.currentTime = newTime;
        this.duration = duration;
        this.updateProgress();
      } catch (err) {
        console.error("[MusicCard] Seek failed:", err);
      }
    }

    updateProgress() {
      if (!this.audio || !this.duration) return;

      // 从音频元素获取最新的 currentTime
      const currentTime = this.audio.currentTime || this.currentTime || 0;
      const duration = this.audio.duration || this.duration || 1;

      const percent = currentTime / duration;
      this.updateProgressUI(percent);
      this.container.querySelector(".current-time").textContent =
        formatTime(currentTime);
    }

    updateProgressUI(percent) {
      this.container.querySelector(".progress-fill").style.width =
        `${percent * 100}%`;
      this.container.querySelector(".progress-thumb").style.left =
        `${percent * 100}%`;
    }

    updatePlayState() {
      const card = this.container.querySelector(".music-card");
      const playPauseBtn = this.container.querySelector(".play-pause");

      if (this.isPlaying) {
        card.classList.add("is-playing");
        playPauseBtn.title = "暂停";
      } else {
        card.classList.remove("is-playing");
        playPauseBtn.title = "播放";
      }
    }

    showSeekWarning() {
      // 显示不支持跳转的提示
      const warningEl = this.container.querySelector(".music-seek-warning");
      if (!warningEl) {
        const warning = document.createElement("div");
        warning.className = "music-seek-warning";
        warning.innerHTML = "⚠️ 当前音频不支持进度跳转";
        warning.style.cssText =
          "font-size: 11px; color: #ff9800; text-align: center; margin-top: 4px;";
        this.container.querySelector(".music-card").appendChild(warning);

        // 3秒后自动隐藏
        setTimeout(() => {
          warning.remove();
        }, 3000);
      }
    }

    destroy() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
    }
  }

  // 初始化所有音乐卡片
  function initMusicCards() {
    const containers = document.querySelectorAll(
      ".music-card-widget, [data-music-card]",
    );

    containers.forEach((container) => {
      // 如果已经初始化过，先销毁
      if (container._musicCard) {
        container._musicCard.destroy();
      }

      const config = getConfig();
      container._musicCard = new MusicCard(container, config);
    });
  }

  // 暴露到全局
  window.MusicCard = MusicCard;
  window.initMusicCards = initMusicCards;

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMusicCards);
  } else {
    initMusicCards();
  }

  // PJAX 适配
  document.addEventListener("pjax:complete", () => {
    console.log("[MusicCard] PJAX complete, reinitializing...");
    initMusicCards();
  });

  document.addEventListener("pjax:end", () => {
    initMusicCards();
  });

  console.log("[MusicCard] Initialized");
})();
