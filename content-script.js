/**
 * 将 HTML 字符串转换为 Element
 */
function htmlToElement(htmlStr) {
    if (typeof htmlStr !== 'string') {
        throw new TypeError('htmlStr 必须是字符串');
    }
    const template = document.createElement('template');
    template.innerHTML = htmlStr.trim();
    return template.content.firstElementChild;
}

const ORIGIN_STEP = 0;
const MAX_STEP = 5;
const RETRY_DELAY_MS = 200;
const MAX_RETRIES = 3;

/**
 * 本地存储操作
 */
function getWidthStep() {
    const step = parseInt(localStorage.getItem('weread_width_step') || '0', 10);
    return Math.min(Math.max(step, 0), MAX_STEP); // 防止负数或非法值
}

function setWidthStep(step) {
    const safeStep = Math.min(Math.max(step, 0), MAX_STEP);
    localStorage.setItem('weread_width_step', safeStep.toString());
}

/**
 * 获取页面元素
 */
function getPageElements() {
    const elements = {
        readerTopBar: document.querySelector('div.readerTopBar'),
        appContent: document.querySelector('div.app_content'),
        readerControls: document.querySelector('div.readerControls')
    };

    const missing = Object.entries(elements)
        .filter(([_, el]) => !el)
        .map(([name]) => name);

    if (missing.length > 0) {
        throw new Error(`页面元素未加载完成: ${missing.join(', ')}`);
    }

    return elements;
}

/**
 * 保存默认布局
 */
let defaultLayout = null;
function saveDefaultLayout() {
    const { readerTopBar, appContent, readerControls } = getPageElements();

    const readerTopBarStyle = getComputedStyle(readerTopBar);
    const appContentStyle = getComputedStyle(appContent);
    const readerControlsStyle = getComputedStyle(readerControls);

    defaultLayout = {
        readerTopBarMaxWidth: parseInt(readerTopBarStyle.maxWidth, 10) || 800,
        appContentMaxWidth: parseInt(appContentStyle.maxWidth, 10) || 800,
        readerControlsMarginLeft: parseInt(readerControlsStyle.marginLeft, 10) || 0,
        appContentWidth: parseInt(appContentStyle.width, 10) || 800
    };

    console.log('[WeRead Plugin] 保存默认布局:', defaultLayout);
}

/**
 * 更新页面布局
 */
function updateScreen() {
    try {
        if (!defaultLayout) {
            saveDefaultLayout();
        }

        const { readerTopBar, appContent, readerControls } = getPageElements();
        const { readerTopBarMaxWidth, appContentMaxWidth, readerControlsMarginLeft, appContentWidth } = defaultLayout;

        const currentStep = getWidthStep();
        const pageWidth = document.documentElement.clientWidth || window.innerWidth;

        switch (currentStep) {
            case ORIGIN_STEP:
                readerTopBar.style.maxWidth = `${readerTopBarMaxWidth}px`;
                appContent.style.maxWidth = `${appContentMaxWidth}px`;
                readerControls.style.marginLeft = `${readerControlsMarginLeft}px`;
                readerControls.style.left = '50%';
                readerControls.style.right = 'unset';
                break;
            case MAX_STEP:
                readerTopBar.style.maxWidth = 'none';
                appContent.style.maxWidth = 'none';
                readerControls.style.left = 'unset';
                readerControls.style.right = '1%';
                break;
            default: {
                const stepWidth = (pageWidth - appContentWidth) / MAX_STEP;
                const newWidth = appContentWidth + stepWidth * currentStep;

                appContent.style.maxWidth = `${newWidth}px`;
                readerTopBar.style.maxWidth = `${newWidth}px`;

                const deltaWidth = newWidth - appContentWidth;
                const newMarginLeft = readerControlsMarginLeft + deltaWidth / 2;

                readerControls.style.left = '50%';
                readerControls.style.marginLeft = `${newMarginLeft}px`;
                readerControls.style.right = 'unset';

                console.log('[WeRead Plugin] 更新页面布局:', { newWidth, newMarginLeft });
                break;
            }
        }

        window.dispatchEvent(new Event('resize'));
    } catch (e) {
        console.error('[WeRead Plugin] 更新页面布局失败:', e);
    }
}

/**
 * 控制按钮事件
 */
function handleLeftClick() {
    const nextStep = (getWidthStep() + 1) % (MAX_STEP + 1);
    setWidthStep(nextStep);
    updateScreen();
}

function handleRightClick(e) {
    e.preventDefault();
    const nextStep = (getWidthStep() === MAX_STEP) ? ORIGIN_STEP : MAX_STEP;
    setWidthStep(nextStep);
    updateScreen();
    console.log('[WeRead Plugin] 右键切换布局:', nextStep === MAX_STEP ? '全屏' : '恢复');
}

/**
 * 添加控制按钮
 */
function appendControlItems(retries = MAX_RETRIES) {
    try {
        const { readerControls } = getPageElements();

        if (readerControls.querySelector('.readerControls_item.full')) {
            console.log('[WeRead Plugin] 控制按钮已存在，跳过添加');
            return;
        }

        const widthControlItem = htmlToElement(`
            <button title="左键调节宽度，右键切换全屏" class="readerControls_item full">
                <span class="icon"></span>
            </button>
        `);

        widthControlItem.addEventListener('click', handleLeftClick);
        widthControlItem.addEventListener('contextmenu', handleRightClick);

        readerControls.prepend(widthControlItem);
        console.log('[WeRead Plugin] 控制按钮添加成功');
    } catch (e) {
        console.error('[WeRead Plugin] 添加控制按钮失败:', e);
        if (retries > 0) {
            console.log(`[WeRead Plugin] 重试添加控制按钮 (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            setTimeout(() => appendControlItems(retries - 1), RETRY_DELAY_MS);
        }
    }
}

/**
 * 初始化插件
 */
let pluginInitialized = false;
function initPlugin() {
    if (pluginInitialized) return;
    pluginInitialized = true;

    console.log('[WeRead Plugin] 开始初始化插件...');

    const init = () => {
        appendControlItems();
        const currentStep = getWidthStep();
        if (currentStep > 0) {
            console.log('[WeRead Plugin] 加载历史配置:', currentStep);
            updateScreen();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[WeRead Plugin] DOMContentLoaded 事件触发');
            setTimeout(init, RETRY_DELAY_MS);
        });
    } else {
        console.log('[WeRead Plugin] 页面已加载完成');
        setTimeout(init, RETRY_DELAY_MS);
    }
}

// 启动插件
initPlugin();