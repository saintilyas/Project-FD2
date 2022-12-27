import Preloader from "../components/Preloader.js";
import app from       "../firebase.js";
import {
  getDatabase,
  ref,
  child,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// получаем данные о пользовательских рецептах
const getUserRecipes = function () {
  const listWrapper = document.querySelector(".food_list");
  listWrapper.innerHTML = Preloader.render();

  const dbRef = ref(getDatabase());
  get(child(dbRef, `user_recipes/`)).then((snapshot) => {
    if (snapshot.exists()) {
      getRecipeList(Object.entries(snapshot.val()))
    } else {
      console.log("Empty! :(");  
    }
  }).catch((error) => {
    console.log(error);
  });
}

function getRecipeList (data) {
  const listWrapper = document.querySelector(".food_list");

  listWrapper.innerHTML = data.map(([id, recipe]) => 
    `<li>
      <a class="user_recipe_link" href="#/userrecipe/${id}">${recipe.title}</a>
    </li>`
  ).join(' \n');
}

let UserRecipes= {
  title: "User recipes",
  render: () => {
    let view = `
                  <div class="head_bg">
                    <h1>User recipes</h1>
                  </div>
                  <div class="category_section">
                    <div class="auto_container">
                      <div class="title">
                        <h2>User Recipes List</h2>
                        <p>Search for the recipes of our users!</p>
                      </div>
                      <div class="food_wrapper">
                        <ul class="food_list"></ul>
                      </div>
                    </div>
                    </div>
                  </div>
    `
    return view
  },
  after_render: () => {
    getUserRecipes();
  }
}

export default UserRecipes;