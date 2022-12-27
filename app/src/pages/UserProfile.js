import Header from "../components/Header.js";

let UserProfile = {
  title: "User profile",
  render: () => {
    let view = `
        <div class="head_bg">
          <h1>User profile</h1>
        </div>
        <div class="profile_section">
          <div class="profile_nav_wrap">
            <ul class="profile_nav">
              <li><a href="#" class="profile_tab active_tab">Your details</a></li>
            </ul>
          </div>
          <div class="profile_info_wrap">
            <h2>Account Details</h2>
            <div class="main_container">
              <label for="email" class="profile_label">E-mail</label>
              <input type="email" class="user_input" id="email" readonly>
              <label for="password" class="profile_label">Password</label>
              <input type="text" class="user_input" id="password" readonly>
              <div class="details_info_wrap">
                <a href="#" class="logout_btn">Log out</a>
              </div>
            </div>
          </div>
        </div>
        
    `;

    return view
  },
  after_render: async () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    let userData = localStorage.getItem("_r_usrname") 
    ? JSON.parse(localStorage.getItem("_r_usrname")) 
    : JSON.parse(sessionStorage.getItem("_r_usrname"));
    email.value = userData.email;
    password.value = userData.password;

    const header = document.getElementById("header");
    const logoutBtn = document.querySelector(".logout_btn");
    logoutBtn.addEventListener("click", e => {
      localStorage.removeItem("_r_usrname") || sessionStorage.removeItem("_r_usrname");
      header.innerHTML = Header.render();
      Header.after_render();
    });

    const profileTab = document.querySelector(".profile_tab");
    profileTab.addEventListener("click", (e) =>{
      e.preventDefault()
    }); 
  }
}

export default UserProfile;