import { schools } from './schools.js';

function autoComplete(input, dictionary) {
    let currentFocus;
  
    input.addEventListener("focus", function() {
        input.value = "";
    });
    
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

export { autoComplete }