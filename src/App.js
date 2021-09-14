import logo from "./logo.svg";
import "./App.css";
import MainContent from "./MainContent";

import { Header, Container } from "semantic-ui-react";
function App() {
  return (
    <div className="App">
      <Container>
        <Header size="huge" className="App-logo">
          Episode Soup
        </Header>
        <Container className="main-container">
          <MainContent />
        </Container>
      </Container>
    </div>
  );
}

export default App;
