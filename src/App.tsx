import Home from "./components/pages/Home";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
};

export default App;