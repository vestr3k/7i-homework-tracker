import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { db } from "./firebase.js";


/* =========================
   FIREBASE AUTH
========================= */

const auth = getAuth();


/* =========================
   ADMIN CODE
========================= */

const ADMIN_CODE = "7I2026";

const loginSection =
    document.getElementById("loginSection");

const adminContent =
    document.getElementById("adminContent");

const adminCode =
    document.getElementById("adminCode");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================
   HOMEWORK ELEMENTS
========================= */

const subject =
    document.getElementById("subject");

const title =
    document.getElementById("title");

const details =
    document.getElementById("details");

const dueDate =
    document.getElementById("dueDate");

const addButton =
    document.getElementById("addButton");

const adminHomeworkList =
    document.getElementById(
        "adminHomeworkList"
    );


/* =========================
   STUDENT ELEMENTS
========================= */

const studentName =
    document.getElementById("studentName");

const studentUsername =
    document.getElementById("studentUsername");

const studentPassword =
    document.getElementById("studentPassword");

const createStudentButton =
    document.getElementById(
        "createStudentButton"
    );

const studentMessage =
    document.getElementById(
        "studentMessage"
    );

const studentList =
    document.getElementById(
        "studentList"
    );


/* =========================
   ADMIN LOGIN
========================= */

loginButton.addEventListener(
    "click",
    login
);

adminCode.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            login();
        }

    }
);


function login() {

    if (
        adminCode.value.trim()
        === ADMIN_CODE
    ) {

        sessionStorage.setItem(
            "7i-admin",
            "true"
        );

        showAdmin();

    } else {

        loginError.textContent =
            "Kode admin salah.";

        adminCode.value = "";

        adminCode.focus();

    }

}


function showAdmin() {

    loginSection.classList.add(
        "hidden"
    );

    adminContent.classList.remove(
        "hidden"
    );

}


if (
    sessionStorage.getItem(
        "7i-admin"
    ) === "true"
) {

    showAdmin();

}


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "7i-admin"
        );

        window.location.reload();

    }
);


/* =========================
   ADD HOMEWORK
========================= */

addButton.addEventListener(
    "click",
    addHomework
);


async function addHomework() {

    const subjectValue =
        subject.value.trim();

    const titleValue =
        title.value.trim();

    const detailsValue =
        details.value.trim();

    const dueValue =
        dueDate.value;


    if (
        !subjectValue ||
        !titleValue ||
        !dueValue
    ) {

        alert(
            "Please fill in the subject, title and due date."
        );

        return;

    }


    addButton.disabled = true;

    addButton.textContent =
        "Adding...";


    try {

        await addDoc(
            collection(
                db,
                "homework"
            ),
            {

                subject:
                    subjectValue,

                title:
                    titleValue,

                details:
                    detailsValue,

                due:
                    dueValue,

                createdAt:
                    serverTimestamp()

            }
        );


        subject.value = "";
        title.value = "";
        details.value = "";
        dueDate.value = "";


        alert(
            "Homework added successfully!"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Could not add homework.\n\n"
            + error.message
        );

    }


    addButton.disabled = false;

    addButton.textContent =
        "+ Tambah Homework";

}


/* =========================
   LOAD HOMEWORK
========================= */

const homeworkQuery =
    query(
        collection(
            db,
            "homework"
        ),
        orderBy(
            "due",
            "asc"
        )
    );


onSnapshot(
    homeworkQuery,

    function(snapshot) {

        const homework =
            snapshot.docs.map(
                function(doc) {

                    return {
                        id: doc.id,
                        ...doc.data()
                    };

                }
            );


        renderAdminHomework(
            homework
        );

    },

    function(error) {

        console.error(error);

        adminHomeworkList.innerHTML = `
            <p class="error-message">
                Error loading homework:
                ${escapeHTML(
                    error.message
                )}
            </p>
        `;

    }
);


/* =========================
   RENDER HOMEWORK
========================= */

