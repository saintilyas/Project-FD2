import app from "../firebase.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const db = getDatabase();

// генерируем рандомный id для рецепта
const randomId = () => Math.floor(Math.random() * (1000 - 1) + 1);

// запись рецепта в бд
function setRecipeData (title, directions, ingredients, summarize) {
  const dbRef = ref(getDatabase());

  let recipeId = randomId();
  
  // проверка: если рецепт с таким id есть то запускаем функцию заново
  get(child(dbRef, `user_recipes/${recipeId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      recipeId = randomId(); 
    } else {
      console.log("Okay! :)");
    }
  }).catch((error) => {
    console.log(error);
  });

  set(ref(db, "user_recipes/" + recipeId), {
    title: title,
    directions: directions,
    ingredients: ingredients,
    summarize: summarize,
  });
}

// скрываем модалку
function hideModal() {
  const modal = document.querySelector(".add_recipe_modal");
  const overlay = document.querySelector(".add_recipe_overlay");
  modal.classList.add("unvisible");
  overlay.classList.add("unvisible");
}

// открываем модалку
function showModal (text) {
  const modal = document.querySelector(".add_recipe_modal");
  const overlay = document.querySelector(".add_recipe_overlay");
  const modalTitle = document.querySelector(".add_recipe_modal_title")
  const closeBtn = document.querySelector(".add_recipe_modal_btn")
  modal.classList.remove("unvisible");
  overlay.classList.remove("unvisible");
  modalTitle.innerText = text;

  closeBtn.addEventListener("click", hideModal);

  overlay.addEventListener("click", hideModal);
}

// добавляем в базу рецепт, если что-то не так показываем в модалке ошибку
function setNewRecipe () {
  const ingredientDel = document.querySelectorAll(".del");
  const title = document.getElementById("recipeTitle");
  const directions = document.getElementById("addDirections");
  const summarize = document.getElementById("recipeDescription");
  const ingredientInputs = document.querySelectorAll(".ingredient_input");
  let ingredientsArr = Array.from(ingredientInputs).map(input => input.value);

  if (title.value && directions.value && ingredientsArr.length && summarize.value) {
    setRecipeData(title.value, directions.value, ingredientsArr, summarize.value);
    showModal("Your Recipe has been successfully published");
    
    title.value = "";
    directions.value ="";
    summarize.value = "";
    
    ingredientInputs.forEach((input) => input.value = "");
    ingredientDel.forEach(elem => elem.remove());
  } else {
    showModal("Error adding recipe");
  }
}

let AddRecipe = {
  title: "Add recipe",
  render: () => {
    let view = `
    <div class="add_recipe_bg">
      <h1>Add Recipe</h1>
    </div>

    <div class="add-recipe-area">
      <div class="container">
        <div class="add_recipe">
          <h4>Please fill up all fields for submit a recipe</h4>
          <form>
            <div class="form_group">
              <label for="recipeTitle">Recipe Title</label>
              <input type="text" class="form_control" id="recipeTitle" placeholder="Example: Hamburger Steak with Onions" required>
            </div>
            <div class="form_group">
              <label for="addDirections">Add Directions</label>
              <textarea id="addDirections" rows="4" placeholder="Write Here..." required></textarea>
            </div>
            <div class="form_group">
              <label for="recipeDescription">Summarize recipe</label>
              <textarea id="recipeDescription" rows="4" placeholder="Write Here..." required></textarea>
            </div>
            <div class="form_group fit">
              <label for="ingredients">Ingredients</label>
              <div class="ingredient_inner">
                <input type="text" class="ingredient_input" id="ingredients" placeholder="Write Here..." required>
              </div>
              <button class="add_ingredient_btn">Add ingredient</button>
            </div>
            <button class="submit_btn" type="submit">Submit Recipe</button>
          </form>
        </div>
      </div>
    </div>
    <div class="add_recipe_overlay unvisible"></div>
    <div class="add_recipe_modal unvisible">
      <h5 class="add_recipe_modal_title">Some text from modal</h5>
      <button class="add_recipe_modal_btn">Close</button>
    </div>
    `

    return view
  },
  after_render: async () => {
    const addIngredientBtn = document.querySelector(".add_ingredient_btn");
    const submitBtn = document.querySelector(".submit_btn");
    
    // добавление поля для нового ингредиента
    addIngredientBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const inner = document.createElement("div");
      inner.classList.add("ingredient_inner", "del");
      inner.innerHTML = `
                <input type="text" class="ingredient_input" required>
                <img class="ingredient_del" src="../img/x.png">
      `;
      addIngredientBtn.before(inner);
      
      // удаление поля ингредиента
      const delIngredientBtn = inner.querySelector(".ingredient_del");
      delIngredientBtn.addEventListener("click", (e) => {
        e.preventDefault();

        inner.remove();
      });
    });

    // делаем кнопку задизейбленой для неавторизованных пользователей
    if (localStorage.getItem("_r_usrname") || sessionStorage.getItem("_r_usrname")) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
      submitBtn.title = "Please sign in";
      submitBtn.classList.add("disabled");
    }

    // добавляем новый рецепт в бд
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();

      setNewRecipe();
    });
  }
}

export default AddRecipe;