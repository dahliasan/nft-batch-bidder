import { React, useState } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";

// create useAPI custom hook: https://scrimba.com/learn/reusablereact/a-promise-based-state-machine-c33KWyTy DONE

// debounce realtime search
// onclick save contract address to object state
// fetch assets from contract address
// save assets into data state

// save asset data into variable
// display assets
// display assets properties
// allow users to filter assets by properties

function App() {
  return (
    <main>
      <SearchForm />
    </main>
  );
}

export default App;
