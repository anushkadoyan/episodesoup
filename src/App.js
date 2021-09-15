import "./App.css";
import MainContent from "./MainContent";

import { Header, Container } from "semantic-ui-react";
function App() {
  return (
    <div className="App">
      <Container>
        <div className="App-logo">Episode Soup</div>
        <Container className="main-container">
          <MainContent />
        </Container>
      </Container>
    </div>
  );
}

export default App;
