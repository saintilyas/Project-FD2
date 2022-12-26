import Preloader from "../components/Preloader.js";
import Utils from     "../services/Utils.js";
import app from       "../firebase.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const root = document.getElementById("root");

const APIKey = `7de7f713e27c426da586100a754de994`;

// снизу 4 функции получения разных данных о рецепте
const getRecipe = async function (id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${APIKey}`)
    const data = response.json();
    return data
  } catch (error) {
    console.error("Failing fetching data.", error)
  }
}

const getSteps = async function (id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${APIKey}`)
    const data = response.json();
    return data
  } catch (error) {
    console.error("Failing fetching data.", error)
  }
}

const getSimilar = async function (id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/similar?apiKey=${APIKey}&number=4`)
    const data = response.json();
    return data
  } catch (error) {
    console.error("Failing fetching data.", error)
  }
}

const getPrintData = async function (id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/card?apiKey=${APIKey}`)
    const data = response.json();
    return data
  } catch (error) {
    console.error("Failing fetching data.", error)
  }
}

// генерируем рандомный id для коммента
const randomId = () => Math.floor(Math.random() * (1000 - 1) + 1);

// записываем комментарий в бд
function writeCommentsIntoDb(username, text, timestamp) {
  const db = getDatabase();
  const recipeId = Utils.parseRequestURL().id;
  const commentId = randomId();
  set(ref(db, 'recipeComments/' + recipeId + "/comments/" + commentId), {
    username: username,
    text: text,
    timestamp: timestamp
  });
}

// формируем список комментариев от новых к старым
function getAllComments (data) {
  const list = document.querySelector(".comment_list");
  let comments = Object.entries(data);
  let sortedComments = comments.sort((a,b) => b[1].timestamp - a[1].timestamp);

  list.innerHTML = `${sortedComments.map(([key, value]) => 
    `<li class="comment_inner">
      <h5 class="comment_username">${value.username}</h5><span class="comment_date">${new Date(value.timestamp).toLocaleDateString()}</span>
      <p class="comment_text">${value.text}</p>
    </li>`).join(' \n')}`
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

// для неавторизованных комменты недоступны
function disableComments () {
  const comm_err = document.querySelector(".comments_worm");

  comm_err.innerHTML = `
    <h4>Comments are available only to authorized users</h4>
  `
}

// если поля комментария не заполнены, кнопка поста задизеблена
function disableCommentBtn () {
  const username = document.querySelector(".username_inp");
  const text = document.querySelector(".comment_textarea");
  const commentBtn = document.querySelector(".comment_btn");
  commentBtn.disabled = true;
  commentBtn.classList.add("disable")

  if (!username.value && !text.value) {
    commentBtn.disabled = true;
    commentBtn.classList.add("disable")
  } else if (username.value && text.value) {
    commentBtn.disabled = false;
    commentBtn.classList.remove("disable")
  }
}


let ShowRecipe = {
  title: "Recipe page",
  render: async () => {
    root.innerHTML = Preloader.render();

    // получаем id рецепта и данные о нем
    let URL = Utils.parseRequestURL();
    const recipe = await getRecipe(URL.id);
    const info = await getSteps(URL.id);
    const similar = await getSimilar(URL.id);

    // формируем ссылку на картинку с рецептом, если ингредиентов слишком много, то ничего
    let printHTML;
    if (recipe.extendedIngredients.length < 14) {
      const printdata = await getPrintData(URL.id);
      printHTML = `
      <h4>Do you like this recipe? <a href="${printdata.url}" class="print_recipe_btn" target="_blank">Save or print it!</a></h4>
      `
    } else {
      printHTML = ``;
    }

    // формируем страницу, если данных не хватает, то выдаем извинение
    let view;
    if (!info.length) {
      view = `
          <div class="head_bg">
            <h1>We are so sorry</h1>
          </div>
          <div class="error_section">
            <div class="auto_container">
              <div class="content">
                <h1>Sorry</h1>
                <p>The recipe is not available right now. If you have any questions please connect with us.</p>
                <a href="#/home">Go to home page</a>
              </div>
            </div>
          </div>            
    `
    } else {
      view = `
          <div class="head_bg-single">
            <h1>${recipe.title}</h1>
          </div>
          <div class="auto_container shadow">
            <div class="show_recipe">
              <div class="food_img_wrap">
                <img src="${recipe.image}">
              </div>
              <div class="ingredients_wrap">
                <h3>Ingredients:</h3>
                <ul>${recipe.extendedIngredients.map(item =>
                  `<li>${item.original}</li>`).join('\n ')}
                </ul>
              </div>
              <div class="cook_wrap">
                <h3>How to cook <span>"${recipe.title}"</span></h3>
                <ul>
                  ${info[0].steps.map(item =>
                    `<li>
                      <h4>Step ${item.number}</h4>
                      <p>${item.step}</p>
                    </li>`).join('\n ')}
                </ul>
              </div>
              <div class="summary_wrap">
                <h3>Summary</h3>
                <p>${recipe.summary}</p>
              </div>
              <div class="print_recipe">
                ${printHTML}
              </div>
              <div class="similar_recipes_wrap">
                <h2>Similar Recipes</h2>
                <ul>
                  ${similar.map(item =>
                  `<li>
                    <a href="#/recipe/${item.id}"><p>${item.title}</p></a>
                  </li>`).join('\n ')}
                </ul>
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
    }

    return view
  },
  after_render: async () => {
    const summaryWrap = document.querySelector(".summary_wrap");
    const anonimous = localStorage.getItem("_r_usrname") || sessionStorage.getItem("_r_usrname") ? false : true; // проверка на авторизацию

    // проверяем авторизован ли пользователь, показываем блок комментариев
    if (!anonimous) {
      getRecipeComments();
    } else {
      disableComments();
    }

    // делаем линки в блоке summry неактивными
    const disableLinks = summaryWrap.querySelectorAll("a");
    disableLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
      });
    });

    // если пользователь авторизован, вешаем обработчик постинга комментария, очищаем поля ввода
    const commentBtn = document.querySelector(".comment_btn");
    if (commentBtn) {
      disableCommentBtn();
      const username = document.querySelector(".username_inp");
      const text = document.querySelector(".comment_textarea");
      username.addEventListener("input", disableCommentBtn);
      text.addEventListener("input", disableCommentBtn);
      
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

export default ShowRecipe;