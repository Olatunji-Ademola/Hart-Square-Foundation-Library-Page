import {
  getSheet,
  PerformRefinedSearch,
  UpdateBookSearchResult,
  ShowBookDetailsPage,
} from "./modules.js";

const searchIndex = new FlexSearch.Document({
  document: {
    id: "CatalogCode", // Ensure every book has a unique ID field
    index: ["Title", "Author", "Category", "CatalogCode"],
  },
  tokenize: "forward",
});

let GlobalBookData = [];
let GlobalBookMapData;
let BookSearchResult = [];
let searchText = "";

async function init() {
  // library sheet book data
  GlobalBookData = await getSheet();

  // Index Boox Data
  // store book map with the catalogcode as the key
  GlobalBookMapData = new Map(
    GlobalBookData.map((book) => [book.CatalogCode, book])
  );
  // add all book data to search index
  for (let i = 0; i < GlobalBookData.length; i++) {
    searchIndex.add(GlobalBookData[i]);
  }

  // Update BookSearchResult and UI
  BookSearchResult = GlobalBookData;
  UpdateBookSearchResult(BookSearchResult);

  // opem book details page on load
  ShowBookDetailsPage(GlobalBookMapData);
}

init();

// Search Query
// get the search textinput
let searchTextInput = document.getElementById("search-input");
// get the search button
let searchButton = document.getElementById("search-button");
searchButton.onclick = function () {
  searchText = searchTextInput.value;

  if (!searchText) return;
  //search for the data
  let searchResult = searchIndex.search(searchText);
  // console.log(searchResult);

  let bookSearchKeys = [];
  searchResult.forEach((element) => {
    bookSearchKeys.push(...element.result);
  });

  bookSearchKeys = [...new Set(bookSearchKeys)];

  // get the books from the map
  BookSearchResult = [];
  bookSearchKeys.forEach((element) => {
    BookSearchResult.push(GlobalBookMapData.get(element));
  });

  UpdateBookSearchResult(BookSearchResult, undefined, searchText);
};

// Refine Search
const wrapperElement = document.getElementById("wrapper");
const refinedSearchButton = document.getElementById("refined-search-button");
const refineIsAvailableList = document.getElementById("availbility");
const refineLocationList = document.getElementById("location");
const refineCategoryList = document.getElementById("category");

const filterElement = document.getElementById("filter");
const filterButton = document.getElementById("filter-button");
const filterCloseButton = document.getElementById("filter-close-button");
const backdropElement = document.getElementById("backdrop");

let activeFilters = {
  location: [],
  category: [],
  isAvailable: [],
};
function closeFilterWindow() {
  filterElement.classList.remove("showFilter");
  backdropElement.classList.add("disablePage");
  wrapperElement.classList.remove("stopScroll");

  // scroll window to the top
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}
function getRefinedOption(parentElement) {
  let refineResult = [];
  let listElement = parentElement.getElementsByTagName("li");

  for (let i = 0; i < listElement.length; i++) {
    let checkboxInput = listElement[i].querySelector("input[type=checkbox]");
    if (checkboxInput.checked) {
      let refineValue = checkboxInput.getAttribute("data-refine-value");
      refineResult.push(refineValue);
    }
  }
  return refineResult;
}
refinedSearchButton.onclick = function () {
  activeFilters.isAvailable = getRefinedOption(refineIsAvailableList);
  activeFilters.category = getRefinedOption(refineCategoryList);
  activeFilters.location = getRefinedOption(refineLocationList);

  let BookRefinedSearchResult = PerformRefinedSearch(
    activeFilters,
    BookSearchResult
  );

  UpdateBookSearchResult(
    BookSearchResult,
    BookRefinedSearchResult,
    searchText,
    false
  );

  //close the filter window mobile only
  closeFilterWindow();
};

//show filter mobile only
filterButton.addEventListener("click", function () {
  filterElement.classList.add("showFilter");
  backdropElement.classList.remove("disablePage");
  wrapperElement.classList.add("stopScroll"); // disables scroll on the main window
});

//hide filter
backdropElement.addEventListener("click", function () {
  closeFilterWindow();
});
filterCloseButton.addEventListener("click", function () {
  closeFilterWindow();
});

// On Navigate open book detail page
window.addEventListener("popstate", function () {
  ShowBookDetailsPage();
});
