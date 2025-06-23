var m3u8list = [];
var title="";
//chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_AND_UNTRUSTED_CONTEXTS'})
var language = (navigator.language || navigator.userLanguage).toLowerCase();
var i18n_text = {}

$(function () {
    //i18n
    if (language == "zh-cn") {
        i18n_text.ext_name = "m3u8嗅探推送"
        i18n_text.copy_msg = "推送成功！"
        i18n_text.copy_btn = "推送"
        i18n_text.nothing_msg = "空空如也！<br>请尝试刷新页面！"
    } else {
        i18n_text.ext_name = "m3u8Sniffer2"
        i18n_text.copy_msg = "push Success!"
        i18n_text.copy_btn = "push"
        i18n_text.nothing_msg = "Find nothing!<br>Please try refreshing!"
    }
    $("#ext-name").text(i18n_text.ext_name)
    $("#msg").text(i18n_text.copy_msg)
    chrome.storage.session.onChanged.addListener(() => {
        getData()
    })
    getData()
})

//获取session内的存储数据
async function getData() {
    getCurrentTab().then((tab) => {
        let tabId = "tab" + tab.id
        title=tab.title;
        chrome.storage.session.get([tabId]).then((value) => {
            if (!isEmptyObject(value)) {
                value[tabId].forEach(element => {
                    m3u8list.push(element)
                });
            }
            render(m3u8list)
        })
    })
}

//渲染
function render(list) {
    if (list !== undefined) {
        if (list.length == 0) {
            $("#box").append('<div style="mt-1 mb-1"><span style="max-width: 200px;white-space: nowrap;display: inline-block;overflow: hidden;text-overflow: ellipsis;line-height: 1.5;">' + i18n_text.nothing_msg + '</span></div>')
        } else {
            $("#box").html()
            for (i = 0; i < list.length; i++) {
                $("#box").append('<div id="url' + i + '" style="mt-1 mb-1"><span title="'+ list[i].url+'" style="max-width: 200px;white-space: nowrap;display: inline-block;overflow: hidden;text-overflow: ellipsis;line-height: 1.5;">' + list[i].url + '</span><a href="#" style="float: right;">' + i18n_text.copy_btn + '</a></div>');
                $("#url" + i).click(list[i], copyUrl);
            }
        }
    }
}

//获取当前标签页
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

//复制链接到剪切板
function copyUrl(obj) {
    fetch("http://localhost:6600/download", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            list: [{
                url: obj.data.url, headers: obj.data.headers.reduce((acc, header) => {
                    acc[header.name] = header.value;
                    return acc;
                }, {}), "filename":  title,
                "saveDir": "./downloads"
            }]
        })
    })

    navigator.clipboard.writeText(obj.data.url);
    $(".alert-success").addClass("show")
    $(".alert-success").removeAttr("hidden")
    window.setTimeout(function () {
        $(".alert-success").removeClass("show")
        $(".alert-success").attr("hidden", "hidden")
    }, 2000);//2秒后消失
}

//对象判空函数
function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}';
}


