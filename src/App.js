import logo from './logo.svg';
import './App.css';
import Login from './Login/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashBoard from './Dashboard/Dashboard';

function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/dashboard" element={<DashBoard/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
