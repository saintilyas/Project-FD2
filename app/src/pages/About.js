let About = {
  title: "About",
  render: () => {
    let view = `
    <div class="page_title">
      <h1>About Spcica</h1>
    </div>
    <div class="about_section">
      <div class="auto_container">
        <div class="inner_section margin-top">
          <img class="inner_section_logo" src="../img/footer-logo.png" alt="logo">
        </div>
        <h2 class="about_title">How to use Spcica</h2>
        <p class="about_text"><b>Catalog:</b><br>
          Use the "Recipes" button to view the recipes provided by our service or the "User recipes" button to view the recipes of our users. You can find out the recipe, ingredients, and share your impressions about the recipe in the comments. Attention, comments are available only to authorized users.<br><br>
          <b>Authorization:</b><br>
          In order to register or log into your account, click on the "Login" button in the upper right corner, fill out the form and log into your account. Now you can leave comments, share recipes with other users and add your favorite recipes to your favorites.<br><br>
          <b>Profile:</b><br>
          If the data entered incorrectly during registration, you can change them in your profile. To do this, go to your profile and click the "Edit" button. Change the incorrectly entered data in the field and click the "save" button.</p>
      </div>
    </div>
    `

    return view
  },
  after_render: () => {

  }
}

export default About;