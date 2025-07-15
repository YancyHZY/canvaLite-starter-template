import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CanvaLite from "./components/canvaLite.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CanvaLite />
    </>
  );
}

export default App;
