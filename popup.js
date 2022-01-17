let fullScreenCb = document.getElementById('fullScreenCb');

fullScreenCb.addEventListener('change', (event) => onChange(event.target.checked));

async function onChange (checked) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: switchMode,
        args: [checked]
    });
}

function switchMode (checked) {
    let readerTopBar = document.querySelector('div.readerTopBar');
    let readerControls = document.querySelector('div.readerControls');
    let appContent = document.querySelector('div.app_content');
    if (checked) {
        readerTopBar.style.visibility = 'hidden';
        readerControls.style.visibility = 'hidden';
        let maxWidth = appContent.style.maxWidth;
        chrome.storage.local.set({ 'maxWidth': maxWidth });
        appContent.style.maxWidth = 'none';
    } else {
        readerTopBar.style.visibility = 'visible';
        readerControls.style.visibility = 'visible';
        chrome.storage.local.get(['maxWidth'], (result) => {
            appContent.style.maxWidth = result.maxWidth;
        });
    }
    // 主动触发 resize 时间，让 app_content 下的 wr_canvasContainer（canvas）进行重绘
    let resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
}