function renderAdminHomework(
    homework
) {

    if (homework.length === 0) {

        adminHomeworkList.innerHTML = `
            <p class="muted">
                Belum ada homework.
            </p>
        `;

        return;

    }


    adminHomeworkList.innerHTML =
        homework.map(
            function(item) {

                return `
                    <div
                        class="admin-homework"
                        data-id="${item.id}"
                    >

                        <div>

                            <div class="subject">
                                ${escapeHTML(
                                    item.subject || ""
                                )}
                            </div>

                            <strong>
                                ${escapeHTML(
                                    item.title || ""
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    item.details || ""
                                )}
                            </p>

                            <small>
                                Due:
                                ${escapeHTML(
                                    item.due || "-"
                                )}
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

            }
        ).join("");

}


/* =========================
   DELETE HOMEWORK
========================= */

window.deleteHomework =
    async function(id) {

        if (
            !confirm(
                "Delete this homework?"
            )
        ) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "homework",
                    id
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "Could not delete homework.\n\n"
                + error.message
            );

        }

    };


/* =========================
   EDIT HOMEWORK
========================= */

window.editHomework =
    async function(id) {

        const newSubject =
            prompt("Subject:");

        if (
            newSubject === null
        ) {
            return;
        }


        const newTitle =
            prompt("Title:");

        if (
            newTitle === null
        ) {
            return;
        }


        const newDetails =
            prompt("Details:");

        if (
            newDetails === null
        ) {
            return;
        }


        const newDue =
            prompt(
                "Due date (YYYY-MM-DD):"
            );

        if (
            newDue === null
        ) {
            return;
        }


        try {

            await updateDoc(
                doc(
                    db,
                    "homework",
                    id
                ),
                {

                    subject:
                        newSubject.trim(),

                    title:
                        newTitle.trim(),

                    details:
                        newDetails.trim(),

                    due:
                        newDue.trim()

                }
            );


            alert(
                "Homework updated!"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Could not update homework.\n\n"
                + error.message
            );

        }

    };


/* =========================
   CREATE STUDENT
========================= */

createStudentButton.addEventListener(
    "click",
    createStudent
);


async function createStudent() {

    const name =
        studentName.value.trim();

    const username =
        studentUsername.value
            .trim()
            .toLowerCase();

    const password =
        studentPassword.value;


    if (
        !name ||
        !username ||
        !password
    ) {

        studentMessage.textContent =
            "Nama, username, dan password wajib diisi.";

        return;

    }


    if (password.length < 6) {

        studentMessage.textContent =
            "Password harus minimal 6 karakter.";

        return;

    }


    createStudentButton.disabled =
        true;

    createStudentButton.textContent =
        "Membuat akun...";


    try {

        /*
         * Firebase Authentication
         * membutuhkan format email.
         *
         * Siswa tetap login menggunakan
         * username di website.
         */

        const email =
            username +
            "@7i-homework.local";


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        /*
         * Simpan profil siswa.
         * Password TIDAK disimpan di Firestore.
         */

        await setDoc(
            doc(
                db,
                "students",
                user.uid
            ),
            {

                name: name,

                username: username,

                uid: user.uid,

                createdAt:
                    serverTimestamp()

            }
        );


        studentName.value = "";
        studentUsername.value = "";
        studentPassword.value = "";


        studentMessage.className =
            "success-message";

        studentMessage.textContent =
            "Akun siswa berhasil dibuat!";


    } catch (error) {

        console.error(error);

        studentMessage.className =
            "error-message";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            studentMessage.textContent =
                "Username tersebut sudah digunakan.";

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            studentMessage.textContent =
                "Password terlalu lemah.";

        }

        else {

            studentMessage.textContent =
                "Gagal membuat akun: "
                + error.message;

        }

    }


    createStudentButton.disabled =
        false;

    createStudentButton.textContent =
        "+ Buat Akun Siswa";

}


/* =========================
   LOAD STUDENTS
========================= */

const studentQuery =
    query(
        collection(
            db,
            "students"
        ),
        orderBy(
            "createdAt",
            "desc"
        )
    );


onSnapshot(
    studentQuery,

    function(snapshot) {

        const students =
            snapshot.docs.map(
                function(doc) {

                    return {
                        id: doc.id,
                        ...doc.data()
                    };

                }
            );


        renderStudents(
            students
        );

    },

    function(error) {

        console.error(
            "Student loading error:",
            error
        );

        studentList.innerHTML = `
            <p class="error-message">
                Gagal memuat siswa.
            </p>
        `;

    }
);


/* =========================
   RENDER STUDENTS
========================= */

function renderStudents(
    students
) {

    if (
        students.length === 0
    ) {

        studentList.innerHTML = `
            <p class="muted">
                Belum ada siswa.
            </p>
        `;

        return;

    }


    studentList.innerHTML =
        students.map(
            function(student) {

                return `
                    <div class="admin-homework">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    student.name || ""
                                )}
                            </strong>

                            <p>
                                @${escapeHTML(
                                    student.username || ""
                                )}
                            </p>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


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
