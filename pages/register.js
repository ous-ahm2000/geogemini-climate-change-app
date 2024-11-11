
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../src/firebase';

export default function Register() {
  const router = useRouter();

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { isNewUser } = getAdditionalUserInfo(result);

      if (isNewUser) {
        // If the user is new, complete the registration or setup process
        router.push('/climate');
      } else {
        // If the user already exists, notify them
        alert('You already have an account. Please login.');
        auth.signOut(); // Sign out the existing user
        router.push('/login');
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="container" style={{ 
      margin: '20px auto',  // Center the container horizontally with margin
      maxWidth: '1200px',   // Maximum width of the container
      width: '90%',         // Width relative to the parent container
      textAlign: 'center'   // Center align text and inline elements
    }}>
      <h1>Register</h1>
      <button onClick={handleGoogleRegister}>Register with Google</button>
      <p>
        Already have an account? <Link href="/login">Login here</Link>.
      </p>
    </div>
  );
}
