# 🎙️ Voice Control for Web Video | 网页视频语音助手

**A hands-free way to control web videos with your voice.**  
**一个解放双手的网页视频语音助手。**

👉 **[English Guide](#english)** | 👉 **[中文教程](#chinese)**

---

<a name="english"></a>
## 🇬🇧 English Guide

### What is this?
This is a lightweight UserScript that adds voice control capabilities to almost any video on the web (YouTube, Bilibili, Feishu Docs, etc.). It works seamlessly on **PC, Mac, iPad, and Android**.

Perfect for when you are cooking, washing dishes, or just feeling lazy! 🛋️

### Features
*   🗣️ **Natural Voice Commands**: "Play", "Pause", "Next video", "Full screen".
*   ⏩ **Speed Control**: "2x speed", "0.5x speed".
*   📱 **Mobile Friendly**: Optimized for iPad/iPhone Safari and Android.
*   🚫 **Anti-App Jump**: Prevents mobile browsers from forcefully opening Apps.
*   🔍 **Voice Search**: "Search [keyword]" automatically jumps to search results.

### Installation

1.  **Install a UserScript Manager**:
    *   **Chrome/Edge**: Install [Tampermonkey](https://www.tampermonkey.net/).
    *   **iOS (Safari)**: Install **Stay** or **Userscripts** (Free on App Store).
    *   **Android**: Use **Kiwi Browser** or **Firefox** and install Tampermonkey.

2.  **Install the Script**:
    *   [Click here to install](voice_control.user.js) (If you are viewing this locally).
    *   Or copy the content of `voice_control.user.js` and create a new script in your manager.

### Usage
1.  Open any website (e.g., YouTube).
2.  Click the **red microphone icon** 🎤 at the bottom right to start listening.
3.  Say commands like:
    *   "Play" / "Pause"
    *   "Full screen"
    *   "2x speed"
    *   "Search funny cats"

### Optional: iOS Siri Shortcut Combo
1.  On your iPhone or iPad, open the **Shortcuts** app.
2.  Create a new shortcut, for example **“Watch video”**:
    *   Add an **“Open URL”** action with your favorite video site (YouTube, Bilibili, etc.).
    *   (Optional) Add another **“Open URL”** to jump directly to a playlist or search result.
3.  Next time, say **“Hey Siri, watch video”** and your browser will open that page.
4.  Tap the red microphone icon once to grant microphone permission, then control videos by voice as usual.

### Limitations
*   Works only for videos playing **inside a web browser tab**.
*   Cannot control videos inside **native Apps** (Bilibili App, YouTube App, iQIYI App, etc.).
*   Due to browser security, the script **cannot** bypass microphone permission popups or start recording without any user interaction.

---

<a name="chinese"></a>
## 🇨🇳 中文教程

### 这是什么？
这是一个极简的浏览器插件（脚本），让你能用声音控制网页上的视频。支持 B站、YouTube、飞书文档等几乎所有网页视频。
特别适合**洗脸、做饭、葛优瘫**时使用！🛁

### 功能亮点
*   🗣️ **自然语言控制**：“播放”、“暂停”、“快进”、“全屏播放”。
*   🚀 **任意倍速**：喊“两倍速”、“一点五倍速”、“三倍速”都可以。
*   📱 **手机/平板优化**：iPad 上全屏体验丝滑，不会乱跳 APP。
*   🔍 **语音搜片**：喊“在 B站 搜索 你的名字”，自动跳转搜索。
*   🤝 **Siri 联动**：配合 Siri 快捷指令，实现“Hey Siri 看视频” -> 自动打开浏览器并监听。

### 如何安装

#### 1. 准备工作（安装扩展）
*   **电脑 (Chrome/Edge/Safari)**: 安装 [Tampermonkey (油猴)](https://www.tampermonkey.net/) 插件。
*   **iPhone / iPad**: 去 App Store 下载 **"Stay"** 或 **"Userscripts"**（都是免费的 Safari 扩展）。
    *   *安装后记得去 设置 -> Safari -> 扩展 中启用它。*
*   **Android**: 下载 **Kiwi Browser** 或 **Firefox**，然后安装 Tampermonkey。

#### 2. 安装脚本
*   下载本项目中的 `voice_control.user.js` 文件。
*   **电脑/安卓**：将文件拖入浏览器，或在油猴管理面板中“添加新脚本”并粘贴代码。
*   **iPhone/iPad**: 在 Stay/Userscripts App 中点击右上角 `+`，选择“从文件导入”或粘贴代码。

### 怎么用？
1.  打开 B站、YouTube 或任何有视频的网页。
2.  点击右下角的 **红色麦克风 🎤**（变绿表示正在听）。
3.  对着屏幕喊：
    *   **“播放”、“暂停”、“快进”、“后退”**
    *   **“全屏播放”、“退出全屏”**
    *   **“两倍速”、“正常速度”**
    *   **“搜索 [关键词]”**
    *   **“关闭监听”** (休息一下)

### 推荐的 iOS 快捷指令小连招（可选）
1.  在 iPhone / iPad 上打开 **“快捷指令”** App。
2.  新建一个指令，例如“看视频”：
    *   添加一个 **“打开网址”** 操作，填入你常用的视频网站（如 `https://www.bilibili.com` 或 `https://www.youtube.com`）。
    *   （可选）再添加一个“打开网址”操作，直接指向某个收藏夹或搜索结果页面。
3.  以后对 Siri 说：**“嘿 Siri，看视频”**，Safari 就会自动打开到对应页面。
4.  第一次在这个网站使用时，点一下右下角**红色麦克风**授权，以后同一网站会记住你的选择。

### 使用范围与限制
*   只能控制 **浏览器标签页中的网页视频**（地址栏能看到网址的那种）。
*   无法控制 **独立 App 内的视频播放器**（例如 B站 App、YouTube App、爱奇艺 App 等）。
*   部分网站会非常积极地提示“在 App 中打开”；如果你不小心跳进 App，就无法用本脚本控制，只能回到浏览器页面。
*   出于浏览器安全限制，脚本**不能**自动绕过麦克风弹窗，也**不能**在你完全没有点击的情况下自动开始录音。

### ⚠️ 常见问题 (Pitfalls)
1.  **麦克风权限**：第一次在某个网站使用时，浏览器会弹窗询问麦克风权限，请务必选择 **“允许” (Always Allow)**，这样后续在同一网站上体验会更顺滑。
2.  **APP 乱跳**：如果手机老是自动跳到 B站/YouTube APP，请长按视频链接选择“在后台打开”，并拒绝一次“在 APP 中打开”的请求，浏览器通常就会记住你的偏好。

---
*Created with by sisi.*
