import "./App.css";
import MainContent from "./MainContent";

import { Container } from "semantic-ui-react";
function App() {
  return (
    <div className="App">
      <Container>
        <div className="App-logo">Episode Soup</div>
        <div className="main-container">
          <MainContent />
        </div>
      </Container>
    </div>
  );
}

export default App;
