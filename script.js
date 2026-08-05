import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const list=document.getElementById("homeworkList");

const search=document.getElementById("search");

const sort=document.getElementById("sort");

let homework=[];

async function loadHomework(){

const snap=await getDocs(collection(db,"homework"));

homework=[];

snap.forEach(doc=>{

homework.push({

id:doc.id,

...doc.data()

});

});

display();

}

function display(){

if(!list)return;

list.innerHTML="";

let items=[...homework];

const keyword=search.value.toLowerCase();

items=items.filter(hw=>

(hw.subject||"").toLowerCase().includes(keyword)

||

(hw.title||"").toLowerCase().includes(keyword)

||

(hw.details||"").toLowerCase().includes(keyword)

);

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

items.forEach(hw=>{

list.innerHTML+=`

<div class="card">

<div class="subject">

${hw.subject}

</div>

<h3>

${hw.title}

</h3>

<div class="details">

${hw.details}

</div>

<div class="due">

?? ${hw.due}

</div>

</div>

`;

});

}

search.oninput=display;

sort.onchange=display;

loadHomework();

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