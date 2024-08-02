chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "textToPopup",
      title: "Send Name to RMP Assistant",
      contexts: ["selection"]
  });
});