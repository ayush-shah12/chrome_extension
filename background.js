
let selectedSchool = null;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "textToPopup",
      title: "Send Name to RMP Extension",
      contexts: ["selection"],
    });
});

//getting school name to see if its available
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "getSchool"){
        selectedSchool = request.message;
        console.log('Selected School: ' + selectedSchool);
    }
    return true;
});

//send message from script to background, send response back which contains the info
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.action.openPopup(); //need to open popup to send message to popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        
        if(request.action === "getProfInfo" && selectedSchool != null){
            console.log('Received Prof Info: ' + request.message);
            sendResponse({message: info.selectionText});
        }
        else{
            console.log("No school selected");
        }
    });
    
});