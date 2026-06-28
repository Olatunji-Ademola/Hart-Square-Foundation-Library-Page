import {
  getSheet,
  PerformRefinedSearch,
  UpdateBookSearchResult,
  ShowBookDetailsPage,
} from "./modules.js";
// import {
//   get,
//   set,
//   createStore,
// } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

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

// get save data (indexDB)
// const customStore = createStore("hart-square-library-database", "key-store");
let lastUpdated = false; // await get("lastUpdated", customStore);

// have a Saved data
if (lastUpdated) {
} else {
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
const refinedSearchButton = document.getElementById("refined-search-button");
const refineIsAvailableList = document.getElementById("availbility");
const refineLocationList = document.getElementById("location");
const refineCategoryList = document.getElementById("category");

let activeFilters = {
  location: [],
  category: [],
  isAvailable: [],
};

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
};

// On Navigate pen book detail page
window.addEventListener("popstate", function () {
  ShowBookDetailsPage();
});
