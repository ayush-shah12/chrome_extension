import { displayComments, displayTags, displayCircle } from './displayData.js'

function savedProfInfo() {
  const storedData = JSON.parse(localStorage.getItem('selectedSchool'));
  const selectedSchool = storedData ? `@ ${storedData[0].toUpperCase()}` : "[SELECT A SCHOOL]";
  document.getElementById('school-link').innerText = selectedSchool;
  
  if (localStorage.getItem('savedProfInfo') != null) {
    const errorText = document.getElementById('error-text');
    const professorStats = document.getElementById('professor-stats');
    const professorStatsDep = document.getElementById('professor-stats-dep');
    const professorStatsNum = document.getElementById('professor-stats-num');
    const resultSection = document.getElementById('result-section');
    const loadingScreen = document.getElementById('loading-screen-on-off');
    
    document.getElementById('first-name').value = JSON.parse(localStorage.getItem('savedProfInfo'))['firstName'];
    document.getElementById('last-name').value = JSON.parse(localStorage.getItem('savedProfInfo'))['lastName'];
    document.querySelector('#rating-value').textContent = JSON.parse(localStorage.getItem('savedProfInfo'))['avgRating'];
    document.querySelector('#difficulty-value').textContent = JSON.parse(localStorage.getItem('savedProfInfo'))['avgDifficulty'];
    
    const wouldTakeAgainPercent = JSON.parse(localStorage.getItem('savedProfInfo'))['wouldTakeAgainPercent'];
    document.querySelector('#take-again-value').textContent = wouldTakeAgainPercent;
    
    displayComments(JSON.parse(localStorage.getItem('savedProfInfo'))['userCards']);
    displayTags(JSON.parse(localStorage.getItem('savedProfInfo'))['tags']);
    displayCircle(wouldTakeAgainPercent);

    errorText.style.display = 'none';
    professorStats.textContent = `${JSON.parse(localStorage.getItem('savedProfInfo'))['firstName']} ${JSON.parse(localStorage.getItem('savedProfInfo'))['lastName']}'s Ratings`;
    professorStatsDep.textContent = `Department of ${JSON.parse(localStorage.getItem('savedProfInfo'))['department']}`
    professorStatsNum.textContent = `${JSON.parse(localStorage.getItem('savedProfInfo'))['numRatings']} Ratings`
    professorStats.classList.remove('hidden');
    professorStatsDep.classList.remove('hidden');
    professorStatsNum.classList.remove('hidden');
    resultSection.classList.remove('hidden');
    loadingScreen.classList.add('hidden');
  }
}

export { savedProfInfo }