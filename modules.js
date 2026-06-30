const urlParams = new URLSearchParams(window.location.search);

const sheetId = "11Ja5ovsM5C-sN1fpmwA64-R0ou4JEKkrnsjsPyVrQMg";
const gid = "922758314";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

// pages
const detailsPage = document.getElementById("book-details-page");
const searchPage = document.getElementById("book-search-page");

// details page
const shareBookButton = document.getElementById("share-button");
const backToResultButton = document.getElementById("back-button");
const detailsTitle = document.getElementById("d-title");
const detailsAuthor = document.getElementById("d-author");
const detailsIsAvaliable = document.getElementById("d-isAvailable");
const detailsLocation = document.getElementById("d-location");
const detailsCategory = document.getElementById("d-category");
const detailsCatalogCode = document.getElementById("d-catalog-code");
const detailsDonor = document.getElementById("d-donor");
const detailsCondition = document.getElementById("d-condition");
const detailsLocationLocation = document.getElementById("d-l-location");
const detailsLocationSection = document.getElementById("d-l-section");
const detailsDescription = document.getElementById("d-description");
const detailsRelatedBooks = document.getElementById("d-related-books");

// search page
const searchAvailbility = document.getElementById("availbility");
const searchLocation = document.getElementById("location");
const searchCategory = document.getElementById("category");
const searchResultsFoundText = document.querySelector("#search-results > p");
const searchResultsText = document.querySelector("#search-results > h2");

// console.log(searchResultsFoundText);
const BookList = document.getElementById("bookList");
const PaginationParentElemet = document.getElementById("paginationParent");
const BookDisplayNumber = 10;

let GlobalBookData = [];
let globalSearchBookRefinedResult = [];
let GlobalBookMapData;

function getPropertyCount(results, property) {
  return results.reduce((acc, item) => {
    // Get the value of the property (e.g., 'Downtown')
    const key = item[property];

    // If it doesn't exist in our map yet, set it to 0, then add 1
    acc[key] = (acc[key] || 0) + 1;

    return acc;
  }, {});
}

