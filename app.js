import { updateBooklist } from "./modules.js";
import {
  get,
  set,
  createStore,
} from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

// get save data (indexDB)
const customStore = createStore("hart-square-library-database", "key-store");
let lastUpdated = false; // await get("lastUpdated", customStore);

// have a Saved data
if (lastUpdated) {
  // load saved data into the page
  console.log("lastUpdated", lastUpdated);
  try {
    let data = await get("bookData", customStore);
    // update book list
    //console.log("get last Saved data", data);
  } catch (error) {
    console.warn("It failed to save bookdata!", err);
  }
} else {
  // library sheet book data
  let data = await updateBooklist();
  try {
    // save the data

    await set("bookData", data, customStore);
    // await set("lastUpdated", data, customStore);
    // console.log("NO Saved data, gotten form the sheet", data);
  } catch (error) {
    console.warn("It failed to save bookdata!", err);
  }
}
