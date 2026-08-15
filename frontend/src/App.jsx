import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Admin from './pages/Admin'
import Catalogo from './pages/Catalogo'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import Personalizar from './pages/Personalizar'
import { StoreProvider } from './store/StoreContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="display text-[clamp(4rem,18vw,12rem)] font-light text-rosa/30">404</p>
      <p className="display -mt-4 text-3xl">Esta página no está en el horno</p>
      <a href="/" className="mt-8 rounded-full bg-rosa px-8 py-4 font-medium text-ink">
        Volver al inicio
      </a>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <StoreProvider>
      <div className="grain min-h-dvh">
        <ScrollToTop />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/personalizar" element={<Personalizar />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
        <CartDrawer />
      </div>
    </StoreProvider>
  )
}
