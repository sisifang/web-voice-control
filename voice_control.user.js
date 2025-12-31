// ==UserScript==
// @name         网页视频语音助手 (全网通用版 v2.6)
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  语音控制网页视频：穿透Shadow DOM支持飞书文档、强力全屏修复。
// @author       TraeAI
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === 配置中心 ===
    const CONFIG = {
        lang: 'zh-CN',
        continuous: true,
        storageKey: 'voice_control_listening_state',
        autoStartHosts: [
            'www.baidu.com', 'm.baidu.com',
            'www.google.com', 'www.google.com.hk',
            'cn.bing.com', 'www.bing.com'
        ]
    };

    // === 状态管理 ===
    let recognition = null;
    let isListening = false;
    let statusDiv = null;

    // === 屏蔽 APP 弹窗样式 ===
    const ANTI_APP_STYLE = `
        .m-float-openapp, .open-app-btn, .launch-app-btn, .m-video-main-panel-openapp,
        .mobile-topbar-header-content.non-search-mode, .promoted-sparkles-text-search-root-container,
        [class*="openapp"], [class*="download-app"] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    `;

    // === 站点适配器 ===
    const ADAPTERS = {
        'bilibili': {
            names: ['b站', '哔哩哔哩', 'bilibili'],
            home: 'https://m.bilibili.com',
            searchUrl: (kw) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(kw)}`,
            getResults: () => Array.from(document.querySelectorAll('.video-list .video-item, .bili-video-card, .v-card-single, .card-box, .m-video-card')),
            playResult: (el) => clickElement(el.querySelector('a') || el)
        },
        'youtube': {
            names: ['油管', 'youtube', '优图'],
            home: 'https://m.youtube.com',
            searchUrl: (kw) => `https://m.youtube.com/results?search_query=${encodeURIComponent(kw)}`,
            getResults: () => Array.from(document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytm-video-with-context-renderer')),
            playResult: (el) => clickElement(el.querySelector('a') || el)
        }
    };

    // === 核心黑科技：Shadow DOM 穿透查找器 ===
    // 递归遍历所有 Shadow Root 寻找 video 元素
    function findAllVideos(root = document) {
        let videos = Array.from(root.querySelectorAll('video'));
        
        // 遍历所有子元素，看有没有 shadowRoot
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.shadowRoot) {
                videos = videos.concat(findAllVideos(node.shadowRoot));
            }
        }
        return videos;
    }

    // === 核心工具：智能寻找最佳视频 ===
    function findTargetVideo() {
        // 1. 全局扫描（含 Shadow DOM）
        const videos = findAllVideos(document);
        
        if (videos.length === 0) return null;

        // 2. 优先：正在播放的
        const playing = videos.find(v => !v.paused && v.currentTime > 0);
        if (playing) return playing;

        // 3. 优先：飞书特定逻辑 (飞书视频通常很大)
        // 4. 兜底：返回面积最大的
        return videos.reduce((prev, curr) => {
            const prevRect = prev.getBoundingClientRect();
            const currRect = curr.getBoundingClientRect();
            // 过滤掉不可见的（宽高为0）
            if (currRect.width === 0) return prev;
            return (currRect.width * currRect.height) > (prevRect.width * prevRect.height) ? curr : prev;
        });
    }

    // === 核心工具：全屏触发器 ===
    function triggerFullScreen(video) {
        if (!video) return;

        // 策略 1: 查找播放器周边的“全屏按钮”并点击 (最稳)
        // 我们从 video 往上找父级，在父级里搜寻常见的全屏按钮特征
        let container = video.parentElement;
        let fsBtn = null;
        
        // 向上查找 5 层
        for (let i = 0; i < 5; i++) {
            if (!container) break;
            // 匹配常见的全屏按钮 class 或 title
            fsBtn = container.querySelector(
                '.bpx-player-ctrl-full, .ytp-fullscreen-button, [aria-label*="全屏"], [title*="全屏"], .fullscreen-btn, .ud-fullscreen-btn'
            );
            if (fsBtn) break;
            container = container.parentElement || container.parentNode; // 兼容 Shadow DOM
        }

        if (fsBtn) {
            console.log('找到全屏按钮，模拟点击');
            clickElement(fsBtn);
            return;
        }

        // 策略 2: iOS 原生 API
        if (video.webkitEnterFullscreen) {
            try {
                video.webkitEnterFullscreen();
            } catch(e) { console.error('iOS全屏失败', e); }
            return;
        }

        // 策略 3: 标准 API
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    }

    // === 模拟真实点击 ===
    function clickElement(el) {
        if (!el) return;
        ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(evt => {
            el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
        });
        if (el.click) el.click();
    }

    // === 初始化逻辑 ===
    function init() {
        injectStyle();
        initUI();
        initRecognition();
        
        if (CONFIG.autoStartHosts.some(h => window.location.hostname.includes(h))) {
            setTimeout(() => { if (!isListening) startListening(false); }, 800);
            return;
        }
        if (localStorage.getItem(CONFIG.storageKey) === 'true') {
            setTimeout(() => { if (!isListening) startListening(true); }, 500);
        }
    }

    function injectStyle() {
        const style = document.createElement('style');
        style.textContent = ANTI_APP_STYLE;
        document.head.appendChild(style);
    }

    function initUI() {
        statusDiv = document.createElement('div');
        Object.assign(statusDiv.style, {
            position: 'fixed', bottom: '20px', right: '20px', zIndex: '2147483647',
            padding: '12px', borderRadius: '50%', backgroundColor: '#f44336',
            color: 'white', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            width: '24px', height: '24px', fontSize: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease', userSelect: 'none', webkitTapHighlightColor: 'transparent'
        });
        statusDiv.innerHTML = '🎤';
        statusDiv.onclick = toggleListening;
        document.body.appendChild(statusDiv);
    }

    function initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('不支持 Web Speech API');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = CONFIG.lang;
        recognition.continuous = CONFIG.continuous;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            statusDiv.style.backgroundColor = '#4CAF50';
            statusDiv.style.transform = 'scale(1.1)';
        };

        recognition.onend = () => {
            if (isListening) recognition.start();
            else {
                statusDiv.style.backgroundColor = '#f44336';
                statusDiv.style.transform = 'scale(1)';
            }
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript.trim();
            showToast('🗣️ ' + text);
            processCommand(text);
        };
        
        recognition.onerror = (e) => {
            if (e.error === 'not-allowed') {
                isListening = false;
                localStorage.setItem(CONFIG.storageKey, 'false');
                showToast('❌ 请允许麦克风权限');
            }
        };
    }

    function toggleListening() {
        if (isListening) {
            stopListening();
            showToast('🔴 已关闭');
        } else {
            startListening();
        }
    }

    function startListening(silent = false) {
        try {
            recognition.start();
            isListening = true;
            localStorage.setItem(CONFIG.storageKey, 'true');
            if (!silent) showToast('🟢 已启动');
        } catch (e) { console.error(e); }
    }

    function stopListening() {
        isListening = false;
        recognition.stop();
        localStorage.setItem(CONFIG.storageKey, 'false');
    }

    // === 指令处理 ===
    function processCommand(rawText) {
        let text = rawText.toLowerCase().replace(/[ ，,。.?!？！]/g, '');
        const map = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
        text = text.replace(/[一二三四五六七八九十]/g, m => map[m]);

        // 查找视频 (含 Shadow DOM)
        const video = findTargetVideo();

        // 1. 导航
        if (text.match(/^(打开|去|启动)/)) {
            for (let key in ADAPTERS) {
                if (ADAPTERS[key].names.some(n => text.includes(n))) {
                    showToast(`🚀 前往 ${key}`);
                    window.location.href = ADAPTERS[key].home;
                    return;
                }
            }
        }

        // 2. 搜索
        if (text.includes('搜索') || text.includes('找')) {
            let targetSite = null;
            let keyword = text;
            for (let key in ADAPTERS) {
                if (ADAPTERS[key].names.some(n => text.includes(n))) {
                    targetSite = key;
                    ADAPTERS[key].names.forEach(n => keyword = keyword.replace(n, ''));
                    break;
                }
            }
            keyword = keyword.replace(/搜索|找|查|一下|帮我/g, '').trim();
            if (keyword) {
                const adapter = targetSite ? ADAPTERS[targetSite] : 
                              (window.location.hostname.includes('youtube') ? ADAPTERS['youtube'] : ADAPTERS['bilibili']);
                window.location.href = adapter.searchUrl(keyword);
                return;
            }
        }

        // 3. 列表播放
        if (text.match(/播放第(\d+)个/)) {
            const index = parseInt(text.match(/播放第(\d+)个/)[1]) - 1;
            let adapter = window.location.hostname.includes('youtube') ? ADAPTERS['youtube'] : ADAPTERS['bilibili'];
            const results = adapter.getResults();
            if (results[index]) {
                showToast(`▶️ 播放第 ${index+1} 个`);
                adapter.playResult(results[index]);
            } else {
                showToast(`⚠️ 找不到第 ${index+1} 个`);
            }
            return;
        }

        // 4. 视频控制
        if (!video) {
            // showToast('⚠️ 未找到视频'); // 可选：调试用
            return; 
        }

        // [优先级调整] 先判断全屏，防止 "全屏播放" 被 "播放" 截胡
        if (text.match(/全屏|最大化/)) {
             showToast('📺 全屏');
             triggerFullScreen(video);
        }

        else if (text.match(/播放|开始|继续/)) { video.play(); showToast('▶️ 播放'); }
        else if (text.match(/暂停|停止/)) { video.pause(); showToast('⏸️ 暂停'); }
        else if (text.match(/快进|前进/)) { video.currentTime += 15; showToast('⏩ +15s'); }
        else if (text.match(/倒退|后退/)) { video.currentTime -= 15; showToast('⏪ -15s'); }
        
        else if (text.match(/(\d+(\.\d+)?)倍/)) {
            const rate = parseFloat(text.match(/(\d+(\.\d+)?)倍/)[1]);
            video.playbackRate = rate; showToast(`🚀 ${rate}x`);
        }
        else if (text.match(/正常速度|恢复/)) { video.playbackRate = 1.0; showToast('🚗 1.0x'); }

        // 5. 关闭
        else if (text.match(/关闭监听|休息/)) {
            stopListening();
            showToast('😴 已休眠');
        }
    }

    function showToast(msg) {
        let toast = document.getElementById('voice-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'voice-toast';
            Object.assign(toast.style, {
                position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 16px',
                borderRadius: '20px', zIndex: '2147483647', fontSize: '14px', fontWeight: 'bold',
                transition: 'opacity 0.2s', pointerEvents: 'none', whiteSpace: 'nowrap',
                backdropFilter: 'blur(4px)'
            });
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }

    setTimeout(init, 1000);

})();
