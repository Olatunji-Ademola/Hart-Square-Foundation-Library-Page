const sheetId = "11Ja5ovsM5C-sN1fpmwA64-R0ou4JEKkrnsjsPyVrQMg";
const gid = "922758314";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
const BookList = document.getElementById("bookList");
console.log(BookList);

async function getSheet() {
  try {
    let result = await fetch(url);
    let csvText = await result.text();
    let data = Papa.parse(csvText, { header: true }).data;
    return data;
  } catch (error) {
    console.error("Error fetching sheet:", error);
  }
}

function bookComponent(bookData) {
  if (!bookData) return;

  let component = `
  <div class="book">
  <div id="data">
  <h3 id="title">${bookData.Title}</h3>
  <h4 id="author">${bookData.Author}</h4>
  <h4 id="category">${bookData.Category}</h4>
  <h4 id="Location">${bookData.Collection} -${bookData.CatalogCode}</h4>
</div>
  <div class="checked" id="${
    bookData["Checked-Out"] == "TRUE" ? "checked-out" : "checked-in"
  }">${bookData["Checked-Out"] == "TRUE" ? "Checked-Out" : "Available"}</div>
  </div>`;
  return component;
}

export async function updateBooklist() {
  let data = await getSheet();

  for (let i = 0; i < 8; i++) {
    const bookData = data[i];

    let component = bookComponent(bookData);
    BookList.innerHTML += component;

    // console.log(i, component);
  }

  // overwrite the elements in the book Result list

  return data;
}

//////
const APPS_SCRIPT_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbx3hs4VLQ04kNQFiygqoEyBBEA5oTI6j0YB0pZnDfO2TQwUxvBqZ9J55qRnol86jLn0/exec";

async function getSheetTimestamp() {
  try {
    const response = await fetch(APPS_SCRIPT_WEBAPP_URL);

    if (!response.ok) throw new Error("Failed to contact Google Script");

    const data = await response.json();

    if (data.error) {
      console.error("Apps Script Error:", data.error);
      return null;
    }

    // This variable now holds your ISO string timestamp
    const rawTimestamp = data.lastModified;
    console.log("Raw timestamp fetched:", rawTimestamp);

    // Convert it to a native JS Date object to use in your logic
    const lastModifiedDate = new Date(rawTimestamp);

    // Example logic execution:
    // doSomethingWithTime(lastModifiedDate);
    return lastModifiedDate;
  } catch (error) {
    console.error("Fetch request execution failed:", error);
    return null;
  }
}

// Execute the fetch
//    getSheetTimestamp();
