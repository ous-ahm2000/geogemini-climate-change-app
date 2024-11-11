import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../src/firebase';

export default function Login() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { isNewUser } = getAdditionalUserInfo(result);

      if (isNewUser) {
        // Notify user to register first
        alert('Please register first.');
        auth.signOut(); // Sign out the new user
        router.push('/register');
      } else {
        // If the user is not new, redirect to the main app page
        router.push('/climate');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="container" style={{ 
      margin: '20px auto',  // Center the container horizontally with margin
      maxWidth: '1200px',   // Maximum width of the container
      width: '90%',         // Width relative to the parent container
      textAlign: 'center'   // Center align text and inline elements
    }}>
      <h1>Login</h1>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <p>
        Don't have an account? <Link href="/register">Register here</Link>.
      </p>
    </div>
  );
}
