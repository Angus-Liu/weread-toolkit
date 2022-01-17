chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.onActivated.addListener(async info => {
        let tab = await chrome.tabs.get(info.tabId);
        let isWeRead = tab.url.startsWith('https://weread.qq.com/');
        isWeRead ? chrome.action.enable(tab.tabId) : chrome.action.disable(tab.tabId);
    });
});
