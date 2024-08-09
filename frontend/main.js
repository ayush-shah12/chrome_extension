import { returnBtn, schoolBtn, swapBtn } from './helperScripts/buttons.js';
import { displayCircle, displayComments, displayTags } from './helperScripts/displayData.js';
import { savedProfInfo } from './helperScripts/savedProf.js';
import { schools } from './helperScripts/schools.js';
import { autoComplete } from './helperScripts/schoolSelection.js';

document.addEventListener('DOMContentLoaded', () => {
  savedProfInfo();
  autoComplete(document.getElementById("school-input"), schools);
});

async function handleSubmit() {
  const { firstName, lastName, errorText, storedCode } = initializeForm();

  if (!isValidInput(firstName, lastName, storedCode, errorText)) return;

  try {
    const data = await fetchProfessorData(firstName, lastName, storedCode);
    if (data && !data.ERROR) {
      updateUIWithProfessorData(data);
    } else {
      handleFetchError(data, errorText);
    }
  } catch (err) {
    handleFetchError(null, errorText, err);
  }
}

function initializeForm() {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const errorText = document.getElementById('error-text');

  hideSections(['result-section', 'professor-stats', 'professor-stats-dep', 'professor-stats-num', 'loading-screen-on-off']);
  showSections(['loading-screen-on-off']);

  errorText.style.display = 'none';
  errorText.textContent = '';

  const storedCode = getStoredSchoolCode();

  return { firstName, lastName, errorText, storedCode };
}

function isValidInput(firstName, lastName, storedCode, errorText) {
  if (!firstName && !lastName) {
    displayError('PLEASE ENTER A VALID FIRST OR LAST NAME.', errorText);
    return false;
  } else if (!storedCode) {
    displayError('PLEASE SELECT A SCHOOL BEFORE BROWSING PROFESSORS.', errorText);
    return false;
  }
  return true;
}

async function fetchProfessorData(firstName, lastName, storedCode) {
  const response = await fetch(`https://chrome-extension-b286ba0227dc.herokuapp.com/get_professor_info?prof_first_name=${firstName}&prof_last_name=${lastName}&school_code=${storedCode}`);
  return response.json();
}

function handleFetchError(data, errorText, err = null) {
  errorText.textContent = data ? data.MESSAGE : 'ERROR, PLEASE TRY AGAIN LATER.';
  errorText.style.display = 'block';
  hideSections(['loading-screen-on-off']);
  if (err) console.log(err);
}

function updateUIWithProfessorData(data) {
  const wouldTakeAgainPercent = data.wouldTakeAgainPercent.toFixed(0);
  
  document.getElementById('rating-value').textContent = data.avgRating;
  document.getElementById('difficulty-value').textContent = data.avgDifficulty;
  document.getElementById('take-again-value').textContent = wouldTakeAgainPercent === "-1" ? "N/A" : wouldTakeAgainPercent;

  localStorage.setItem('savedProfInfo', JSON.stringify({
    firstName: data.firstName,
    lastName: data.lastName,
    avgRating: data.avgRating,
    avgDifficulty: data.avgDifficulty,
    wouldTakeAgainPercent: wouldTakeAgainPercent === "-1" ? "N/A" : wouldTakeAgainPercent,
    userCards: data.userCards,
    department: data.department,
    numRatings: data.numRatings,
    tags: data.tags
  }));

  displayComments(data.userCards);
  displayTags(data.tags);
  displayCircle(wouldTakeAgainPercent);

  updateProfessorStatsUI(data);
  showSections(['professor-stats', 'professor-stats-dep', 'professor-stats-num', 'result-section']);
  hideSections(['loading-screen-on-off']);
}

function updateProfessorStatsUI(data) {
  const professorStats = document.getElementById('professor-stats');
  const professorStatsDep = document.getElementById('professor-stats-dep');
  const professorStatsNum = document.getElementById('professor-stats-num');

  professorStats.textContent = `${data.firstName} ${data.lastName}'s Ratings`;
  professorStatsDep.textContent = `Department of ${data.department}`;
  professorStatsNum.textContent = `${data.numRatings} Ratings`;
}

function displayError(message, errorText) {
  errorText.textContent = message;
  errorText.style.display = 'block';
  hideSections(['loading-screen-on-off']);
}

function hideSections(sectionIds) {
  sectionIds.forEach(id => document.getElementById(id).classList.add('hidden'));
}

function showSections(sectionIds) {
  sectionIds.forEach(id => document.getElementById(id).classList.remove('hidden'));
}

function getStoredSchoolCode() {
  const storedData = JSON.parse(localStorage.getItem('selectedSchool'));
  return storedData ? storedData[1] : null;
}

document.getElementById('submit-button').addEventListener('click', handleSubmit);

document.getElementById('swap-button').addEventListener('click', swapBtn);

document.getElementById('school-link').addEventListener('click', schoolBtn);

document.getElementById('back-button').addEventListener('click', returnBtn);