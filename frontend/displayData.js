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