import { Link, Routes, Route } from "react-router-dom"
import { Helmet } from "react-helmet"
import MainContent from "./components/MainContext"

export const routes = [{ path: "/", element: <MainContent /> }]

export default function Main() {
  return (
    <>
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </>
  )
}
