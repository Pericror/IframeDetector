/*******************************************************************************
*
* Iframe Detector Background JS
* _________________________________________
* [2018] Pericror
* All Rights Reserved
* Use of this source code is governed by the license found in the LICENSE file.
********************************************************************************/

function updateBadge(response) {
    if(response['iframes'] > 0)
    {
        chrome.browserAction.setTitle({'title':"Iframes detected, click for more info",
                                        'tabId':response['tabId']});
        chrome.browserAction.setBadgeText({'text':response['iframes'].toString(),
                                            'tabId':response['tabId']});
        chrome.browserAction.setBadgeBackgroundColor({'color':'#CA2E0B',
                                                    'tabId':response['tabId']});
    } 
    else
    {
        chrome.browserAction.setTitle({'title':"No iframes detected",
                                        'tabId':response['tabId']});
        chrome.browserAction.setBadgeText({'text':'0',
                                            'tabId':response['tabId']});
        chrome.browserAction.setBadgeBackgroundColor({'color':'#4CAF50',
                                                    'tabId':response['tabId']});
    }
};

// Add listener to update badge when tab loads
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, {from: 'background', 'tabId': tabId},
            updateBadge);
    }
    else if (changeInfo.status == 'loading' && tab.active)
    {
        chrome.browserAction.setTitle({'title':"Page is loading...", 'tabId':tabId});
        chrome.browserAction.setBadgeText({'text':'?', 'tabId':tabId});
        chrome.browserAction.setBadgeBackgroundColor({'color':'#3F51B5', 'tabId':tabId});
    }
});

// Listens for content messages
chrome.runtime.onMessage.addListener(function (msg, sender) {
    if ((msg.from === 'content') && (msg.subject === 'updateBadge')) {
        updateBadge(msg);
    }
    else if ((msg.from === 'popup') && (msg.subject === 'showLink')) {
        chrome.tabs.create({
            url : "https://www.pericror.com/"
        });
    }
});