function bookComponent(bookData) {
  if (!bookData) return;
  let component = `
  <div class="book">
  <div id="data">
  <div id="title">
  <i class="fa-solid fa-book"></i>
  <h3  data-catalogcode="${bookData.CatalogCode}" >${bookData.Title}</h3>
  </div>
  <h4 id="author">${bookData.Author}</h4>
  <h4 id="category">${bookData.Category}</h4>
  <h4 id="Location">${bookData.Collection} - ${bookData.CatalogCode}</h4>
</div>
  <div class="checked ${
    bookData["CheckedOut"] == "TRUE" ? "checked-out" : `checked-in`
  }">${bookData["CheckedOut"] == "TRUE" ? "Checked Out" : "Available"}</div>
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

function handelShowBookDetailsPage(BookList, tag) {
  const Titles = BookList.getElementsByTagName(tag);

  for (let i = 0; i < Titles.length; i++) {
    let title = Titles[i];
    let bookCode = title.getAttribute("data-catalogcode");

    if (bookCode) {
      title.addEventListener("click", () => {
        urlParams.set("bookCatalogCode", bookCode);
        const newUrl = window.location.pathname + "?" + urlParams.toString();
        history.pushState(null, "", newUrl);

        ShowBookDetailsPage();

        // scroll window to the top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    }
  }
}
// let refinedSearch;
function DisplayPagination(pageIndex = 1) {
  // display the books
  let booksData = globalSearchBookRefinedResult;
  let bookElement = booksData.length;
  let maxPageIndex = Math.ceil(bookElement / BookDisplayNumber);

  // no book result
  if (booksData.length == 0) {
    console.log("No result");
    BookList.innerHTML = "<p>No result found for this search!</p>";
    PaginationParentElemet.innerHTML = "";
    return;
  }

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

  // Show more details for the book
  handelShowBookDetailsPage(BookList, "h3");

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

        // scroll window to the top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    }
  }
}

function refinedSearchElement(property, parent) {
  // parent.innerHTML = "";
  let elements = "";
  for (const key in property) {
    let isAvailableCondition = key == "TRUE" || key == "FALSE";
    let name = isAvailableCondition
      ? key == "TRUE"
        ? "Checked Out"
        : "Available"
      : key;

    elements += `<li>
    <input type="checkbox" data-refine-value="${
      isAvailableCondition ? key : name
    }" />
    <p>${name} (${property[key]})</p>
    </li>`;
  }
  // console.log("property");
  if (Object.keys(property).length == 0) elements = "<li>- - - - - -</li>";
  parent.innerHTML = elements;
}
export async function getSheet() {
  try {
    let result = await fetch(url);
    let csvText = await result.text();
    let data = Papa.parse(csvText, { header: true }).data;
    GlobalBookData = data;
    return data;
  } catch (error) {
    console.error("Error fetching sheet:", error);
  }
}

export function UpdateBookSearchResult(
  searchBookResult,
  searchBookRefinedResult,
  searchText,
  updateRefineParameter = true
) {
  if (!searchBookResult) return;
  searchBookRefinedResult ||= searchBookResult;
  globalSearchBookRefinedResult = searchBookRefinedResult;

  // update search result terms and count
  searchResultsText.textContent = searchText
    ? `Search Results for "${searchText}"`
    : "Total Books";
  searchResultsFoundText.textContent = `${searchBookResult.length} results found`;
  // Refinded section

  if (updateRefineParameter) {
    let Location = getPropertyCount(searchBookResult, "Collection");
    refinedSearchElement(Location, searchLocation);
    let CheckedOut = getPropertyCount(searchBookResult, "CheckedOut");
    refinedSearchElement(CheckedOut, searchAvailbility);
    let Category = getPropertyCount(searchBookResult, "Category");
    refinedSearchElement(Category, searchCategory);
  }

  // Display book list
  DisplayPagination(1);
}

export function PerformRefinedSearch(activeFilters, searchResults) {
  return searchResults.filter((book) => {
    const hasLocationMatch =
      activeFilters.location.length == 0 ||
      activeFilters.location.includes(book.Collection);

    const hasCategoryMatch =
      activeFilters.category.length == 0 ||
      activeFilters.category.includes(book.Category);

    const hasAvailabilityMatch =
      activeFilters.isAvailable.length == 0 ||
      activeFilters.isAvailable.includes(book.CheckedOut);

    return hasLocationMatch && hasCategoryMatch && hasAvailabilityMatch;
  });
}

export function ShowBookDetailsPage(BookMapData) {
  if (BookMapData) GlobalBookMapData = BookMapData;
  if (!GlobalBookMapData) return;

  const params = new URLSearchParams(window.location.search);
  const bookCode = params.get("bookCatalogCode");
  if (bookCode) {
    let bookData = GlobalBookMapData.get(bookCode);

    // Open details page and disable the search page
    detailsPage.classList.remove("disablePage");
    searchPage.classList.add("disablePage");

    // Update the detail page with the book data
    // header details (title, author, isAvailable)
    detailsTitle.innerText = bookData.Title;
    detailsAuthor.innerText = bookData.Author;
    detailsIsAvaliable.className =
      bookData.CheckedOut == "TRUE" ? "checked-out" : "checked-in";
    detailsIsAvaliable.innerHTML =
      bookData.CheckedOut == "TRUE"
        ? `<i class="fa-regular fa-circle-xmark"></i>
        <p>Checked Out</p>`
        : `<i class="fa-regular fa-circle-check"></i>
        <p>Available</p>`;

    // more details (location, category, catalog code, donor, condition, description)
    detailsLocation.innerText = bookData.Collection;
    detailsCategory.innerText = bookData.Category;
    detailsCatalogCode.innerText = bookData.CatalogCode;
    detailsDonor.innerText = bookData.Donor;
    detailsCondition.innerText = bookData.Condition;
    detailsDescription.innerText = bookData.Notes;

    // location
    detailsLocationLocation.innerHTML = bookData.Collection;
    detailsLocationSection.innerText = bookData.Category;

    //fill up the related books based on category and collection (location)
    let activeFilters = {
      location: ["Main Library", "Children's Library", "Audio Library"],
      category: [bookData.Category],
      isAvailable: ["TRUE", "FALSE"],
    };
    // at most 5 related books
    const allRelatedBooks = PerformRefinedSearch(activeFilters, GlobalBookData);
    let relatedBooks = [];
    let i = 0;
    while (relatedBooks.length < 5) {
      if (i == allRelatedBooks.length) break;
      if (allRelatedBooks[i].CatalogCode != bookCode)
        relatedBooks.push(allRelatedBooks[i]);
      i++;
    }
    // Display all related books
    let relatedBooksElement = "";
    for (let i = 0; i < relatedBooks.length; i++) {
      relatedBooksElement += `<li data-catalogcode=${relatedBooks[i].CatalogCode}>
      <p>${relatedBooks[i].Category}</p>
      <h3>${relatedBooks[i].Title}</h3>
      <h4>by ${relatedBooks[i].Author}</h4>
    </li>`;
    }
    detailsRelatedBooks.innerHTML = relatedBooksElement;
    handelShowBookDetailsPage(detailsRelatedBooks, "li");
  } else {
    // enable the search page and disables thes details page
    searchPage.classList.remove("disablePage");
    detailsPage.classList.add("disablePage");
  }
}

backToResultButton.addEventListener("click", () => {
  const newUrl = window.location.pathname;
  window.history.pushState(null, "", newUrl);

  ShowBookDetailsPage();
});

shareBookButton.addEventListener("click", async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const bookCode = params.get("bookCatalogCode");
    if (!bookCode) return;
    let bookTitle = GlobalBookMapData.get(bookCode).Title;

    await navigator.share({
      title: bookTitle,
      text: "Check out this book in the Hart Square library",
      url: window.location.href,
    });
  } catch (err) {
    console.warn(err);
  }
});
