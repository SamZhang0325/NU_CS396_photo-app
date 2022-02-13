let userID;
const story2Html = (story) => {
  return `
        <div class="story">
            <img src="${story.user.thumb_url}" class="pic" alt="profile pic for ${story.user.username}" />
            <p>${story.user.username}</p>
        </div>
    `;
};

const displayStories = () => {
  fetch("/api/stories")
    .then((response) => response.json())
    .then((stories) => {
      const html = stories.map(story2Html).join("\n");
      document.querySelector(".storyList").innerHTML = html;
    });
};

const profile2Html = (profile) => {
  return `
    <h2><img alt="${profile.username} Avatar" src="${profile.thumb_url}"/> ${profile.username}</h2>
      `;
};

const displayProfile = () => {
  fetch("/api/profile/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      userID = data.id;
      const html = profile2Html(data);
      document.querySelector(".currUser").innerHTML = html;
    });
};

const suggestions2Html = (suggestions) => {
  return `
    <div class="suggestedUsers">

    <img alt="${suggestions.username} Avatar" src="${suggestions.thumb_url}" />
    <div>
        <span class="username">${suggestions.username}</span><br>
        <span style="color: #585858; margin-right:30px">suggested for you</span>
    </div>
    <a href="#" style="float:right;">follow</a>
</div>
      `;
};

const displaySuggestions = () => {
  fetch("/api/suggestions/")
    .then((response) => response.json())
    .then((suggestions) => {
      const html = suggestions.map(suggestions2Html).join("\n");
      document.querySelector(".suggestions").innerHTML = html;
    });
};

const posts2Html = (posts) => {
  let liked = "far", likeID;
  posts.current_user_like_id && (liked ="fas red", likeID=posts.current_user_like_id);
  let bookmarked = "far", bookmarkID;
  posts.current_user_bookmark_id && (bookmarked ="fas", bookmarkID=posts.current_user_bookmark_id);
  let comment;
  posts.comments.length === 1 ? (
  comment = `<p><span class="username">${posts.comments[0].user.username}</span> ${posts.comments[0].text}</p>`
  ): posts.comments.length >= 1 ? (
    comment = `<a href="#">&nbsp;&nbsp;View all ${posts.comments.length} comments</a><p><span class="username">${posts.comments[0].user.username}</span> ${posts.comments[0].text}</p>`
  ):(
      comment = `The post doesn't have a comment yet.`
  )
  return `
    <div class="card" post_id=${posts.id}>
        <div>
            <h2>
                <a class="invisibleLink" href="#">${posts.user.username}</a>
                <a class="fas fa-ellipsis-h invisibleLink" href="#" aria-label="More Option" style="float:right; margin-right: 10px;">
                </a>
            </h2>
        </div>
        <img alt="${posts.title}" src="${posts.image_url}" />
        <div>
            <p>
                <a class="${liked} fa-solid fa-heart fa-lg invisibleLink" current_user_like_id=${likeID} aria-label="Like the Post" href="#"></a>&ensp;
                <a class="far fa-comment fa-lg invisibleLink" aria-label="View Comments" href="#"></a>&ensp;
                <a class="far fa-paper-plane fa-lg invisibleLink" aria-label="Share" href="#"></a>
                <a class="${bookmarked} fa-bookmark fa-lg invisibleLink" current_user_bookmark_id=${bookmarkID} aria-label="Save" href="#" style="float:right;"></a>
            </p>
            <p class="likesCount">${posts.like_count} likes</p>
            <p>
                <span class="username">${posts.user.username}</span> ${posts.caption}...
                <a href="#">more</a>
            </p>
            <div class="comments">
            ${comment}
            </div>
        </div>
        <span class="post_time">${posts.display_time}</span>
        <div class="make_comments">
            <div class="make_comments_inside">
                <i class="far fa-smile"></i>
                <input type="text" class="make_comments_hint" aria-label="Input your comment" placeholder="Add a comment..."> </input>
                <a href="#" style="float:right;">Post</a>
            </div>
        </div>
    </div>
        `;
};

const displayPosts = () => {
  fetch("/api/posts/?limit=10")
    .then((response) => response.json())
    .then((posts) => {
      const html = posts.map(posts2Html).join("\n");
      document.querySelector(".postList").innerHTML = html;
    });
};

const initPage = () => {
  displayProfile();
  var checkExist = setInterval(function () {
    if (userID) {
      clearInterval(checkExist);
      displayStories();
      displaySuggestions();
      displayPosts();
    }
  }, 100);
};

// invoke init page to display stories:
initPage();
