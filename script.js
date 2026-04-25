// Clear localStorage only on direct refresh, not when navigating between pages
// Use sessionStorage to track if we're navigating between pages
if (!sessionStorage.getItem("navigatingBetweenPages")) {
    // This is a direct refresh or first load - clear everything
    localStorage.clear();
} else {
    // We're coming from another page - keep the data
    sessionStorage.removeItem("navigatingBetweenPages");
}

let teachers = [];
let courses = [];
let rooms = [];
let isReloadingFromFileLoad = false;

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
    
    // Keep loadedProject data if it exists (for restored cells and summary)
    // Only clear isFileLoaded flag so next time we refresh index.html it clears
    localStorage.removeItem("isFileLoaded");
    
    // Set flag to indicate we're navigating between pages
    sessionStorage.setItem("navigatingBetweenPages", "true");

    window.location.href = "routine.html";
}


/* LOAD FILE */
function loadJSON(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();

    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);

            // Store the COMPLETE loaded data (including cells and summary)
            localStorage.setItem("universityName", data.university || "");
            localStorage.setItem("departmentName", data.department || "");
            localStorage.setItem("teachers", JSON.stringify(data.teachers || []));
            localStorage.setItem("courses", JSON.stringify(data.courses || []));
            localStorage.setItem("rooms", JSON.stringify(data.rooms || []));
            localStorage.setItem("examCount", data.examCount || 1);
            
            // IMPORTANT: Store the complete loaded project data for routine.html restoration
            localStorage.setItem("loadedProject", JSON.stringify(data));
            localStorage.setItem("isFileLoaded", "true");

            // Update the page without reloading
            document.getElementById("universityName").value = data.university || "";
            document.getElementById("departmentName").value = data.department || "";
            
            if (data.teachers) {
                teachers = data.teachers;
            }
            if (data.courses) {
                courses = data.courses;
            }
            if (data.rooms) {
                rooms = data.rooms;
            }
            if (data.examCount) {
                document.getElementById("exam_number").value = data.examCount;
            }

            renderTeachers();
            renderCourses();
            renderRooms();

            alert("File loaded successfully!");
        } catch (err) {
            alert("Error loading file: " + err.message);
        }
    };

    reader.readAsText(file);
}

/* RESTORE LOADED DATA */
function restoreLoadedData() {
    // Only restore input fields if data exists in localStorage
    // The complete restoration of cells and summary will happen in routine.html
    let universityName = localStorage.getItem("universityName");
    let departmentName = localStorage.getItem("departmentName");
    let storedTeachers = localStorage.getItem("teachers");
    let storedCourses = localStorage.getItem("courses");
    let storedRooms = localStorage.getItem("rooms");
    let examCount = localStorage.getItem("examCount");

    if (universityName) {
        document.getElementById("universityName").value = universityName;
    }

    if (departmentName) {
        document.getElementById("departmentName").value = departmentName;
    }

    if (storedTeachers) {
        teachers = JSON.parse(storedTeachers);
    }

    if (storedCourses) {
        courses = JSON.parse(storedCourses);
    }

    if (storedRooms) {
        rooms = JSON.parse(storedRooms);
    }

    if (examCount) {
        document.getElementById("exam_number").value = examCount;
    }

    renderTeachers();
    renderCourses();
    renderRooms();
}

/* INITIAL */
restoreLoadedData();
