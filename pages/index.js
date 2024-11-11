import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../src/firebase'; // Import the auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase methods
import styles from '../src/app/Home.module.css';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container} style={{ marginTop: '20px' , maxWidth: '1200px', width: '90%'}}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          {user ? (
            <span style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'green', // Blue color for the welcome message
              display: 'block',
              marginBottom: '10px'
            }}>
              Welcome, {user.displayName}
            </span>         ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/register" className={styles.navLink}>
                Register
              </Link>
            </>
          )}
        </nav>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </header>

      <main className={styles.main}>
      <h1 style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '36px', 
    fontWeight: '700', 
    color: 'green', // Dark grey color for the heading
    marginTop: '20px'
  }}>
    Welcome to GeoGemini
  </h1>    <p style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '18px', 
    fontWeight: '550', 
    color: '#2E8B57', // Medium grey color for the paragraph
    lineHeight: '1.4', 
    marginTop: '10px'
  }}>
    Discover the power of satellite imagery analysis with GeoGemini. Our web app enables you to track environmental changes, monitor climate impact, and gain valuable insights from satellite imageries for research, education, and sustainability efforts.
  </p> {/* Image below the heading */}
  <img 
    src="/geogemini.png"  // Replace with the actual path to your image
    alt="Satellite imagery analysis" 
    style={{ 
      width: '100%',  // Adjust the width as needed
      maxWidth: '500px',  // Set a maximum width for larger screens
      height: 'auto',  // Maintain aspect ratio
      margin: '20px 0',  // Add some spacing around the image
      display: 'block',
      borderRadius: '10px'  // Optional: Add rounded corners
    }} 
  />

      </main>

      <footer className={styles.footer}>
      <p>2024 GeoGemini. Proudly protecting nature.</p>
      </footer>
      

    </div>
    
  );
}
