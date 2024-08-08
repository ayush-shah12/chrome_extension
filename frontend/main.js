import { schools } from './schools.js';
import { autoComplete } from './schoolSelection.js';
import { savedProfInfo } from './savedProf.js';
import { displayComments, displayTags } from './displayData.js';

document.addEventListener('DOMContentLoaded', () => {
  savedProfInfo();
  autoComplete(document.getElementById("school-input"), schools);
});

document.getElementById('swap-button').addEventListener('click', () => {
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const temp = firstNameInput.value;
  firstNameInput.value = lastNameInput.value;
  lastNameInput.value = temp;
});

document.getElementById('submit-button').addEventListener('click', async () => {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const errorText = document.getElementById('error-text');
  const professorStats = document.getElementById('professor-stats');
  const professorStatsDep = document.getElementById('professor-stats-dep');
  const professorStatsNum = document.getElementById('professor-stats-num');
  const resultSection = document.getElementById('result-section');
  const loadingScreen = document.getElementById('loading-screen-on-off');
  resultSection.classList.add('hidden');
  professorStats.classList.add('hidden');
  professorStatsDep.classList.add('hidden');
  professorStatsNum.classList.add('hidden');
  loadingScreen.classList.remove('hidden');
  const storedCode = JSON.parse(localStorage.getItem('selectedSchool')) == null ? null : JSON.parse(localStorage.getItem('selectedSchool'))[1];

  if (!firstName || !lastName) {
    errorText.textContent = 'PLEASE ENTER A VALID FIRST AND LAST NAME.';
    errorText.style.display = 'block';
    loadingScreen.classList.add('hidden');
    return;
  } else if (storedCode == null) {
    errorText.textContent = 'PLEASE SELECT A SCHOOL BEFORE BROWSING PROFESSORS.';
    errorText.style.display = 'block';
    loadingScreen.classList.add('hidden');
    return;
  }
  const fetchData = await fetch(`http://127.0.0.1:8080/get_professor_info?prof_first_name=${firstName}&prof_last_name=${lastName}&school_code=${storedCode}`).catch((err) => {
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

  displayComments(data['userCards'])
  displayTags(data['tags'])

  localStorage.setItem('savedProfInfo', JSON.stringify({ 'firstName': data['firstName'], 'lastName': data['lastName'], 'avgRating': data['avgRating'], 'avgDifficulty': data['avgDifficulty'], 'wouldTakeAgainPercent': data['wouldTakeAgainPercent'] == -1 ? "N/A" : data['wouldTakeAgainPercent'].toFixed(0), 'userCards': data['userCards'], 'department': data['department'], 'numRatings': data['numRatings'], 'tags': data['tags'] }));

  const circles = document.querySelectorAll('.circle');
  circles.forEach(elem => {
    const dots = 80
    let marked = wouldTakeAgainPercent
    let percent = Math.floor(dots * marked / 100);
    let rotate = 360 / dots;
    let points = "";
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
  professorStatsDep.textContent = `Department of ${data['department']}`;
  professorStatsNum.textContent = `${data['numRatings']} Ratings`;
  professorStats.classList.remove('hidden');
  professorStatsDep.classList.remove('hidden');
  professorStatsNum.classList.remove('hidden');
  resultSection.classList.remove('hidden');
  loadingScreen.classList.add('hidden');

});

document.getElementById('school-link').addEventListener('click', () => {
  document.getElementById('main-section').classList.add('hidden');
  document.getElementById('school-section').classList.remove('hidden');
});

document.getElementById('back-button').addEventListener('click', () => {
  document.getElementById('school-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
});