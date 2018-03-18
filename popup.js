/*******************************************************************************
*
* Iframe Detector Popup JS
* _________________________________________
* [2018] Pericror
* All Rights Reserved
* Use of this source code is governed by the license found in the LICENSE file.
*******************************************************************************/

// Load page in new tab
function loadPage() {
    chrome.runtime.sendMessage({
        from:    'popup',
        subject: 'showLink'
    });
}

function handleUpdatedIframes(iframes)
{
    if(iframes==0)
    {
        document.getElementById("content").style.display = "none";
        document.getElementById("default").style.display = "block";
    }
}

function deleteNoSrc(e)
{
    var deleteButton = e.target;
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', subject: 'delete',
            id: 'noSrc', 'tabId' : tabs[0].id}, handleUpdatedIframes);
    });
    
    document.getElementById("iframesNoSrc").innerHTML =
        "Note: &lt;iframe&gt; tags found without 'src' attributes: <b>0</b>";
    document.getElementById("deleteNoSrc").style.display = "none";
}

function deleteAll(e)
{
    var deleteButton = e.target;
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', subject: 'delete',
            id: 'all', 'tabId' : tabs[0].id}, handleUpdatedIframes);
    });
}

function handleDeleteClick(e)
{
    var deleteButton = e.target;
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', subject: 'delete',
            id: deleteButton.getAttribute('data-id'), 'tabId' : tabs[0].id},
                handleUpdatedIframes);
    });
    
    // Remove deleted iframe row from table
    var td = deleteButton.parentElement;
    var tr = td.parentElement;
    var tbody = document.getElementById("iframes").getElementsByTagName('tbody')[0];
    tbody.removeChild(tr);
    
    if(tbody.children.length == 0)
    {
        document.getElementById("iframes").style.display = "none";
    }
}

// Handle iframes from the content script
function handleIframeInfo(iframeInfo)
{   
    if(iframeInfo == undefined)
    {
            // Page is still loading
            return;
    }
    else
    {
        document.getElementById("loading").style.display = "none";
    }
    
    var iframe_srcs = iframeInfo['iframe_srcs'];
    var hostname = iframeInfo['hostname'];
    
    var iframes_no_src = 0;
    if(iframe_srcs.length > 0)
    {
        for(var i = 0; i < iframe_srcs.length; i++)
        {
            if(iframe_srcs[i] == null)
            {
                iframes_no_src++;
                continue;
            }
            
            // Add iframe to table
            var tbody = document.getElementById("iframes").getElementsByTagName('tbody')[0];
            var tr = tbody.insertRow(-1); // append row to end
            var td_domain = tr.insertCell(0);
            var td_source = tr.insertCell(1);
            var td_delete = tr.insertCell(2);
            
            var iframe_hostname = hostname; // assume if src invalid it's on the current domain
            try
            {
                var iframe_src_url = new URL(iframe_srcs[i]);
                iframe_hostname = iframe_src_url.hostname;
            }
            catch(e)
            {
                // Failed to convert src to URL
            }
            
            td_domain.innerHTML = iframe_hostname;
            td_domain.className += "domain";
            td_source.innerHTML = iframe_srcs[i];
            td_delete.className += "delete";
            
            // Check if iframe src is from current domain
            if(hostname.indexOf(iframe_hostname) > -1)
            {
                td_domain.classList.add("iframeOk");
            }
            else
            {
                td_domain.classList.add("iframeWarning");
            }
            
            // Create delete button
            var deleteButton = document.createElement('button');
            deleteButton.className = "material-icons";
            deleteButton.innerHTML = 'delete';
            deleteButton.onclick = handleDeleteClick;
            deleteButton.dataset['id'] = i;
            td_delete.appendChild(deleteButton);
        }
        
        if(iframes_no_src != iframe_srcs.length)
        {
            document.getElementById("iframes").style.display = "block";
        }
        else
        {
            document.getElementById("iframes").style.display = "none";
        }
        
        if(iframes_no_src == 0)
        {
            document.getElementById("deleteNoSrc").style.display = "none";
        }
        
        document.getElementById("iframesNoSrc").innerHTML =
            "Note: Iframes found without 'src' attributes: <b>" +
                iframes_no_src.toString() + "</b>";
        
        document.getElementById("content").style.display = "block";
    }
    else
    {
        document.getElementById("default").style.display = "block";
    }
}

// Wrapper to catch any problems with handler
function handleIframeInfoSafe(iframeInfo)
{
    try
    {
        handleIframeInfo(iframeInfo);
    }
    catch(e)
    {
        document.getElementById("error").style.display = "block"
    }
}

// Request input info from the content script when the page has loaded
window.addEventListener('DOMContentLoaded', function () {
    document.getElementById("siteLink").onclick = loadPage;
    document.getElementById("deleteNoSrc").onclick = deleteNoSrc;
    document.getElementById("deleteAll").onclick = deleteAll;
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', subject: 'iframes'}, handleIframeInfoSafe);
    });
});