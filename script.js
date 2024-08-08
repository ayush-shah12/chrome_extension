import { schools } from './schools.js';

let messageReceived = false;

//initial check for school name, possibly not needed
chrome.runtime.sendMessage({ action: "getSchool", message: localStorage.getItem('selectedSchool') });

document.addEventListener('DOMContentLoaded', () => {

  //sends message, and recieves the highlighted prof info as response.message
  //this code block might need to be moved somewhere else, since it will always run on popup load
  chrome.runtime.sendMessage({ action: "getProfInfo" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('Received response:', response.message);
      messageReceived = true;
      submitFunction(response.message);
    }
  });


    const storedData = JSON.parse(localStorage.getItem('selectedSchool'));
    const selectedSchool = storedData ? `@ ${storedData[0].toUpperCase()}` : "[SELECT A SCHOOL]";
    document.getElementById('school-link').innerText = selectedSchool;

    //for saving last searched professor information
    if (localStorage.getItem('savedProfInfo') != null) {

      const errorText = document.getElementById('error-text');
      const professorStats = document.getElementById('professor-stats');
      const resultSection = document.getElementById('result-section');
      const loadingScreen = document.getElementById('loading-screen-on-off');

      document.getElementById('first-name').value = JSON.parse(localStorage.getItem('savedProfInfo'))['firstName'];
      document.getElementById('last-name').value = JSON.parse(localStorage.getItem('savedProfInfo'))['lastName'];
      document.querySelector('#rating-value').textContent = JSON.parse(localStorage.getItem('savedProfInfo'))['avgRating'];
      document.querySelector('#difficulty-value').textContent = JSON.parse(localStorage.getItem('savedProfInfo'))['avgDifficulty'];

      const wouldTakeAgainPercent = JSON.parse(localStorage.getItem('savedProfInfo'))['wouldTakeAgainPercent'];
      document.querySelector('#take-again-value').textContent = wouldTakeAgainPercent;

      const commentsContainer = document.getElementById('comments');
      commentsContainer.innerHTML = '';
      const firstComments = JSON.parse(localStorage.getItem('savedProfInfo'))['comments'];

      firstComments.forEach(commentText => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.textContent = commentText;
        commentsContainer.appendChild(commentDiv);
      });

      const circles = document.querySelectorAll('.circle');
      circles.forEach(elem => {
        const dots = 80
        var marked = wouldTakeAgainPercent == "N/A" ? -1 : wouldTakeAgainPercent;
        var percent = Math.floor(dots * marked / 100);
        var rotate = 360 / dots;
        var points = "";
        for (let i = 0; i < dots; i++) {
          points += `<div class="points" style="--i: ${i}; --rot: ${rotate}deg"></div>`;
        }
        elem.innerHTML = points;
        const pointsMarked = elem.querySelectorAll('.points');
        for (let i = 0; i < percent; i++) {
          pointsMarked[i].classList.add('marked')
        }
      })


      errorText.style.display = 'none';
      professorStats.textContent = `${JSON.parse(localStorage.getItem('savedProfInfo'))['firstName']} ${JSON.parse(localStorage.getItem('savedProfInfo'))['lastName']}'s Ratings`;
      professorStats.classList.remove('hidden');
      resultSection.classList.remove('hidden');
      loadingScreen.classList.add('hidden');
    }

    autocomplete(document.getElementById("school-input"), schools);
  
});

document.getElementById('swap-button').addEventListener('click', () => {
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const temp = firstNameInput.value;
  firstNameInput.value = lastNameInput.value;
  lastNameInput.value = temp;
});

document.getElementById('school-link').addEventListener('click', () => {
  document.getElementById('main-section').classList.add('hidden');
  document.getElementById('school-section').classList.remove('hidden');
});

