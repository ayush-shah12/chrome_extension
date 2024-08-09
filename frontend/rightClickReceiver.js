document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['firstName', 'lastName'], (result) => {
        if (result.lastName) {
            document.getElementById("last-name").value = result.lastName;
        }
        if (result.firstName && result.firstName.length > 0) {
            document.getElementById("first-name").value = result.firstName;
            document.getElementById("submit-button").click();
        } else {
            document.getElementById("first-name").value = "";
        }
    });
});