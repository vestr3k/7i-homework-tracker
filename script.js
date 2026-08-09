import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "./firebase.js";


/* =========================
   TRANSLATIONS
========================= */

const translations = {

    id: {
        tracker: "Homework Tracker",
        class: "Kelas 7I",
        classLabel: "KELAS 7I",
        homework: "Pekerjaan Rumah",
        description: "Pantau semua tugas yang harus dikerjakan.",
        search: "Cari tugas...",
        dueSoonest: "Paling Dekat",
        dueLatest: "Paling Jauh",
        subject: "Mata Pelajaran",
        admin: "Admin",
        noHomework: "Belum ada tugas",
        newHomework: "Tugas baru akan muncul di sini.",
        due: "Dikumpulkan"
    },

    en: {
        tracker: "Homework Tracker",
        class: "Class 7I",
        classLabel: "CLASS 7I",
        homework: "Homework",
        description: "Keep track of everything that's due.",
        search: "Search homework...",
        dueSoonest: "Due Soonest",
        dueLatest: "Due Latest",
        subject: "Subject",
        admin: "Admin",
        noHomework: "No homework yet",
        newHomework: "New homework will appear here.",
        due: "Due"
    }

};


let currentLanguage =
    localStorage.getItem("7i-language") || "id";


const languageSelect =
    document.getElementById("languageSelect");


function setLanguage(language) {

    if (!translations[language]) {
        language = "id";
    }

    currentLanguage = language;

    const texts =
        translations[language];


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            if (texts[key]) {
                element.textContent =
                    texts[key];
            }

        });


    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach(element => {

            const key =
                element.dataset.i18nPlaceholder;

            if (texts[key]) {
                element.placeholder =
                    texts[key];
            }

        });


    localStorage.setItem(
        "7i-language",
        language
    );

    document.documentElement.lang =
        language;

    render();
}


languageSelect.value =
    currentLanguage;


setLanguage(currentLanguage);


languageSelect.addEventListener(
    "change",
    () => {

        setLanguage(
            languageSelect.value
        );

    }
);



/* =========================
   HOMEWORK
========================= */

const homeworkList =
    document.getElementById("homeworkList");

const search =
    document.getElementById("search");

const sort =
    document.getElementById("sort");


let homework = [];


/* =========================
   FIRESTORE
========================= */

const homeworkRef =
    collection(db, "homework");


const homeworkQuery =
    query(
        homeworkRef,
        orderBy("due", "asc")
    );


onSnapshot(
    homeworkQuery,
    snapshot => {

        homework =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));

        render();

    },

    error => {

        console.error(
            "Firestore error:",
            error
        );

        homeworkList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Unable to load homework
                </h3>

                <p>
                    Check your Firestore setup.
                </p>

            </div>
        `;

    }
);



/* =========================
   RENDER
========================= */

function render() {

    let items =
        [...homework];


    /* SEARCH */

    const searchText =
        search.value
            .toLowerCase()
            .trim();


    if (searchText) {

        items =
            items.filter(item => {

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

                <div class="empty-icon">
                    <span class="check-icon"></span>
                </div>

                <h3>
                    ${translations[currentLanguage].noHomework}
                </h3>

                <p>
                    ${translations[currentLanguage].newHomework}
                </p>

            </div>

        `;

        return;
    }


    /* CARDS */

    homeworkList.innerHTML =
        items.map(item => {

            const date =
                formatDate(item.due);


            return `

                <article
                    class="homework-card"
                >

                    <div
                        class="homework-info"
                    >

                        <div
                            class="subject"
                        >
                            ${escapeHTML(
                                item.subject || ""
                            )}
                        </div>


                        <h3
                            class="homework-title"
                        >
                            ${escapeHTML(
                                item.title || ""
                            )}
                        </h3>


                        <p
                            class="homework-details"
                        >
                            ${escapeHTML(
                                item.details || ""
                            )}
                        </p>

                    </div>


                    <div
                        class="due-date"
                    >

                        <span
                            class="due-label"
                        >
                            ${translations[currentLanguage].due}
                        </span>

                        <span>
                            ${date}
                        </span>

                    </div>

                </article>

            `;

        }).join("");

}



/* =========================
   SEARCH / SORT
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
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        currentLanguage === "id"
            ? "id-ID"
            : "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}



/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
