import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "./firebase.js";


const homeworkList = document.getElementById("homeworkList");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

let homework = [];


/* =========================
   LOAD FROM FIRESTORE
========================= */

const homeworkQuery = query(
    collection(db, "homework"),
    orderBy("due", "asc")
);

onSnapshot(
    homeworkQuery,

    (snapshot) => {

        homework = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        render();

    },

    (error) => {

        console.error("Firestore error:", error);

        homeworkList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load homework</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

    }
);


/* =========================
   RENDER
========================= */

function render() {

    let items = [...homework];

    const searchText =
        search.value.toLowerCase().trim();


    /* SEARCH */

    if (searchText) {

        items = items.filter((item) => {

            return (
                String(item.subject || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.title || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.details || "")
                    .toLowerCase()
                    .includes(searchText)
            );

        });

    }


    /* SORT */

    if (sort.value === "soon") {

        items.sort(
            (a, b) =>
                new Date(a.due) -
                new Date(b.due)
        );

    }

    else if (sort.value === "late") {

        items.sort(
            (a, b) =>
                new Date(b.due) -
                new Date(a.due)
        );

    }

    else if (sort.value === "subject") {

        items.sort(
            (a, b) =>
                String(a.subject || "")
                    .localeCompare(
                        String(b.subject || "")
                    )
        );

    }


    /* EMPTY */

    if (items.length === 0) {

        homeworkList.innerHTML = `
            <div class="empty-state">

                <h3>
                    No homework yet
                </h3>

                <p>
                    New homework will appear here.
                </p>

            </div>
        `;

        return;
    }


    /* HOMEWORK CARDS */

    homeworkList.innerHTML = items.map((item) => {

        return `
            <article class="homework-card">

                <div class="homework-info">

                    <div class="subject">
                        ${escapeHTML(item.subject || "")}
                    </div>

                    <h3 class="homework-title">
                        ${escapeHTML(item.title || "")}
                    </h3>

                    <p class="homework-details">
                        ${escapeHTML(item.details || "")}
                    </p>

                </div>

                <div class="due-date">

                    <span class="due-label">
                        Due
                    </span>

                    <span>
                        ${formatDate(item.due)}
                    </span>

                </div>

            </article>
        `;

    }).join("");

}


/* =========================
   SEARCH + SORT
========================= */

search.addEventListener(
    "input",
    render
);

sort.addEventListener(
    "change",
    render
);


/* =========================
   DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   HTML SAFETY
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
