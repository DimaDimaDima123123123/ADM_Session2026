let posts = JSON.parse(localStorage.getItem("posts") || "[]");

function $(sel){ return document.querySelector(sel); }

function saveUser(email, password){
  localStorage.setItem("linkup_user", JSON.stringify({ email, password }));
}

function getUser(){
  const raw = localStorage.getItem("linkup_user");
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setSession(email){
  localStorage.setItem("linkup_session", JSON.stringify({ email, time: Date.now() }));
}

function showError(el, text){
  if(!el) return;
  el.textContent = text;
  el.style.display = "block";
}

function hideError(el){
  if(!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function initSignup(){
  const form = $("#signupForm");
  if(!form) return;

  const err = $("#signupErr");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(err);

    const email = $("#suEmail").value.trim();
    const pass = $("#suPass").value.trim();
    const pass2 = $("#suPass2").value.trim();

    if(!email || !pass || !pass2){
      showError(err, "fill in all fields.");
      return;
    }
    if(!email.includes("@") || !email.includes(".")){
      showError(err, "enter correct email.");
      return;
    }
    if(pass.length < 4){
      showError(err, "password at least 4 characters.");
      return;
    }
    if(pass !== pass2){
      showError(err, "passwords do not match.");
      return;
    }

    saveUser(email, pass);

    const code = String(Math.floor(10000 + Math.random() * 90000));
    localStorage.setItem("signup_code", code);

    showToast("Verification code: " + code);

    window.location.href = "signup-code.html";
  });
}

function initLogin(){
  const form = $("#loginForm");
  if(!form) return;

  const err = $("#loginErr");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(err);

    const email = $("#liEmail").value.trim();
    const pass = $("#liPass").value.trim();

    if(!email || !pass){
      showError(err, "enter email and password.");
      return;
    }

    const user = getUser();
    if(!user){
      showError(err, "user not found.");
      return;
    }

    if(email !== user.email || pass !== user.password){
      showError(err, "wrong email or password.");
      return;
    }

    const code = String(Math.floor(10000 + Math.random() * 90000));
    localStorage.setItem("login_code", code);

    showToast("Authentication code: " + code);

    window.location.href = "login-code.html";
  });
}


function initCodePage(type){ 
  const submit = $("#submitCode");
  if(!submit) return;

  const err = $("#codeErr");
  const inputs = Array.from(document.querySelectorAll(".code-input"));

  inputs.forEach((inp, idx) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
      if(inp.value && idx < inputs.length - 1) inputs[idx + 1].focus();
    });

    inp.addEventListener("keydown", (e) => {
      if(e.key === "Backspace" && !inp.value && idx > 0){
        inputs[idx - 1].focus();
      }
    });
  });

  submit.addEventListener("click", () => {
    hideError(err);
    const entered = inputs.map(i => i.value).join("");

    if(entered.length !== inputs.length){
      showError(err, "enter the entire code.");
      return;
    }

    const real = localStorage.getItem(type === "signup" ? "signup_code" : "login_code");
    if(!real){
      showError(err, "code not found, repeat the process.");
      return;
    }

    if(entered !== real){
      showError(err, "wrong code.");
      return;
    }

    const user = getUser();
    if(user) setSession(user.email);

    localStorage.removeItem("signup_code");
    localStorage.removeItem("login_code");

    window.location.href = "home.html";
  });

  const back = $("#backBtn");
  if(back){
    back.addEventListener("click", () => {
      window.location.href = (type === "signup") ? "signup.html" : "login.html";
    });
  }

  const resend = $("#resendBtn");
  if(resend){
    resend.addEventListener("click", () => {
      const newCode = String(Math.floor(10000 + Math.random() * 90000));
      localStorage.setItem(type === "signup" ? "signup_code" : "login_code", newCode);
      showToast("New code: " + newCode);

      showError(err, "new code has been sent.");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSignup();
  initLogin();

  const page = document.body.getAttribute("data-page");

  if(page === "signup-code"){
    initCodePage("signup");

    const code = localStorage.getItem("signup_code");
    if(code){
      showToast("Verification code: " + code);
    }
  }

  if(page === "login-code"){
    initCodePage("login");

    const code = localStorage.getItem("login_code");
    if(code){
      showToast("Authentication code: " + code);
    }
  }
});


function showToast(text){
  const toast = document.getElementById("toast");
  if(!toast) return;

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("navMenu");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {

  const block = document.getElementById("createPost");
  const trigger = document.getElementById("postTrigger");
  const textarea = document.getElementById("postTextarea");
  const publish = document.getElementById("publishBtn");

  if(!block || !trigger || !textarea || !publish) return;

  trigger.addEventListener("click", () => {
    block.classList.add("active");
    trigger.style.display = "none";
    textarea.focus();
  });

  textarea.addEventListener("input", () => {
    publish.disabled = textarea.value.trim().length === 0;
  });

  publish.addEventListener("click", () => {
    const text = textarea.value.trim();
    if(!text) return;

    const userName = localStorage.getItem("current_user_name") || "Me";

const post = {
  author: userName,
  role: "Junior UI/UX Designer",
  text,
  createdAt: Date.now()
};

    const posts = JSON.parse(localStorage.getItem("linkup_posts") || "[]");
    posts.push(post);
    localStorage.setItem("linkup_posts", JSON.stringify(posts));

    if(typeof renderPosts === "function") renderPosts();

    textarea.value = "";
    publish.disabled = true;
    block.classList.remove("active");
    trigger.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if(!block.contains(e.target)){
      textarea.value = "";
      publish.disabled = true;
      block.classList.remove("active");
      trigger.style.display = "block";
    }
  });

});

function escapeHtml(str){
  return str
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderPosts(){
  const feed = document.getElementById("feed");
  if(!feed) return;

  const posts = JSON.parse(localStorage.getItem("linkup_posts") || "[]");

  feed.innerHTML = "";

  posts.slice().reverse().forEach((p, indexFromTop) => {
    const realIndex = posts.length - 1 - indexFromTop;

    const el = document.createElement("article");
    el.className = "panel post";
    el.innerHTML = `
      <div class="post-head">
        <div class="mini-avatar">
        <img src="img/man.svg" alt="" style="width: 33px;">
        </div>
        <div class="meta">
          <div class="who">${escapeHtml(p.author)}</div>
          <div class="job">${escapeHtml(p.role)}</div>
        </div>

        <!-- DELETE BUTTON -->
        <button class="delete-post-btn" data-index="${realIndex}">
          ✕
        </button>
      </div>

      <div class="post-body">
        ${escapeHtml(p.text).replace(/\n/g, "<br>")}
      </div>

      <div class="post-actions">
        <div>Like</div>
        <div>Comment</div>
        <div>Share</div>
        <div>Send</div>
      </div>
    `;

    feed.appendChild(el);
  });

  document.querySelectorAll(".delete-post-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      deletePost(index);
    });
  });
}

  function deletePost(index){
  const posts = JSON.parse(localStorage.getItem("linkup_posts") || "[]");
  posts.splice(index, 1);
  localStorage.setItem("linkup_posts", JSON.stringify(posts));
  renderPosts();
}

