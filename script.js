const button = document.getElementById('submit');

button.addEventListener('click', async () => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
    });
});

function getSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    const firstName = selectedText.split(' ')[0];
    const lastName = selectedText.split(' ')[1];
    if (selectedText) {
        chrome.storage.sync.get(["selected_school"]).then(async (result) => {
            const a = document.getElementById('selected-value');
            if(result.selected_school!=null){
                const data = await fetch("https://chrome-extension-hkqp.onrender.com/get_professor_info?prof_first_name=" + firstName + "&prof_last_name=" + lastName + "&school_name=" + result.selected_school);
                const a = await data.json();
                alert(JSON.stringify(a));
            }
            else{
                alert('No school selected');
            }
          });
    } else {
        alert('No text selected');
    }
}