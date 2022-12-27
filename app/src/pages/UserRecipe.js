import Utils from     "../services/Utils.js";
import app from       "../firebase.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js" 

// получаем данные о конкретном рецепте
const getRecipeInfo = function () {
  const dbRef = ref(getDatabase());
  const id = Utils.parseRequestURL().id;
  get(child(dbRef, `user_recipes/${id}`)).then((snapshot) => {
    if (snapshot.exists()) {
      getRecipe(snapshot.val())
    } else {
      console.log("Empty! :(");  
    }
  }).catch((error) => {
    console.log(error);
  });
}

// заполняем полученными данными страницу
function getRecipe (data) {
  const titleWrap = document.querySelector("h1");
  const ingredientsWrap = document.querySelector(".ingredients_wrap > ul");
  const cookWrapTitle = document.querySelector(".cook_wrap span");
  const directionsWrap = document.querySelector(".cook_wrap ul");
  const summaryWrap = document.querySelector(".summary_wrap p");
  
  titleWrap.innerHTML = data.title;
  ingredientsWrap.innerHTML = data.ingredients.map(elem => 
    `<li>${elem}</li>`).join(' \n');
  cookWrapTitle.innerHTML = `"${data.title}"`;
  directionsWrap.innerHTML = data.directions;
  summaryWrap.innerHTML = data.summarize;
}

// функция генерирации рандомного id для коммента
const randomId = () => Math.floor(Math.random() * (1000 - 1) + 1);

// получаем объект с данными пользователя
const userData = JSON.parse(localStorage.getItem("_r_usrname")) || JSON.parse(sessionStorage.getItem("_r_usrname"));

// записываем комментарий в бд
function writeCommentsIntoDb(username, text, timestamp) {
  const db = getDatabase();
  const recipeId = Utils.parseRequestURL().id;
  const commentId = randomId();

  set(ref(db, 'recipeComments/' + recipeId + "/comments/" + commentId), {
    username: username,
    text: text,
    timestamp: timestamp,
    userId: userData.id,
    commentId: commentId
  });
}

function deleteComment (commentId) {
  const db = getDatabase();
  const recipeId = Utils.parseRequestURL().id;
  
  remove(ref(db, "recipeComments/" + recipeId + "/comments/" + commentId));
}

// формируем список комментариев от новых к старым
function getAllComments (data) {
  const list = document.querySelector(".comment_list");
  let comments = Object.entries(data);
  let sortedComments = comments.sort((a,b) => b[1].timestamp - a[1].timestamp);

  list.innerHTML = `${sortedComments.map(([key, value]) => {
    if (value.userId == userData.id) {
      return `<li class="comment_inner">
                <img src="../img/x.png" class="delete_comment" data-id="${value.commentId}" />
                <h5 class="comment_username">${value.username}</h5><span class="comment_date">${new Date(value.timestamp).toLocaleDateString()}</span>
                <p class="comment_text">${value.text}</p>
              </li>`
    } else {
      return `<li class="comment_inner">
                <h5 class="comment_username">${value.username}</h5><span class="comment_date">${new Date(value.timestamp).toLocaleDateString()}</span>
                <p class="comment_text">${value.text}</p>
              </li>`
    }
  }).join(' \n')}`

  const deleteCommentBtns = document.querySelectorAll(".delete_comment");
  deleteCommentBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const wrapper = btn.closest(".comment_inner");
      const commId = btn.dataset.id;
      deleteComment(commId);
      wrapper.remove();
    })
  })
}

// получаем комменты из бд, если есть то формируем список
function getRecipeComments () {
  const db = getDatabase();
  const recipeId = Utils.parseRequestURL().id;

  try {
    const commentsRef = ref(db, 'recipeComments/' + recipeId + "/comments");
    onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        getAllComments(data);
      } else {
        return
      }
    });
  } catch (error) {
    console.log(error)
  } 
}

// если пользователь не авторизован, делаем комменты недоступными
function disableComments () {
  const comm_err = document.querySelector(".comments_worm");

  comm_err.innerHTML = `
    <h4>Comments are available only to authorized users</h4>
  `
}

// при пустых инпутах кнопка отправки комментария задизейблена
function disableCommentBtn () {
  const username = document.querySelector(".username_inp");
  const text = document.querySelector(".comment_textarea");
  const commentBtn = document.querySelector(".comment_btn");
  commentBtn.disabled = true;
  commentBtn.classList.add("disable");

  if (!username.value && !text.value) {
    commentBtn.disabled = true;
    commentBtn.classList.add("disable")
  } else if (username.value && text.value) {
    commentBtn.disabled = false;
    commentBtn.classList.remove("disable")
  }
}

let UserRecipe = {
  title: "User Recipe Page",
  render: () => {
    let view = `
          <div class="head_bg-single">
            <h1></h1>
          </div>
          <div class="auto_container shadow">
            <div class="show_recipe">
              <div class="ingredients_wrap">
                <h3>Ingredients:</h3>
                <ul></ul>
              </div>
              <div class="cook_wrap">
                <h3>How to cook <span></span></h3>
                <ul></ul>
              </div>
              <div class="summary_wrap">
                <h3>Summary</h3>
                <p></p>
              </div>
              <div class="comments_wrap">
                <h3>QUESTIONS & REPLIES</h3>
                <div class="comments_worm">
                  <input class="form_control username_inp" type="text" placeholder="Enter your name" />
                  <textarea class="comment_textarea" type="text" placeholder="Type here..."></textarea>
                  <button class="comment_btn">Post</button>
                </div>
                <ul class="comment_list"></ul>
              </div>
            </div>
          </div>
    `

    return view
  },
  after_render: () => {
    getRecipeInfo();

    // проверям, аторизован ли пользователь, чтобы видеть комментарии
    const anonimous = localStorage.getItem("_r_usrname") || sessionStorage.getItem("_r_usrname") ? false : true; // проверка на авторизацию
    if (!anonimous) {
      getRecipeComments();
    } else {
      disableComments();
    }

    const commentBtn = document.querySelector(".comment_btn");
    const username = document.querySelector(".username_inp");
    const text = document.querySelector(".comment_textarea");
    // по умолчанию кнопка коммента задизейбена, вешаем обрботчики на инпуты, для проверки
    if (commentBtn) {
      disableCommentBtn();

      username.addEventListener("input", disableCommentBtn);
      text.addEventListener("input", disableCommentBtn);

      // вешаем обработчик отправки комментария
      commentBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const timestamp = new Date().getTime();
  
        writeCommentsIntoDb(username.value, text.value, timestamp);
  
        username.value = "";
        text.value = "";
      });
    }
  }
}

export default UserRecipe;