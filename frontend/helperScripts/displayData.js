function displayComments(comments) {
    if (comments.length === 0) {
      comments.push({
        'course': "",
        'date': "",
        'comment': "There are no student submitted comments about this professor.",
        'wta': "",
      })
    }

    const commentsContainer = document.getElementById('comments');
    commentsContainer.innerHTML = '';
  
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';

        if (comment.wta !== "") {
          comment.wta = `Would Take Again: ${comment.wta}`
        }
  
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="course">${comment.course}</span>
                <span class="date">${comment.date}</span>
            </div>
            <div class="comment-body">${comment.comment}</div>
            <div class="comment-footer">${comment.wta}</div>
        `;
  
        commentsContainer.appendChild(commentElement);
    });
  }
  
function displayTags(tags) {
  if (tags.length === 0) {
    tags.push("There are no top comments for this professor.")
  }

  const tagsContainer = document.getElementById('tags');
  tagsContainer.innerHTML = '';
  
  tags.forEach(tagText => {
    const tagDiv = document.createElement('div');
    tagDiv.className = 'tag';
    tagDiv.textContent = tagText;
    tagsContainer.appendChild(tagDiv);
  });
}

function displayCircle(wouldTakeAgainPercent) {
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

export { displayComments, displayTags, displayCircle}