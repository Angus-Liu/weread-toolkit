/**
 * 将 HTML 字符串转换为 Element
 *
 * @param htmlStr 用于转换为 element 的 html 字符串
 * @return HTML Element
 */
function htmlToElement (htmlStr) {
    const template = document.createElement('template');
    template.innerHTML = htmlStr.trim();
    return template.content.firstChild;
}

let fullScreen = false;
let readerTopBarMaxWidth, appContentMaxWidth, readerControlsLeft;


/**
 * 全屏切换
 */
function updateScreen () {
    // 阅读页面顶部工具栏
    let readerTopBar = document.querySelector('div.readerTopBar');
    // 内容显示区域
    let appContent = document.querySelector('div.app_content');
    // 左侧控件工具栏
    let readerControls = document.querySelector('div.readerControls');
    if (fullScreen) {
        // 阅读页面顶部工具栏
        readerTopBarMaxWidth = readerTopBar.style.maxWidth;
        readerTopBar.style.maxWidth = 'none';
        // 内容显示区域
        appContentMaxWidth = appContent.style.maxWidth;
        appContent.style.maxWidth = 'none';
        // 左侧控件工具栏
        readerControlsLeft = readerControls.style.left;
        readerControls.style.left = 'unset';
        readerControls.style.right = '1%';
    } else {
        readerTopBar.style.maxWidth = readerTopBarMaxWidth;
        appContent.style.maxWidth = appContentMaxWidth;
        readerControls.style.left = readerControlsLeft;
        readerControls.style.right = 'unset';
    }

    // 主动触发 resize 事件，让 app_content 下的 wr_canvasContainer（canvas）进行重绘
    window.dispatchEvent(new Event('resize'));
}

let retryTimes = 3;

/**
 * 添加全屏按钮
 */
function appendFullScreenItem () {
    try {
        let fullScreenItem = htmlToElement(
            '<button title="全屏" class="readerControls_item full"><span class="icon"></span></button>'
        );
        fullScreenItem.addEventListener('click', () => {
            fullScreen = !fullScreen;
            updateScreen();
            chrome.storage.local.set({ fullScreen });
        });
        // 将按钮添加到控制栏
        let readerControls = document.querySelector('div.readerControls');
        readerControls.prepend(fullScreenItem);
    } catch (e) {
        if (retryTimes-- > 0) {
            // 进行失败重试
            setTimeout(appendFullScreenItem, 2000);
        } else {
            console.log(e);
        }
    }
}

// 延迟 2s 执行，避免其他 js 后执行覆盖掉修改
setTimeout(appendFullScreenItem, 2000);

// 加载历史配置
chrome.storage.local.get(["fullScreen"]).then((result) => {
    fullScreen = result.fullScreen;
    if (fullScreen) updateScreen();
});
