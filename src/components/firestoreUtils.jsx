import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

//This file is utilites that are used throughout the application

//This function grabs the userdata from firebase when needed
async function getUserData(uid) {
  try {
    const usersRef = collection(db, 'users');
    const docRef = doc(usersRef, uid);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      console.log('No user found with the provided ID.');
      return null;
    } else {
      const userData = docSnapshot.data();
      return userData;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export { getUserData };

//This function returns a user's role
async function getUserRole(uid){
  try {
    const usersRef = collection(db, 'users');
    const docRef = doc(usersRef, uid);
    const docSnapshot = await getDoc(docRef);
  
    if (!docSnapshot.exists()) {
      console.log('No user found with the provided ID.');
      return null;
    } else {
      const userData = docSnapshot.data().selectedUserType;
      console.log('User data:', userData);
      return userData;
    }
  } catch (error) {
    console.error('Error fetching user type:', error);
    return null;
  }
}
export { getUserRole }