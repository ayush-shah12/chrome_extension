let scrape = document.getElementById("highlightBtn");

scrape.addEventListener("click", async () => {
    let collegeName = document.getElementById("collegeName").value;

    let [tab] = await chrome.tabs.query({active:true, currentWindow:true});

    chrome.scripting.executeScript({target:{tabId:tab.id}, func:getRating})

});

async function getRating() {
    try {
        const collegeName = window.getSelection();
        const res = await fetch(`https://chromeextension-pbaj.onrender.com/rmp/${collegeName}`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const record = await res.json();
        console.log(record); 
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


