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
    <div class="suggestedUsers" suggestion_id=${suggestions.id}>

    <img alt="${suggestions.username} Avatar" src="${suggestions.thumb_url}" />
    <div>
        <span class="username">${suggestions.username}</span><br>
        <span style="color: #585858; margin-right:30px">suggested for you</span>
    </div>
    <spam id="followButton"><a href="javascript:{}" style="float:right;" onclick="suggestedFollow(${suggestions.id},undefined)" aria-label="Follow this user">follow</a></spam>
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

const posts2comment = (posts) => {
  let comment, comment_number;
  comment_number = posts.comments.length;
  comment_number === 1
    ? (comment = `<p><span class="username">${
        posts.comments[comment_number - 1].user.username
      }</span> ${posts.comments[comment_number - 1].text}</p>`)
    : comment_number >= 1
    ? (comment = `<a href="#">&nbsp;&nbsp;View all ${comment_number} comments</a><p><span class="username">${
        posts.comments[comment_number - 1].user.username
      }</span> ${posts.comments[comment_number - 1].text}</p>`)
    : (comment = `The post doesn't have a comment yet.`);
  return comment;
};

const posts2liked = (posts) => {
  let liked = "far",
    likeID,
    likeAriaLabel = "Like this post";
  posts.current_user_like_id &&
    ((liked = "fas red"),
    (likeID = posts.current_user_like_id),
    (likeAriaLabel = "Unlike this post"));
  return `<a class="${liked} fa-heart fa-lg invisibleLink" aria-label="${likeAriaLabel}" onclick="likePost(${posts.id},${likeID})" href="javascript:{}"></a>`;
};

const posts2bookmarked = (posts) => {
  let bookmarked = "far",
    bookmarkID,
    bookmarkAriaLabel = "Bookmark this post";
  posts.current_user_bookmark_id &&
    ((bookmarked = "fas"),
    (bookmarkID = posts.current_user_bookmark_id),
    (bookmarkAriaLabel = "Remove bookmark for this post"));
  return `<a class="${bookmarked} fa-bookmark fa-lg invisibleLink" aria-label="${bookmarkAriaLabel}" onclick="bookmarkPost(${posts.id},${bookmarkID})" href="javascript:{}" style="float:right;"></a>
    `;
};

const posts2likeCount = (posts) => {
  return `<p class="likesCount">${posts.like_count} likes</p>`;
};

const posts2Html = (posts) => {
  const liked = posts2liked(posts);
  const bookmarked = posts2bookmarked(posts);
  const comment = posts2comment(posts);
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
            <spam id="likeico">${liked}</spam>&ensp;
                <a class="far fa-comment fa-lg invisibleLink" aria-label="View Comments" href="#"></a>&ensp;
                <a class="far fa-paper-plane fa-lg invisibleLink" aria-label="Share" href="#"></a>
                <spam id="bookmarkico">${bookmarked}</spam>
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
            <form onsubmit="submitComment(event);return false;" id="form-${posts.id}">
                <i class="far fa-smile"></i>
                <input type="text" name="comment" class="make_comments_hint" aria-label="Input your comment" placeholder="Add a comment..." required> </input>
                <input type="hidden" name=post_id value=${posts.id}> </input>
                <input type="submit" class="commentSubmit" href="#" style="" value="Post">
                </form>
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

initPage();

const likePost = (post_id, current_user_like_id) => {
  const html = document
    .querySelector(`[post_id="${post_id}"]`)
    .querySelector("#likeico");
  const likeHtml = document
    .querySelector(`[post_id="${post_id}"]`)
    .querySelector(".likesCount");
  const likeCount = parseInt(likeHtml.textContent.replace(/\D/g, ""));
  if (current_user_like_id) {
    fetch(`/api/posts/${post_id}/likes/${current_user_like_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a class="far fa-heart fa-lg invisibleLink" aria-label="Like this post" onclick="likePost(${post_id},undefined)" href="javascript:{}"></a>`;
        likeHtml.innerHTML = `${likeCount - 1} likes`;
      });
  } else {
    fetch(`/api/posts/${post_id}/likes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a class="fas red fa-heart fa-lg invisibleLink" aria-label="Unlike this post" onclick="likePost(${post_id},${data.id})" href="javascript:{}"></a>`;
        likeHtml.innerHTML = `${likeCount + 1} likes`;
      });
  }
};

const bookmarkPost = (post_id, current_user_bookmark_id) => {
  const html = document
    .querySelector(`[post_id="${post_id}"]`)
    .querySelector("#bookmarkico");
  if (current_user_bookmark_id) {
    fetch(`/api/bookmarks/${current_user_bookmark_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a class="far fa-bookmark fa-lg invisibleLink" aria-label="Bookmark this post" onclick="bookmarkPost(${post_id},undefined)" href="javascript:{}" style="float:right;"></a>`;
      });
  } else {
    const postData = {
      post_id: post_id,
    };

    fetch("/api/bookmarks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a class="fas fa-bookmark fa-lg invisibleLink" aria-label="Remove bookmark from this post" onclick="bookmarkPost(${post_id},${data.id})" href="javascript:{}" style="float:right;"></a>`;
      });
  }
};

const suggestedFollow = (suggestion_id, followingID) => {
  const html = document
    .querySelector(`[suggestion_id="${suggestion_id}"]`)
    .querySelector("#followButton");
  if (followingID) {
    fetch(`/api/following/${followingID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a href="javascript:{}" style="float:right;" onclick="suggestedFollow(${suggestion_id},undefined)" aria-label="follow this user">follow</a>`;
      });
  } else {
    const postData = {
      user_id: suggestion_id,
    };

    fetch("/api/following/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        html.innerHTML = `<a href="javascript:{}" style="float:right;" onclick="suggestedFollow(${suggestion_id},${data.id})" aria-label="Unfollow this user">unfollow</a>`;
      });
  }
};

const submitComment = (event) => {
  const post_id = event.target.elements.post_id.value;
  const comment = event.target.elements.comment.value;
  const postData = {
    post_id: post_id,
    text: comment,
  };
  fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      fetch(`http://127.0.0.1:5000/api/posts/${post_id}`)
        .then((response) => response.json())
        .then((data) => {
          const html = posts2comment(data);
          document
            .querySelector(`[post_id="${post_id}"]`)
            .querySelector(".comments").innerHTML = html;
        });
    });
  document
    .querySelector(`[post_id="${post_id}"]`)
    .querySelector(`#form-${post_id}`)
    .reset();
};
