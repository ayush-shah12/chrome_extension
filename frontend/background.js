chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "sendToRMP",
        title: "Search this Professor",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToRMP" && info.selectionText) {
        let selectedText = info.selectionText.trim();
        let names = selectedText.split(" ");

        let firstName = "";
        let lastName = "";

        if (names.length === 1) {
            lastName = names[0];
        } else if (names.length >= 2) {
            firstName = names[0];
            lastName = names.slice(1).join(" ");
            firstName = firstName.replace(".", "");
        }

        chrome.action.openPopup(() => {
            chrome.runtime.sendMessage({ firstName, lastName });
        });
    }
});
