import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function ProtectedLayout() {
  return (
    <div className='flex flex-col h-screen overflow-y-scroll bg-slate-50 text-slate-900 font-sans bg-[url("layout_bg.png")] bg-cover bg-center bg-no-repeat'>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
