import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import RecoverPassword from "../pages/RecoverPassword";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Disciplines from "../pages/Disciplines";
import Reports from "../pages/Reports";
import DataImport from "../pages/DataImport";
import Analysis from "../pages/Analysis";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("@App:tokes") ? true : false;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recoverpassword" element={<RecoverPassword />} />
        <Route path="/inicial" element={<Dashboard/>}/>
        <Route path="/alunos" element={<Students/>}/>
        <Route path="/estudantes" element={<Disciplines/>}/>
        <Route path="/relatorios" element={<Reports/>}/>
        <Route path="/importacao-de-dados" element={<DataImport/>}/>
        <Route path="/analises" element={<Analysis/>}/>
      </Routes>
    </BrowserRouter>
  );
}
