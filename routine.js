/* ===============================
   routine.js (FULL FIXED VERSION)
   Multiple Course in Same Cell
   Single Course Delete Support
================================= */


let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
let courses = JSON.parse(localStorage.getItem("courses")) || [];
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

let currentCell = null;
let currentType = "";

/* UNIVERSITY + DEPARTMENT NAME LOAD */
document.getElementById("uniTitle").innerText =
localStorage.getItem("universityName") || "";

document.getElementById("deptTitle").innerText =
localStorage.getItem("departmentName") || "";
/* ===============================
   DATE
================================= */
function openDate(cell) {
  currentCell = cell;

  let input = document.getElementById("hiddenDate");
  input.value = "";

  if (input.showPicker) input.showPicker();
  else input.click();
}

document.getElementById("hiddenDate").addEventListener("change", function () {
  if (!this.value) return;

  let [y, m, d] = this.value.split("-");

  let dateObj = new Date(y, m - 1, d);

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let dayName = days[dateObj.getDay()];

  currentCell.innerHTML = `${d}/${m}/${y} <br> ${dayName}`;

  let roomCount = rooms.length;

  let row = currentCell.parentElement;
  let rows = document.querySelectorAll("tr");

  let startIndex = Array.from(rows).indexOf(row);

  for (let i = 0; i < roomCount; i++) {
    let targetRow = rows[startIndex + i];

    if (targetRow) {
      targetRow.dataset.date = `${d}/${m}/${y}`;
    }
  }
});

/* ===============================
   MODAL OPEN
================================= */
function openModal(type, cell) {
  currentType = type;
  currentCell = cell;

  let select = document.getElementById("modalSelect");
  select.innerHTML = "";

  let list = [];

  if (type === "course") {
    list = courses;
  } else if (type === "room") {
    list = rooms;
  } else {
    list = teachers.map((t) => t.short);
  }

  list.forEach((item) => {
    let opt = document.createElement("option");
    opt.value = item;
    opt.text = item;
    select.appendChild(opt);
  });

  document.getElementById("modal").classList.remove("hidden");
}

/* ===============================
   SAVE VALUE
================================= */
function saveValue() {
  let val = document.getElementById("modalSelect").value;

  let row = currentCell.parentElement;
  let date = row.dataset.date;
  let shift = currentCell.dataset.shift;

  if (!date) {
    alert("Select date first!");
    return;
  }

  let allCells = document.querySelectorAll("td");

  for (let cell of allCells) {
    if (cell === currentCell) continue;

    let cellRow = cell.parentElement;
    let cellDate = cellRow.dataset.date;
    let cellShift = cell.dataset.shift;

    if (!cellDate || !cellShift) continue;

    let type = cell.dataset.type;
    let cellValue = cell.dataset.value || cell.innerText.trim();

    /* ROOM CONFLICT */
    if (currentType === "room" && type === "room") {
      if (cellValue === val && cellDate === date && cellShift === shift) {
        alert("Room already used in this date & shift!");
        return;
      }
    }

    /* COURSE UNIQUE */
    if (currentType === "course" && type === "course") {
      let arr = cell.dataset.courses
        ? JSON.parse(cell.dataset.courses)
        : [];

      if (arr.includes(val)) {
        alert("This course already assigned!");
        return;
      }
    }

    /* TEACHER CONFLICT */
    if (
      (currentType === "guard" || currentType === "invigilator") &&
      (type === "guard" || type === "invigilator")
    ) {
      if (cellValue === val && cellDate === date && cellShift === shift) {
        alert("Teacher already assigned in this shift!");
        return;
      }
    }
  }

  /* =====================
     MULTIPLE COURSE ADD
  ====================== */
  if (currentType === "course") {
    let arr = currentCell.dataset.courses
      ? JSON.parse(currentCell.dataset.courses)
      : [];

    if (!arr.includes(val)) {
      arr.push(val);
    }

    currentCell.dataset.courses = JSON.stringify(arr);
    currentCell.innerHTML = arr.join("<br>");
    closeModal();
    return;
  }

  /* =====================
     NORMAL SAVE
  ====================== */

  let oldVal = currentCell.dataset.value || currentCell.innerText.trim();

  if (oldVal && (currentType === "guard" || currentType === "invigilator")) {
    updateSummary(oldVal, -1);
  }

  currentCell.dataset.value = val;
  currentCell.innerText = val;

  if (currentType === "guard" || currentType === "invigilator") {
    updateSummary(val, +1);
  }

  closeModal();
}

