import Preloader from "../components/Preloader.js";

const APIKey = "7de7f713e27c426da586100a754de994";

// ищем рецепты по разным критериям
const fetchRecipes = async function(value = "") {

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKey}&number=21&query=${value}`);
    const data = await response.json();
    createRecipesList(data);
  } catch (error) {
    console.error("Failing fetching data.", error);
  }
}

const fetchDietRecipes = async function(diet) {

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKey}&number=21&diet=${diet}`);
    const data = await response.json();
    createRecipesList(data);
  } catch (error) {
    console.error("Failing fetching data.", error);
  }
}

const fetchRecipesByCuisine = async function(cuisine) {

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKey}&number=21&cuisine=${cuisine}`);
    const data = await response.json();
    createRecipesList(data);
  } catch (error) {
    console.error("Failing fetching data.", error);
  }
}

// формируем список с рецептами
const createRecipesList = function (data) {
  const foodWrapper = document.querySelector(".food_wrapper");

  if (data.results.length) {
    foodWrapper.innerHTML = `
    ${data.results.map(item => `<div class="inner">
      <a href=#/recipe/${item.id}>
        <img class="food_img" src=${item.image}>
        <p class="food_name">${item.title}</p>  
      </a>
      </div>`).join('\n ')}
    `
  } else {
    foodWrapper.innerHTML = `
          <div class="error_section">
            <div class="auto_container">
              <div class="content">
                <h1>Oops!</h1>
                <p>Sorry, there are no such recipes in our catalog, you can search for them in user recipes.</p>
                <a href="#/userrecipes">Go to user recipes</a>
              </div>
            </div>
          </div> 
    `
  }
}

let Category = {
  title: "Category",
  render: async () => {
    let view = `
            <div class="head_bg">
              <h1>Recipes By Category</h1>
            </div>
            <div class="search_section">
              <div class="auto_container">
                <div class="inner_container">
                  <h2 class="inner_title">Search recipes</h2>
                  <div class="search_form">
                    <input class="search_input" type="text" placeholder="Recipe keyword">
                    <button class="search_btn">Search</button>
                  </div>
                </div>
              </div>
            </div>
              <div class="category_section">
                <div class="auto_container">
                  <div class="title">
                    <h2>Recipe Categories</h2>
                    <p>Search for the recipes you need based on food category</p>
                  </div>
                  <div class="food_categories">
                    <ul class="categories_list">
                      <li class="category">MEAT & SEAFOOD
                        <ul class="category_more meat">
                          <li>Chicken</li>
                          <li>Salmon</li>
                          <li>Pork</li>
                          <li>Shrimp</li>
                          <li>Ground</li>
                        </ul>
                      </li>
                      <li class="category">HEALTHY & DIET
                        <ul class="category_more diet">
                          <li>Keto</li>
                          <li>Vegetarian</li>
                          <li>Vegan</li>
                          <li>Paleo</li>
                          <li>Primal</li>
                        </ul>
                      </li>
                      <li class="category">CUISINE
                        <ul class="category_more cuisine">
                          <li>Mexican</li>
                          <li>Italian</li>
                          <li>Indian</li>
                          <li>Thai</li>
                          <li>European</li>
                        </ul>
                      </li>
                      <li class="category">POPULAR 
                        <ul class="category_more popular">
                          <li>Chili</li>
                          <li>Soup</li>
                          <li>Pasta</li>
                          <li>Tofu</li>
                          <li>Cookie</li>
                          <li>Bread</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div class="food_wrapper"></div>
                </div>
              </div>
            </div>
    `
    
    return view
  },
  after_render: async () => {
    
    const meatRecipesList = document.querySelector(".category_more");
    const dietRecipesList = document.querySelector(".diet");
    const cuisineRecipesList = document.querySelector(".cuisine");
    const popularRecipesList = document.querySelector(".popular");
    const foodWrapper = document.querySelector(".food_wrapper");

    // Показываем прелоадер пока загружаются данные
    foodWrapper.innerHTML = Preloader.render();
    
    // показываем рецепты сразу же
    fetchRecipes();

    // вешаем обработчики на списки, в зависимости от категория поиска ищем нужную информацию
    meatRecipesList.addEventListener("click", (e) => {
      e.preventDefault();

      foodWrapper.innerHTML = Preloader.render();
      const value = e.target.innerText.toLowerCase();
      fetchRecipes(value);
    });

    dietRecipesList.addEventListener("click", (e) => {
      e.preventDefault();

      foodWrapper.innerHTML = Preloader.render();
      const value = e.target.innerText.toLowerCase();
      fetchDietRecipes(value);
    });

    cuisineRecipesList.addEventListener("click", (e) => {
      e.preventDefault();

      foodWrapper.innerHTML = Preloader.render();
      const value = e.target.innerText.toLowerCase();
      fetchRecipesByCuisine(value);
    });

    popularRecipesList.addEventListener("click", (e) => {
      e.preventDefault();

      foodWrapper.innerHTML = Preloader.render();
      const value = e.target.innerText.toLowerCase();
      fetchRecipes(value);
    });

    // поиск по ключевым словам
    const searchInput = document.querySelector(".search_input");
    const searchBtn = document.querySelector(".search_btn")
    searchBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      if (searchInput.value.trim()) {
        await fetchRecipes(searchInput.value.trim());
      }

      searchInput.value = "";
    });
  }
}

export default Category;