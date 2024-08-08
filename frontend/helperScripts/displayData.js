export function displayComments(comments) {
    const commentsContainer = document.getElementById('comments');
    commentsContainer.innerHTML = ''; // Clear previous comments
  
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
  
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="course">${comment.course}</span>
                <span class="date">${comment.date}</span>
            </div>
            <div class="comment-body">${comment.comment}</div>
            <div class="comment-footer">Would Take Again: ${comment.wta}</div>
        `;
  
        commentsContainer.appendChild(commentElement);
    });
  }
  
export function displayTags(tags) {
    const tagsContainer = document.getElementById('tags');
    tagsContainer.innerHTML = ''; // Clear existing tags if any
  
    tags.forEach(tagText => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag';
        tagDiv.textContent = tagText;
        tagsContainer.appendChild(tagDiv);
    });
}

export function displayCircle(wouldTakeAgainPercent) {
    const circles = document.querySelectorAll('.circle');
    circles.forEach(elem => {
      const dots = 80
      let marked = wouldTakeAgainPercent == "N/A" ? -1 : wouldTakeAgainPercent;
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
}