/* ===============================
   DELETE VALUE
================================= */
function deleteValue() {
  /* =====================
     COURSE SINGLE DELETE
  ====================== */
  if (currentType === "course") {
    let arr = currentCell.dataset.courses
      ? JSON.parse(currentCell.dataset.courses)
      : [];

    let val = document.getElementById("modalSelect").value;

    arr = arr.filter((item) => item !== val);

    if (arr.length === 0) {
      currentCell.innerHTML = "";
      currentCell.removeAttribute("data-courses");
    } else {
      currentCell.dataset.courses = JSON.stringify(arr);
      currentCell.innerHTML = arr.join("<br>");
    }

    closeModal();
    return;
  }

  /* NORMAL DELETE */
  let oldVal = currentCell.innerText.trim();

  if (oldVal && (currentType === "guard" || currentType === "invigilator")) {
    updateSummary(oldVal, -1);
  }

  currentCell.innerText = "";
  currentCell.removeAttribute("data-value");

  closeModal();
}

/* ===============================
   SUMMARY
================================= */
function loadSummary() {
  let table = document.getElementById("summaryTable");

  teachers.forEach((t) => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td data-short="${t.short}">
        ${t.name} (${t.short})
      </td>
      <td>0</td>
    `;

    table.appendChild(row);
  });
}

function updateSummary(short, change) {
  let rows = document.querySelectorAll("#summaryTable tr");

  for (let i = 1; i < rows.length; i++) {
    let cell = rows[i].children[0];

    if (cell.dataset.short === short) {
      let countCell = rows[i].children[1];
      let count = parseInt(countCell.innerText);

      count += change;
      if (count < 0) count = 0;

      countCell.innerText = count;
    }
  }
}

/* ===============================
   CLOSE MODAL
================================= */
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

/* ===============================
   PDF DOWNLOAD
================================= */
function downloadPDF() {

  const { jsPDF } = window.jspdf;

  let table = document.querySelector(".table_section");
  let lunchCell = document.querySelector(".lunch");

  let originalText = lunchCell.innerText;
  lunchCell.innerText = "";

  let fileName = prompt("Enter PDF file name:", "routine");
  if (!fileName) fileName = "routine";

  html2canvas(table, {
    scale: 2,
    useCORS: true
  }).then((canvas) => {

    let imgData = canvas.toDataURL("image/png");

    let pdf = new jsPDF("l", "pt", "legal");

    // 🔥 PAGE SIZE
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();

    // 🔥 MARGINS (important fix)
    let margin = 20;

    let usableWidth = pageWidth - margin * 2;

    let imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;

    let position = 0;

    // first page
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin,
      usableWidth,
      imgHeight
    );

    heightLeft -= pageHeight;

    // next pages
    while (heightLeft > 0) {

      position -= pageHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position + margin, // 🔥 keeps gap from top
        usableWidth,
        imgHeight
      );

      heightLeft -= pageHeight;
    }

    pdf.save(fileName + ".pdf");

    lunchCell.innerText = originalText;
  });
}
// Extra
/* =====================================================
   CLEAN JSON SAVE / LOAD SYSTEM
   - Current form fully replaced by loaded file
   - Summary restored
   - Table restored
   - No duplicate rows
===================================================== */

let loadedData = null;

/* ===============================
   SAVE JSON
================================= */
function saveJSON() {

  let summary = [];
  let rows = document.querySelectorAll("#summaryTable tr");

  for (let i = 1; i < rows.length; i++) {

    let tds = rows[i].children;

    summary.push({
      teacher: tds[0].dataset.short,
      count: parseInt(tds[1].innerText) || 0
    });

  }

  let cells = [];

  document.querySelectorAll("td").forEach(cell => {
    cells.push({
      html: cell.innerHTML,
      type: cell.dataset.type || "",
      shift: cell.dataset.shift || "",
      value: cell.dataset.value || "",
      courses: cell.dataset.courses || "",
      date: cell.parentElement.dataset.date || ""
    });
  });

  let data = {
    university: localStorage.getItem("universityName") || "",
    department: localStorage.getItem("departmentName") || "",
    teachers,
    courses,
    rooms,
    examCount: localStorage.getItem("examCount") || 1,
    summary,
    cells
  };

  // 🔥 USER INPUT FILE NAME
  let fileName = prompt("Enter file name:", "routine");

  if (!fileName) fileName = "routine";

  let blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName + ".json"; // 🔥 auto .json extension
  a.click();
}

/* ===============================
   LOAD JSON
================================= */
function loadJSON(event) {

  let file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();

  reader.onload = function(e) {

    let data = JSON.parse(e.target.result);

    // FULL REPLACE CURRENT STATE
    localStorage.clear();

    localStorage.setItem("universityName", data.university || "");
    localStorage.setItem("departmentName", data.department || "");
    localStorage.setItem("teachers", JSON.stringify(data.teachers || []));
    localStorage.setItem("courses", JSON.stringify(data.courses || []));
    localStorage.setItem("rooms", JSON.stringify(data.rooms || []));
    localStorage.setItem("examCount", data.examCount || 1);
    localStorage.setItem("loadedProject", JSON.stringify(data));

    location.reload();
  };

  reader.readAsText(file);
}


/* ===============================
   AFTER RELOAD RESTORE
================================= */
function restoreLoadedProject() {

  let saved = localStorage.getItem("loadedProject");
  if (!saved) return;

  let data = JSON.parse(saved);

  // restore title
  document.getElementById("uniTitle").innerText =
    data.university || "";

  document.getElementById("deptTitle").innerText =
    data.department || "";

  // restore summary
  restoreSummary(data.summary);

  // restore cells
  restoreCells(data.cells);

  // remove temp restore cache
  localStorage.removeItem("loadedProject");
}


/* ===============================
   SUMMARY RESTORE
================================= */
function restoreSummary(summary) {

  let rows = document.querySelectorAll("#summaryTable tr");

  for (let i = 1; i < rows.length; i++) {

    let short = rows[i].children[0].dataset.short;

    let found = summary.find(t => t.teacher === short);

    rows[i].children[1].innerText =
      found ? found.count : 0;
  }
}


/* ===============================
   CELL RESTORE
================================= */
function restoreCells(cells) {

  let allCells = document.querySelectorAll("td");

  cells.forEach((c, i) => {

    if (!allCells[i]) return;

    allCells[i].innerHTML = c.html;

    if (c.type) allCells[i].dataset.type = c.type;
    if (c.shift) allCells[i].dataset.shift = c.shift;
    if (c.value) allCells[i].dataset.value = c.value;
    if (c.courses) allCells[i].dataset.courses = c.courses;

    if (c.date) {
      allCells[i].parentElement.dataset.date = c.date;
    }

  });
}


/* ===============================
   INIT PAGE
================================= */
function initPage() {

  teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  courses  = JSON.parse(localStorage.getItem("courses")) || [];
  rooms    = JSON.parse(localStorage.getItem("rooms")) || [];

  loadSummary();

  setTimeout(() => {
    restoreLoadedProject();
  }, 200);
}

initPage();