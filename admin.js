import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "./firebase.js";


const ADMIN_CODE = "7I2026";

const loginSection = document.getElementById("loginSection");
const adminContent = document.getElementById("adminContent");
const adminCode = document.getElementById("adminCode");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");
const logoutButton = document.getElementById("logoutButton");

const subject = document.getElementById("subject");
const title = document.getElementById("title");
const details = document.getElementById("details");
const dueDate = document.getElementById("dueDate");
const addButton = document.getElementById("addButton");
const adminHomeworkList = document.getElementById("adminHomeworkList");


/* LOGIN */

loginButton.addEventListener("click", login);

adminCode.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login();
    }
});


function login() {

    if (adminCode.value.trim() === ADMIN_CODE) {

        sessionStorage.setItem("7i-admin", "true");

        showAdmin();

    } else {

        loginError.textContent = "Kode admin salah.";

        adminCode.value = "";

        adminCode.focus();
    }
}


function showAdmin() {

    loginSection.classList.add("hidden");

    adminContent.classList.remove("hidden");
}


if (sessionStorage.getItem("7i-admin") === "true") {
    showAdmin();
}


/* LOGOUT */

logoutButton.addEventListener("click", function() {

    sessionStorage.removeItem("7i-admin");

    window.location.reload();

});


/* ADD HOMEWORK */

addButton.addEventListener("click", addHomework);


async function addHomework() {

    const subjectValue = subject.value.trim();
    const titleValue = title.value.trim();
    const detailsValue = details.value.trim();
    const dueValue = dueDate.value;


    if (!subjectValue || !titleValue || !dueValue) {

        alert(
            "Please fill in the subject, title and due date."
        );

        return;
    }


    addButton.disabled = true;

    addButton.textContent = "Adding...";


    try {

        await addDoc(
            collection(db, "homework"),
            {
                subject: subjectValue,
                title: titleValue,
                details: detailsValue,
                due: dueValue,
                createdAt: serverTimestamp()
            }
        );


        subject.value = "";
        title.value = "";
        details.value = "";
        dueDate.value = "";


        alert("Homework added successfully!");

    } catch (error) {

        console.error(error);

        alert(
            "Could not add homework.\n\n" +
            error.message
        );

    }


    addButton.disabled = false;

    addButton.textContent = "+ Tambah Homework";
}


/* LOAD HOMEWORK */

const homeworkQuery = query(
    collection(db, "homework"),
    orderBy("due", "asc")
);


onSnapshot(
    homeworkQuery,

    function(snapshot) {

        const homework = snapshot.docs.map(function(doc) {

            return {
                id: doc.id,
                ...doc.data()
            };

        });


        renderAdminHomework(homework);

    },

    function(error) {

        console.error(error);

        adminHomeworkList.innerHTML = `
            <p class="error-message">
                Error loading homework:
                ${escapeHTML(error.message)}
            </p>
        `;

    }
);


/* RENDER */

function renderAdminHomework(homework) {

    if (homework.length === 0) {

        adminHomeworkList.innerHTML = `
            <p class="muted">
                Belum ada homework.
            </p>
        `;

        return;
    }


    adminHomeworkList.innerHTML = homework.map(function(item) {

        return `
            <div
                class="admin-homework"
                data-id="${item.id}"
            >

                <div>

                    <div class="subject">
                        ${escapeHTML(item.subject || "")}
                    </div>

                    <strong>
                        ${escapeHTML(item.title || "")}
                    </strong>

                    <p>
                        ${escapeHTML(item.details || "")}
                    </p>

                    <small>
                        Due: ${escapeHTML(item.due || "-")}
                    </small>

                </div>


                <div class="admin-actions">

                    <button
                        class="edit-button"
                        onclick="editHomework('${item.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteHomework('${item.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


/* DELETE */

window.deleteHomework = async function(id) {

    if (!confirm("Delete this homework?")) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "homework", id)
        );

    } catch (error) {

        console.error(error);

        alert(
            "Could not delete homework.\n\n" +
            error.message
        );

    }

};


/* EDIT */

window.editHomework = async function(id) {

    const newSubject = prompt("Subject:");

    if (newSubject === null) {
        return;
    }


    const newTitle = prompt("Title:");

    if (newTitle === null) {
        return;
    }


    const newDetails = prompt("Details:");

    if (newDetails === null) {
        return;
    }


    const newDue = prompt(
        "Due date (YYYY-MM-DD):"
    );

    if (newDue === null) {
        return;
    }


    try {

        await updateDoc(
            doc(db, "homework", id),
            {
                subject: newSubject.trim(),
                title: newTitle.trim(),
                details: newDetails.trim(),
                due: newDue.trim()
            }
        );


        alert("Homework updated!");

    } catch (error) {

        console.error(error);

        alert(
            "Could not update homework.\n\n" +
            error.message
        );

    }

};


/* SECURITY */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}