function renderPosts(){
  const feed = document.getElementById("feed");
  if(!feed) return;

  const posts = JSON.parse(localStorage.getItem("linkup_posts") || "[]");
  feed.innerHTML = "";

  posts.slice().reverse().forEach((p, indexFromTop) => {
    const realIndex = posts.length - 1 - indexFromTop;

    const el = document.createElement("article");
    el.className = "panel post";
    el.innerHTML = `
      <div class="post-head">
        <div class="mini-avatar">
          <img src="img/man.svg" alt="" style="width: 33px;">
        </div>
        <div class="meta">
          <div class="who">${escapeHtml(p.author)}</div>
          <div class="job">${escapeHtml(p.role)}</div>
        </div>

        <button class="delete-post-btn" data-index="${realIndex}">✕</button>
      </div>

      <div class="post-body">
        ${escapeHtml(p.text).replace(/\n/g, "<br>")}
      </div>

      <div class="post-actions">
        <div>Like</div>
        <div>Comment</div>
        <div>Share</div>
        <div>Send</div>
      </div>
    `;

    feed.appendChild(el);
  });

  document.querySelectorAll(".delete-post-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deletePost(Number(btn.dataset.index));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("uiOverlay");
  const modal = document.getElementById("newMessageModal");
  const filtersMenu = document.getElementById("msgFiltersMenu");
  const dotsMenu = document.getElementById("msgDotsMenu");

  const btnNewMsg = document.getElementById("openNewMessage");
  const btnFilters = document.getElementById("openMsgFilters");
  const btnDots = document.getElementById("openMsgMenu");
  const btnClose = document.getElementById("closeNewMessage");

  function closeAll(){
    modal.classList.remove("show");
    filtersMenu.classList.remove("show");
    dotsMenu.classList.remove("show");
    overlay.classList.remove("show");
  }

  overlay.addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

  btnNewMsg.addEventListener("click", () => {
    closeAll();
    modal.classList.add("show");
    overlay.classList.add("show");
  });

  btnClose.addEventListener("click", closeAll);

  btnFilters.addEventListener("click", (e) => {
    e.stopPropagation();
    const r = btnFilters.getBoundingClientRect();
    closeAll();
    filtersMenu.style.left = (r.left - 140) + "px";
    filtersMenu.style.top = (r.bottom + 8) + "px";
    filtersMenu.classList.add("show");
    overlay.classList.add("show");
  });

  btnDots.addEventListener("click", (e) => {
    e.stopPropagation();
    const r = btnDots.getBoundingClientRect();
    closeAll();
    dotsMenu.style.left = (r.left - 150) + "px";
    dotsMenu.style.top = (r.bottom + 8) + "px";
    dotsMenu.classList.add("show");
    overlay.classList.add("show");
  });

  filtersMenu.addEventListener("click", (e) => {
    const b = e.target.closest(".drop-item");
    if (!b) return;
    filtersMenu.querySelectorAll(".drop-item").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
  });

  dotsMenu.addEventListener("click", (e) => {
    const b = e.target.closest(".drop-item");
    if (!b) return;
    dotsMenu.querySelectorAll(".drop-item").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
  });
});
