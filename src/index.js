import React from "react"
import { BrowserRouter, Navigate } from "react-router-dom"
import { AppProvider } from "./components/AppContent"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./style/output.css"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
)
