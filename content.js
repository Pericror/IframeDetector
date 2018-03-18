/*******************************************************************************
*
* Iframe Detector Content JS
* _________________________________________
* [2018] Pericror
* All Rights Reserved
* Use of this source code is governed by the license found in the LICENSE file.
********************************************************************************/

// Listen for popup iframe info request
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.from === 'popup')
    {
        if(request.subject === 'iframes')
        {
            var iframes = document.getElementsByTagName("iframe");
            var iframe_srcs = [];
            for (var i = 0; i < iframes.length; i++) {
                var iframe = iframes[i];
                
                // Add unique id to iframe to allow for deletion
                if(iframe.getAttribute('data-iframe-detector-id') == null)
                {
                    iframe.setAttribute('data-iframe-detector-id', i);
                }
                
                iframe_srcs.push(iframe.getAttribute('src'));
            }
            sendResponse({iframe_srcs: iframe_srcs, hostname: window.location.hostname});
        }
        else if(request.subject === 'delete')
        {
            if(request.id == 'all')
            {
                var deleteIframes = document.getElementsByTagName("iframe");
                while(deleteIframes.length > 0) {
                    var deleteIframe = deleteIframes[0];
                    deleteIframe.parentElement.removeChild(deleteIframe);
                }
            }
            else if (request.id == 'noSrc')
            {
                var deleteIframes = document.getElementsByTagName("iframe");
                for (var i = 0; i < deleteIframes.length; i++) {
                    var deleteIframe = deleteIframes[i];
                    if(deleteIframe.getAttribute('src') == null)
                    {
                        deleteIframe.parentElement.removeChild(deleteIframe);
                        i--; // account for deleteIframes size change
                    }
                }
            }
            else
            {
                var iframeSelector = '[data-iframe-detector-id="'+request.id+'"]';
                var deleteIframe = document.querySelector(iframeSelector);
                deleteIframe.parentElement.removeChild(deleteIframe);
            }
            
            var iframes = document.getElementsByTagName("iframe").length;

            // Keep the extension badge updated with the new iframe count
            chrome.runtime.sendMessage({
                from:    'content',
                subject: 'updateBadge',
                tabId: request.tabId,
                iframes: iframes
            });
            
            sendResponse(iframes);
        }
        else
        {
            sendResponse({});
        }
    }
    else if(request.from === 'background')
    {
        var iframes = document.getElementsByTagName("iframe").length;
        sendResponse({iframes: iframes, tabId: request['tabId']});
    }
});