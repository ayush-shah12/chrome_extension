function swapBtn() {
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    [firstNameInput.value, lastNameInput.value] = [lastNameInput.value, firstNameInput.value];
}
  
function schoolBtn() {
    document.getElementById('main-section').classList.add('hidden');
    document.getElementById('school-section').classList.remove('hidden');
  }
  
function returnBtn() {
    document.getElementById('school-section').classList.add('hidden');
    document.getElementById('main-section').classList.remove('hidden');
}

export { swapBtn, schoolBtn, returnBtn }