m3u8list = []
m3u8Map = {}
var pattern = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*.m3u8$/
var patternMP4 = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*.mp4$/
var url = ""
//chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_AND_UNTRUSTED_CONTEXTS'})
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        // 存储请求头以备后续使用
        chrome.tabs.query({ active: true }, tabs => {

            if (url != tabs[0].url) {
                return
            }
            url = tabs[0].url
            var tmp
            if (/\?/.test(details.url)) {
                tmp = details.url.slice(0, details.url.indexOf("?"))
            } else {
                tmp = details.url.trim()
            }
            if (pattern.test(tmp) || patternMP4.test(tmp)) {

                chrome.storage.local.set({ [details.requestId]: details.requestHeaders });
            }
        });
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);


//监听页面网络请求
chrome.webRequest.onHeadersReceived.addListener(details => {
    chrome.tabs.query({ active: true }, async tabs => {

        if (url != tabs[0].url) {
            m3u8list = []
        }
        url = tabs[0].url
        var tmp
        if (/\?/.test(details.url)) {
            tmp = details.url.slice(0, details.url.indexOf("?"))
        } else {
            tmp = details.url.trim()
        }
        if (pattern.test(tmp) || patternMP4.test(tmp)) {

            if (!m3u8Map[details.url]) {
                const contentLengthHeader = details.responseHeaders.find(
                    h => h.name.toLowerCase() === 'content-length'
                );
                m3u8list.push({ url: details.url, headers: (await chrome.storage.local.get(details.requestId))[details.requestId], length: contentLengthHeader ? parseInt(contentLengthHeader.value) : 0 })
                m3u8Map[details.url] = details.requestHeaders
                getCurrentTab().then((tab) => {
                    if (tab) {
                        var tabId = "tab" + tab.id
                        chrome.storage.session.set({ [tabId]: m3u8list })
                    }

                })

            }
        }
    });
}, { urls: ["<all_urls>"] }, ["responseHeaders", "extraHeaders"]);

//获取当前标签页
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}