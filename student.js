import { db } from "./firebase.js";

import {
collection,
onSnapshot,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const list = document.getElementById("homeworkList");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

let homework = [];

function render() {

    let items = [...homework];

    const key = search.value.toLowerCase();

    items = items.filter(hw =>
        hw.subject.toLowerCase().includes(key) ||
        hw.title.toLowerCase().includes(key) ||
        hw.details.toLowerCase().includes(key)
    );

    if(sort.value==="soon")
        items.sort((a,b)=>new Date(a.due)-new Date(b.due));

    if(sort.value==="late")
        items.sort((a,b)=>new Date(b.due)-new Date(a.due));

    if(sort.value==="subject")
        items.sort((a,b)=>a.subject.localeCompare(b.subject));

    list.innerHTML="";

    items.forEach(hw=>{

        list.innerHTML+=`
        <div class="card">

            <div class="subject">${hw.subject}</div>

            <h3>${hw.title}</h3>

            <div class="details">${hw.details}</div>

            <div class="due">
            ?? ${hw.due}
            </div>

        </div>
        `;

    });

}

const q=query(collection(db,"homework"),orderBy("due"));

onSnapshot(q,(snapshot)=>{

    homework=[];

    snapshot.forEach(doc=>{

        homework.push({
            id:doc.id,
            ...doc.data()
        });

    });

    render();

});

search.oninput=render;
sort.onchange=render;