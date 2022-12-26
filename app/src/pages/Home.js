import Preloader from '../components/Preloader.js'

const root = document.getElementById("root");
const APIKey = "7de7f713e27c426da586100a754de994";

// получаем рецепты, по дефолту пасту
const fetchData = async function(value = "pasta") {

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKey}&number=21&query=${value}`);
    const data = await response.json();
    createRecipesList(data);
  } catch (error) {
    console.error("Failing fetching data.", error);
  }
}

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

let Home = {
  title: "Our recipes",
  render: async () => {
    const view = `<div class="head_bg">
                    <h1>Recipes</h1>
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
                            <li class="category">Pasta</li>
                            <li class="category">Beef</li>
                            <li class="category">Salad</li>
                            <li class="category">Chocolate</li>
                            <li class="category">Soup</li>
                          </ul>
                        </div>
                        <div class="food_wrapper"></div>
                      </div>
                    </div>
                  </div>`;

    return view;
  },
  after_render: async () => {
    const categoryBtn = document.querySelectorAll(".category");
    const foodWrapper = document.querySelector(".food_wrapper");
    const searchBtn = document.querySelector(".search_btn");
    const searchInput = document.querySelector(".search_input");
    await fetchData();

    // быстрый поиск рецептов из предложенных сверху страницы
    categoryBtn.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const value = e.target.innerText.toLowerCase();        
        foodWrapper.innerHTML = Preloader.render();
        await fetchData(value);
      })
    });

    // поиск с помощью ввода названия рецепта, формируем список, или ошибку, если совпадений нет
    searchBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      if (searchInput.value.trim()) {
        await fetchData(searchInput.value.trim());
      }

      searchInput.value = "";
    });
  }
}

export default Home;
  
