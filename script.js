// ===============================
// Homework Tracker
// ===============================

let homework = JSON.parse(localStorage.getItem("homework")) || [

{
subject:"Mathematics",
details:"Complete Questions 1-25",
due:"2026-08-05"
},

{
subject:"English",
details:"Write a 500-word essay",
due:"2026-08-08"
}

];

// ------------------------

const list=document.getElementById("homeworkList");

const search=document.getElementById("search");

const sort=document.getElementById("sort");

const popup=document.getElementById("loginPopup");

const lock=document.getElementById("lockBtn");

const close=document.querySelector(".close");

const login=document.getElementById("loginBtn");

// ------------------------

function save(){

localStorage.setItem(
"homework",
JSON.stringify(homework)
);

}

// ------------------------

function display(){

if(!list) return;

list.innerHTML="";

let items=[...homework];

// SEARCH

const keyword=search.value.toLowerCase();

items=items.filter(hw=>

hw.subject.toLowerCase().includes(keyword)

||

hw.details.toLowerCase().includes(keyword)

);

// SORT

if(sort.value==="soon"){

items.sort((a,b)=>

new Date(a.due)-new Date(b.due)

);

}

if(sort.value==="late"){

items.sort((a,b)=>

new Date(b.due)-new Date(a.due)

);

}

if(sort.value==="subject"){

items.sort((a,b)=>

a.subject.localeCompare(b.subject)

);

}

// DISPLAY

items.forEach(hw=>{

list.innerHTML+=`

<div class="card">

<div class="subject">

${hw.subject}

</div>

<div class="details">

${hw.details}

</div>

<div class="due">

?? Due:
${new Date(hw.due).toLocaleDateString()}

</div>

</div>

`;

});

}

// ------------------------

if(search){

search.oninput=display;

}

if(sort){

sort.onchange=display;

}

// ------------------------

if(lock){

lock.onclick=()=>{

popup.style.display="flex";

}

}

// ------------------------

if(close){

close.onclick=()=>{

popup.style.display="none";

}

}

window.onclick=function(e){

if(e.target==popup){

popup.style.display="none";

}

}

// ------------------------

if(login){

login.onclick=()=>{

const code=document.getElementById("adminCode").value;

if(code==="Homework"){

window.location="admin.html";

}else{

alert("Wrong Admin Code");

}

}

}

// ------------------------

display();