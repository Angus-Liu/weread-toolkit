/**
 * @param {String} HTML 用于转换为 element 的 html 字符串
 * @return {Element}
 */
function htmlToElement (html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

let fullScreen = false;
let readerTopBarMaxWidth, appContentMaxWidth, readerControlsLeft;

function runFullScreen () {
    let readerTopBar = document.querySelector('div.readerTopBar');
    let appContent = document.querySelector('div.app_content');
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
    let resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
}

let retryTimes = 3;

// 将按钮添加到控制栏
function appendFullScreenItem () {
    try {
        let themeStyle = document.querySelector('button.readerControls_item.theme > span');
        let fullScreenItemSpan = htmlToElement('<span>全屏</span>');
        fullScreenItemSpan.style.color = themeStyle.style.color;

        // 监听主题按钮颜色变化，为全屏按钮设置样式
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == "attributes") {
                    if (mutation.target.dataset.color !== mutation.target.style.color) {
                        fullScreenItemSpan.style.color = mutation.target.style.color;
                    }
                }
            });
        }).observe(themeStyle, { attributes: true, attributeFilter: ['style'] });

        let fullScreenItem = htmlToElement('<button title="全屏" class="readerControls_item full"></button>');
        fullScreenItem.appendChild(fullScreenItemSpan);
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
