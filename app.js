import { getSheet, UpdateBookSearchResult } from "./modules.js";
// import {
//   get,
//   set,
//   createStore,
// } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const searchIndex = new FlexSearch.Document({
  document: {
    id: "CatalogCode", // Ensure every book has a unique ID field
    index: ["Title", "Author", "Category", "CatalogCode"],
    // tag: "Checked-Out",
  },
});

let GlobalBookData = [];
let GlobalBookMapData;
let BookSearchResult = [];

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
}

// Search Query
// get the search textinput
let searchTextInput = document.getElementById("search-input");
// get the search button
let searchButton = document.getElementById("search-button");
searchButton.onclick = function () {
  let searchText = searchTextInput.value;

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
  // console.log("BookSearchResult", BookSearchResult);

  UpdateBookSearchResult(BookSearchResult);
};

// Refine Search

let refinedSearchButton = document.getElementById("refined-search-button");
refinedSearchButton.onclick = function () {
  console.log("Ola is a boy");

  let BookRefinedSearchResult = [];
  // UpdateBookSearchResult(BookSearchResult, BookRefinedSearchResult);
};
