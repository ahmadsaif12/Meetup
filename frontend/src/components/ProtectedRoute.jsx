import { useAuth } from '@clerk/react'
import { Navigate, Outlet } from 'react-router-dom'
import Loading from './Loading'

export default function ProtectedRoute() {
  const {isLoaded,isSignedIn} = useAuth()
  if(!isLoaded){
    return <Loading  text ="Authenticating"/>
  }
  if(!isSignedIn){
    return <Navigate to ="/login" replace />
  }
  return <Outlet />
}