document.getElementById('back-button').addEventListener('click', () => {
  document.getElementById('school-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
});

async function submitFunction(name = null) {

  let firstName = "";
  let lastName = "";
  if (name == null) {
    firstName = document.getElementById('first-name').value.trim();
    lastName = document.getElementById('last-name').value.trim();
  }

  else {
    if (name.includes('')) {
      firstName = name.split(' ')[0];
      lastName = name.split(' ')[1];
    }
    else {
      firstName = name;
      lastName = "";
    }
  }
  const errorText = document.getElementById('error-text');
  const professorStats = document.getElementById('professor-stats');
  const resultSection = document.getElementById('result-section');
  const loadingScreen = document.getElementById('loading-screen-on-off');
  resultSection.classList.add('hidden');
  professorStats.classList.add('hidden');
  loadingScreen.classList.remove('hidden');

  const storedCode = JSON.parse(localStorage.getItem('selectedSchool'))[1];
  if (!firstName && !lastName) {
    errorText.textContent = 'PLEASE ENTER EITHER A VALID FIRST OR LAST NAME.';
    errorText.style.display = 'block';
    loadingScreen.classList.add('hidden');
    return;
  } else if (storedCode == null) {
    errorText.textContent = 'PLEASE SELECT A SCHOOL BEFORE BROWSING PROFESSORS.';
    errorText.style.display = 'block';
    return;
  }
  const fetchData = await fetch(`https://chrome-extension-b286ba0227dc.herokuapp.com/get_professor_info?prof_first_name=${firstName}&prof_last_name=${lastName}&school_code=${storedCode}`).catch((err) => {
    errorText.textContent = 'ERROR, PLEASE TRY AGAIN LATER.';
    errorText.style.display = 'block';
    loadingScreen.classList.add('hidden');
    return;
  })
  const data = await fetchData.json();
  if ("ERROR" in data) {
    errorText.textContent = data['MESSAGE'];
    errorText.style.display = 'block';
    loadingScreen.classList.add('hidden');
    return;
  }
  document.querySelector('#rating-value').textContent = data['avgRating'];
  document.querySelector('#difficulty-value').textContent = data['avgDifficulty'];
  const wouldTakeAgainPercent = data['wouldTakeAgainPercent'].toFixed(0);
  if (wouldTakeAgainPercent == -1) {
    document.querySelector('#take-again-value').textContent = "N/A";
  }
  else {
    document.querySelector('#take-again-value').textContent = wouldTakeAgainPercent;
  }
  const commentsContainer = document.getElementById('comments');

  commentsContainer.innerHTML = '';
  const firstComments = data['comments'].slice(0, 5);

  firstComments.forEach(commentText => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.textContent = commentText;
    commentsContainer.appendChild(commentDiv);
  });

  localStorage.setItem('savedProfInfo', JSON.stringify({ 'firstName': data['firstName'], 'lastName': data['lastName'], 'avgRating': data['avgRating'], 'avgDifficulty': data['avgDifficulty'], 'wouldTakeAgainPercent': data['wouldTakeAgainPercent'] == -1 ? "N/A" : data['wouldTakeAgainPercent'].toFixed(0), 'comments': firstComments }));

  const circles = document.querySelectorAll('.circle');
  circles.forEach(elem => {
    const dots = 80
    var marked = wouldTakeAgainPercent
    var percent = Math.floor(dots * marked / 100);
    var rotate = 360 / dots;
    var points = "";
    for (let i = 0; i < dots; i++) {
      points += `<div class="points" style="--i: ${i}; --rot: ${rotate}deg"></div>`;
    }
    elem.innerHTML = points;
    const pointsMarked = elem.querySelectorAll('.points');
    for (let i = 0; i < percent; i++) {
      pointsMarked[i].classList.add('marked')
    }
  })

  errorText.style.display = 'none';
  professorStats.textContent = `${data['firstName']} ${data['lastName']}'s Ratings`;
  professorStats.classList.remove('hidden');
  resultSection.classList.remove('hidden');
  loadingScreen.classList.add('hidden');

};

document.getElementById('submit-button').addEventListener('click', async () => {
  submitFunction();
});

// SELECT SCHOOL SECTION
function autocomplete(input, dictionary) {
  let currentFocus;

  input.addEventListener("input", function () {
    let val = this.value;
    closeAllLists();
    if (!val) return false;
    currentFocus = -1;

    let suggestions = document.createElement("div");
    suggestions.setAttribute("id", this.id + "-autocomplete-list");
    suggestions.setAttribute("class", "autocomplete-suggestions");
    this.parentNode.appendChild(suggestions);

    for (let key in dictionary) {
      if (key.substring(0, val.length).toUpperCase() === val.toUpperCase()) {
        let suggestion = document.createElement("div");
        suggestion.innerHTML = "<strong>" + key.substr(0, val.length) + "</strong>";
        suggestion.innerHTML += key.substring(val.length);
        suggestion.innerHTML += "<input type='hidden' value='" + key + "'>";
        suggestion.addEventListener("click", function () {
          input.value = this.getElementsByTagName("input")[0].value;
          document.getElementById('school-link').innerText = `@ ${input.value.toUpperCase()}`;
          localStorage.setItem('selectedSchool', JSON.stringify([input.value, schools[input.value]]));
          chrome.runtime.sendMessage({ action: "getSchool", message: localStorage.getItem('selectedSchool') });   //sending updated school to background.js
          closeAllLists();
        });
        suggestions.appendChild(suggestion);
      }
    }
  });

  input.addEventListener("keydown", function (e) {
    let x = document.getElementById(this.id + "-autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode === 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    let x = document.getElementsByClassName("autocomplete-suggestions");
    for (let i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
