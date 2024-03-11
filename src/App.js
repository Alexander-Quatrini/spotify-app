import ReactDOM from "react-dom/client";
import logo from './logo.svg';
import './App.css';
import Login from './Login/Login';
import { BrowserRouter, Routes, Route, NavLink, matchPath } from "react-router-dom";
import DashBoard from './Dashboard/Dashboard';
import Stats from './Stats/Stats';


function App() {
  return (

    <BrowserRouter>
      <nav>
        
        <NavLink style={({ isActive }) => { return isActive ? { color: "plum" } : {}; }} to="/login"> Login </NavLink>
        <NavLink style={({ isActive }) => { return isActive ? { color: "plum" } : {}; }} to="/stats"> Stats </NavLink>
        <NavLink style={({ isActive }) => { return isActive ? { color: "plum" } : {}; }} to="/dashboard"> DashBoard </NavLink>
      </nav>
      
      
      <Routes>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/dashboard" element={<DashBoard/>}></Route>
          <Route path="/stats" element={<Stats/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
