import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    db,
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


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

        console.error(
            "Firestore error:",
            error
        );

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


    if (items.length === 0) {

        homeworkList.innerHTML = `
            <div class="empty-state">

                <h3>No homework yet</h3>

                <p>
                    New homework will appear here.
                </p>

            </div>
        `;

        return;

    }


    homeworkList.innerHTML =
        items.map((item) => {

            const dueInfo =
                getDueInfo(item.due);

            return `
                <article class="homework-card">

                    <div class="homework-info">

                        <div class="subject">
                            ${escapeHTML(
                                item.subject || ""
                            )}
                        </div>

                        <h3 class="homework-title">
                            ${escapeHTML(
                                item.title || ""
                            )}
                        </h3>

                        <p class="homework-details">
                            ${escapeHTML(
                                item.details || ""
                            )}
                        </p>

                    </div>

                    <div
                        class="due-date ${dueInfo.className}"
                    >

                        <span class="due-label">
                            ${dueInfo.label}
                        </span>

                        <span>
                            ${dueInfo.date}
                        </span>

                    </div>

                </article>
            `;

        }).join("");

}


search.addEventListener(
    "input",
    render
);

sort.addEventListener(
    "change",
    render
);


/* =========================
   DUE DATE
========================= */

function getDueInfo(dateString) {

    if (!dateString) {

        return {
            label: "Due",
            date: "-",
            className: ""
        };

    }


    const dueDate =
        new Date(
            dateString + "T00:00:00"
        );

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        Math.round(
            (dueDate - today) /
            (1000 * 60 * 60 * 24)
        );


    const formattedDate =
        formatDate(dateString);


    if (difference < 0) {

        return {
            label: "Terlambat",
            date: formattedDate,
            className: "overdue"
        };

    }


    if (difference === 0) {

        return {
            label: "Hari ini",
            date: formattedDate,
            className: "due-today"
        };

    }


    if (difference === 1) {

        return {
            label: "Besok",
            date: formattedDate,
            className: "due-tomorrow"
        };

    }


    if (difference <= 7) {

        return {
            label:
                `${difference} hari lagi`,
            date: formattedDate,
            className: "due-soon"
        };

    }


    return {
        label: "Due",
        date: formattedDate,
        className: ""
    };

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


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
   GOOGLE LOGIN
========================= */

const loginButton =
    document.getElementById(
        "loginButton"
    );

const userInfo =
    document.getElementById(
        "userInfo"
    );

const userName =
    document.getElementById(
        "userName"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


console.log(
    "Google login elements:",
    {
        loginButton,
        userInfo,
        userName,
        logoutButton
    }
);


/* LOGIN */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        async function() {

            console.log(
                "Google login clicked"
            );

            try {

                await signInWithRedirect(
                    auth,
                    googleProvider
                );

            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );

                alert(
                    "Login gagal:\n\n" +
                    error.message
                );

            }

        }
    );

}


/* CHECK REDIRECT */

getRedirectResult(auth)
    .then((result) => {

        if (result && result.user) {

            console.log(
                "Google login successful:",
                result.user
            );

        }

    })
    .catch((error) => {

        console.error(
            "Google redirect error:",
            error
        );

        alert(
            "Google login gagal:\n\n" +
            error.message
        );

    });


/* LOGOUT */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* AUTH STATE */

onAuthStateChanged(
    auth,
    function(user) {

        console.log(
            "Auth state:",
            user
        );


        if (user) {

            if (loginButton) {

                loginButton.classList.add(
                    "hidden"
                );

            }


            if (userInfo) {

                userInfo.classList.remove(
                    "hidden"
                );

            }


            if (userName) {

                userName.textContent =
                    user.displayName ||
                    user.email ||
                    "Student";

            }

        }

        else {

            if (loginButton) {

                loginButton.classList.remove(
                    "hidden"
                );

            }


            if (userInfo) {

                userInfo.classList.add(
                    "hidden"
                );

            }


            if (userName) {

                userName.textContent = "";

            }

        }

    }
);


/* =========================
   HTML SAFETY
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
