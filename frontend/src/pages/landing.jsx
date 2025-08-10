import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import '../App.css'
export default function LandingPage() {
    const navigate = useNavigate();
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
                <h2>Apna Video Call</h2>
            </div>
            <div className='navlist'>
                <p onClick={()=>{
                    navigate('/random')
                }}>Join as guest</p>
                <p onClick={()=>{navigate('/auth')}} >Register</p>
                <div role='button' onClick={()=>{
                    navigate('/auth')
                }}>
                    <p>Login</p>
                </div>
            </div>
        </nav>

        <div className="landingPageMainContainer">
            <div>
                <h1><span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>

                <p>Cover a distance by Apna Video Call</p>
                <div role='button'>
                    <Link to={"/home"}>Get Started</Link>
                </div>
            </div>
            <div>
                <img src='./assets/mobile.png' alt='home-mobile-png' />
            </div>
        </div>
    </div>
  )
}
