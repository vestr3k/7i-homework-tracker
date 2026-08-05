import { db } from "./firebase.js";

import {
collection,
addDoc,
deleteDoc,
updateDoc,
doc,
onSnapshot,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const subject=document.getElementById("subject");
const title=document.getElementById("title");
const details=document.getElementById("details");
const due=document.getElementById("due");
const addBtn=document.getElementById("addBtn");
const list=document.getElementById("adminList");

addBtn.onclick=async()=>{

if(
!subject.value||
!title.value||
!details.value||
!due.value
){
alert("Fill in every field.");
return;
}

await addDoc(collection(db,"homework"),{

subject:subject.value,

title:title.value,

details:details.value,

due:due.value

});

subject.value="";
title.value="";
details.value="";
due.value="";

};

const q=query(collection(db,"homework"),orderBy("due"));

onSnapshot(q,(snapshot)=>{

list.innerHTML="";

snapshot.forEach(item=>{

const hw=item.data();

list.innerHTML+=`

<div class="card">

<div class="subject">${hw.subject}</div>

<h3>${hw.title}</h3>

<div class="details">${hw.details}</div>

<div class="due">📅 ${hw.due}</div>

<button onclick="editHomework('${item.id}')">
Edit
</button>

<button onclick="deleteHomework('${item.id}')">
Delete
</button>

</div>

`;

});

});

window.deleteHomework=async(id)=>{

await deleteDoc(doc(db,"homework",id));

}

window.editHomework=async(id)=>{

const s=prompt("Subject");

if(s===null)return;

const t=prompt("Title");

if(t===null)return;

const d=prompt("Details");

if(d===null)return;

const du=prompt("Due Date (YYYY-MM-DD)");

if(du===null)return;

await updateDoc(doc(db,"homework",id),{

subject:s,

title:t,

details:d,

due:du

});

}
