import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../src/firebase';
import '../src/app/globals.css';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component from Next.js

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      <header style={{ position: 'relative', height: 'auto', padding: '10px 20px' }}>
  {/* Logo positioned absolutely in the top-left corner */}
  <div className="logo-container" style={{ position: 'absolute', top: '0px', left: '0px', height: '100%' }}>
    <Link href="/">
      <img 
        src="/5.png"  
        alt="Logo" 
        className="logo-image"
        style={{ 
          width: 'auto',
          height: '100%',
          maxHeight: '80px',  // Set a maximum height for larger screens
        }} 
      />
    </Link>
  </div>

  <nav className="horizontal-nav" style={{ display: 'flex', justifyContent: 'center' }}>
    <ul 
      style={{ 
        listStyle: 'none', 
        display: 'flex', 
        gap: '20px', 
        color: 'white', 
        margin: '0', 
        padding: '0', 
        fontSize: '1rem',
      }}
    >
      <li><a href="/" className="nav-link">Home</a></li>
      <li><a href="/climate" className="nav-link">Climate</a></li>
    </ul>
  </nav>

  {/* Profile Picture Container */}
  {user && (
    <div 
      className="profile-container" 
      style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
      }}
    >
      <img src={user.photoURL} alt="Profile" className="profile-image" style={{ width: '40px', borderRadius: '50%' }} />
      <span className="profile-name">{user.displayName}</span>
    </div>
  )}
</header>

<style jsx>{`
  @media (max-width: 768px) {
    .logo-image {
      display: none;
    }
    .profile-name {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    .profile-image {
      width: 30px;
    }
  }
`}</style>



      {/* Background */}
      <div className="background-container">
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>

      <Component {...pageProps} />

      {/* Sign Out Button at the bottom right */}
      {user && (
        <button
          onClick={handleSignOut}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

export default MyApp;
