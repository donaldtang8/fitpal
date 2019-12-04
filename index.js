const buttons = document.querySelectorAll("button");
const form = document.querySelector("form");
const formActivity = document.querySelector("form span");
const input = document.querySelector("input");
const error = document.querySelector(".error");

let activity = "cycling";

buttons.forEach(button => {
  button.addEventListener("click", e => {
    e.preventDefault();
    // get clicked button's activity
    activity = e.target.dataset.activity;
    // remove active class on old and add active class on new
    buttons.forEach(button => button.classList.remove("active"));
    e.target.classList.add("active");
    // set id of input field
    input.setAttribute("id", activity);
    // set text of form span
    formActivity.textContent = activity;
  });
});

// form submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  const distance = parseInt(input.value);
  if (distance) {
    await db.collection("activities").add({
      distance,
      activity,
      date: new Date().toString()
    });
    error.textContent = "";
    input.value = "";
  } else {
    error.textContent = "Please enter a valid distance";
  }
});
