chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let firstNameInput = document.getElementById("first-name");
    let lastNameInput = document.getElementById("last-name");
    firstNameInput.value = request.firstName || "";
    lastNameInput.value = request.lastName || "";
    if (request.firstName || request.lastName) {
        document.getElementById("submit-button").click();
    }
});
