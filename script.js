let teachers = [];
let courses = [];
let rooms = [];

/* ADD TEACHER */
function addTeacher() {
    let name = document.getElementById("teacherName").value.trim();
    let short = document.getElementById("shortName").value.trim();

    if (name === "" || short === "") {
        alert("Fill all fields");
        return;
    }

    let exists = teachers.some(t => t.name === name);
    if (exists) return alert("Teacher already exists");

    let exists2 = teachers.some(t => t.short === short);
    if (exists2) return alert("Short name already exists");

    teachers.push({ name, short, count: 0 });

    document.getElementById("teacherName").value = "";
    document.getElementById("shortName").value = "";

    renderTeachers();
}

/* ADD COURSE */
function addCourse() {
    let code = document.getElementById("courseCode").value.trim();

    if (code === "") return alert("Enter course code");

    if (courses.includes(code)) return alert("Course already added");

    courses.push(code);

    document.getElementById("courseCode").value = "";

    renderCourses();
}

/* ADD ROOM */
function addRoom() {
    let room = document.getElementById("roomName").value.trim();

    if (room === "") return alert("Enter room");

    if (rooms.includes(room)) return alert("Room already added");

    rooms.push(room);

    document.getElementById("roomName").value = "";

    renderRooms();
}

/* DELETE */
function deleteTeacher(index) {
    teachers.splice(index, 1);
    renderTeachers();
}

function deleteCourse(index) {
    courses.splice(index, 1);
    renderCourses();
}

function deleteRoom(index) {
    rooms.splice(index, 1);
    renderRooms();
}


/* RENDER */
function renderTeachers() {
    let list = document.getElementById("teacherList");
    list.innerHTML = "";

    teachers.forEach((t, index) => {
        list.innerHTML += `
        <li>
            ${t.name} (${t.short})
            <button onclick="deleteTeacher(${index})">X</button>
        </li>
        `;
    });
}

function renderCourses() {
    let list = document.getElementById("courseList");
    list.innerHTML = "";

    courses.forEach((c, index) => {
        list.innerHTML += `
        <li>
            ${c}
            <button onclick="deleteCourse(${index})">X</button>
        </li>
        `;
    });
}

function renderRooms() {
    let list = document.getElementById("roomList");
    list.innerHTML = "";

    rooms.forEach((r, index) => {
        list.innerHTML += `
        <li>
            ${r}
            <button onclick="deleteRoom(${index})">X</button>
        </li>
        `;
    });
}

/* NEXT */
function goToRoutine() {

    let university = document.getElementById("universityName").value.trim();
    let department = document.getElementById("departmentName").value.trim();

    if (university === "" || department === "") {
        alert("Enter University and Department name");
        return;
    }

    if (teachers.length === 0 || courses.length === 0 || rooms.length === 0) {
        alert("Please add Teacher, Course and Room first");
        return;
    }

    let examCount = document.getElementById("exam_number").value;

    if (!examCount || examCount <= 0) {
        alert("Enter valid exam number");
        return;
    }

    localStorage.setItem("universityName", university);
    localStorage.setItem("departmentName", department);

    localStorage.setItem("teachers", JSON.stringify(teachers));
    localStorage.setItem("courses", JSON.stringify(courses));
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("examCount", examCount);

    window.location.href = "routine.html";
}


/* INITIAL */
renderTeachers();
renderCourses();
renderRooms();
