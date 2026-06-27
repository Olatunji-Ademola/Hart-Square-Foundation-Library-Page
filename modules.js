const sheetId = "11Ja5ovsM5C-sN1fpmwA64-R0ou4JEKkrnsjsPyVrQMg";
const gid = "922758314";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

const BookList = document.getElementById("bookList");
const PaginationParentElemet = document.getElementById("paginationParent");
const BookDisplayNumber = 10;
let globalSearchBookRefinedResult = [];

export async function getSheet() {
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

function generatePagination(currentPage, totalPages) {
  // If total pages are 7 or fewer, just return all pages sequentially
  if (totalPages <= 7) {
    let pagination = Array.from({ length: totalPages }, (_, i) => i + 1);
    pagination.unshift("<");
    pagination.push(">");
    return pagination;
  }

  const pagination = [];

  // Determine if we need ellipses on the left or right
  const showLeftDots = currentPage > 4;
  const showRightDots = currentPage < totalPages - 3;

  if (!showLeftDots && showRightDots) {
    for (let i = 1; i <= 5; i++) {
      pagination.push(i);
    }
    pagination.push("...");
    pagination.push(totalPages);
  } else if (showLeftDots && !showRightDots) {
    pagination.push(1);
    pagination.push("...");
    for (let i = totalPages - 4; i <= totalPages; i++) {
      pagination.push(i);
    }
  } else {
    pagination.push(1);
    pagination.push("...");
    pagination.push(currentPage - 1);
    pagination.push(currentPage);
    pagination.push(currentPage + 1);
    pagination.push("...");
    pagination.push(totalPages);
  }

  pagination.unshift("<");
  pagination.push(">");
  return pagination;
}

// let refinedSearch;
function DisplayPagination(pageIndex = 1) {
  // display the books
  let booksData = globalSearchBookRefinedResult;
  let bookElement = booksData.length;
  let maxPageIndex = Math.ceil(bookElement / BookDisplayNumber);

  // if the pageIndex is greater then the maxPageIndex, set it to the maxPageIndex
  pageIndex = pageIndex > maxPageIndex ? maxPageIndex : pageIndex;
  // if the pageIndex is less then 0, set it to 1
  pageIndex = pageIndex < 1 ? 1 : pageIndex;

  // add books to the book list
  let bookDisplayEnd = BookDisplayNumber * pageIndex;
  let bookDisplayStart = bookDisplayEnd - BookDisplayNumber;
  let bookListElement = "";
  for (let i = bookDisplayStart; i < bookDisplayEnd; i++) {
    const bookData = booksData[i];
    if (!bookData) break;
    bookListElement += bookComponent(bookData);
  }
  BookList.innerHTML = bookListElement;

  // Update Pagination
  let paginationElemet = generatePagination(pageIndex, maxPageIndex)
    .map((item) => {
      if (item === "<")
        return `<li ${
          pageIndex == 1 ? "id=disable" : `data-pageIndex=${pageIndex - 1}`
        } >&lt;</li>`;
      if (item === ">")
        return `<li ${
          pageIndex == maxPageIndex
            ? "id=disable"
            : `data-pageIndex=${pageIndex + 1}`
        }>&gt;</li>`;
      if (item === "...") return `<li id="ellipsis">...</li>`;
      if (item === pageIndex) return `<li id="selected">${item}</li>`;

      return `<li data-pageIndex=${item}>${item}</li>`;
    })
    .join("");

  // add the pagination elemets to the page
  PaginationParentElemet.innerHTML = paginationElemet;
  let PaginationElementList = PaginationParentElemet.getElementsByTagName("li");

  // connect the click event to the pagination elemets
  for (let i = 0; i < PaginationElementList.length; i++) {
    const element = PaginationElementList[i];
    let goToPageIndex = element.getAttribute("data-pageIndex");
    if (goToPageIndex) {
      element.addEventListener("click", () => {
        DisplayPagination(parseInt(goToPageIndex));
      });
    }
  }
}

export function UpdateBookSearchResult(
  searchBookResult,
  searchBookRefinedResult
) {
  if (!searchBookResult) return;
  searchBookRefinedResult ||= searchBookResult;
  globalSearchBookRefinedResult = searchBookRefinedResult;

  // update search result terms and count
  // Refinded section
  // get this form book data : categorise amount = {}, locations Amount = {}, availability Amount = {}

  // Display book list
  DisplayPagination(1);
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
