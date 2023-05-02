/**
 * 将 HTML 字符串转换为 Element
 *
 * @param htmlStr 用于转换为 element 的 html 字符串
 * @return ChildNode
 */
function htmlToElement(htmlStr) {
    const template = document.createElement('template');
    template.innerHTML = htmlStr.trim();
    return template.content.firstChild;
}

let fullScreen = false;
let readerTopBarMaxWidth, appContentMaxWidth, readerControlsLeft;

function runFullScreen() {
    // 阅读页面顶部工具栏
    let readerTopBar = document.querySelector('div.readerTopBar');
    // 内容显示区域
    let appContent = document.querySelector('div.app_content');
    // 左侧控件工具栏
    let readerControls = document.querySelector('div.readerControls');

    fullScreen = !fullScreen;

    if (fullScreen) {
        readerTopBarMaxWidth = readerTopBar.style.maxWidth;
        readerTopBar.style.maxWidth = 'none';

        appContentMaxWidth = appContent.style.maxWidth;
        appContent.style.maxWidth = 'none';

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

// 将按钮添加到控制栏
function appendFullScreenItem() {
    try {
        let fullScreenItem = htmlToElement(
            '<button title="全屏" class="readerControls_item full"><span class="icon"></span></button>'
        );
        fullScreenItem.addEventListener('click', runFullScreen);
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
