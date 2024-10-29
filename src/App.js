import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';
import Dashboard from './Dashboard/Dashboard'; // นำเข้า Dashboard

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} /> {/* เพิ่ม Route สำหรับ Dashboard */}
                    <Route path="/" element={<Login />} /> {/* หน้าเริ่มต้น */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
