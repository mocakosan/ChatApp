import {useCallback, useEffect, useMemo, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {Collections, User} from '../types';
import firestore from '@react-native-firebase/firestore';
import AuthContext from './AuthContext';
import _ from 'lodash';
import storage from '@react-native-firebase/storage';

const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [processingSignup, setProcessingSignup] = useState(false);
  const [processingSignin, setProcessingSignin] = useState(false);
  useEffect(() => {
    const unsubsribe = auth().onUserChanged(async fbUser => {
      if (fbUser != null) {
        setUser({
          //login
          userId: fbUser.uid,
          email: fbUser.email ?? '',
          name: fbUser.displayName ?? '',
          profileUrl: fbUser.photoURL ?? '',
        });
      } else {
        //logout
        setUser(null);
      }
      setInitialized(true);
    });
    return () => {
      unsubsribe();
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setProcessingSignup(true);
      try {
        const {user: currentUser} = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );
        await currentUser.updateProfile({displayName: name});
        await firestore()
          .collection(Collections.USERS)
          .doc(currentUser.uid)
          .set({
            userId: currentUser.uid,
            email,
            name,
          });
      } finally {
        setProcessingSignup(false);
      }
    },
    [],
  );
  const signin = useCallback(async (email: string, password: string) => {
    try {
      setProcessingSignin(true);
      await auth().signInWithEmailAndPassword(email, password);
    } finally {
      setProcessingSignin(false);
    }
  }, []);

  const updateProfileImage = useCallback(
    async (filepath: string) => {
      //image upload

      if (user == null) {
        throw new Error('user is undefined');
      }
      const filename = _.last(filepath.split('/'));
      if (filename == null) {
        throw new Error('filename is undefined');
      }
      const storageFilepath = `user/${user?.userId}/${filename}`;
      await storage().ref(storageFilepath).putFile(filepath);
      const url = await storage().ref(storageFilepath).getDownloadURL();
      await auth().currentUser?.updateProfile({photoURL: url});
      await firestore().collection(Collections.USERS).doc(user.userId).update({
        profileUrl: url,
      });
      //register image on user profile
    },
    [user],
  );

  const addFcmToken = useCallback(
    async (token: string) => {
      if (user != null) {
        await firestore()
          .collection(Collections.USERS)
          .doc(user.userId)
          .update({
            fcmTokens: firestore.FieldValue.arrayUnion(token),
          });
      }
    },
    [user],
  );

  const value = useMemo(() => {
    return {
      initialized,
      user,
      signup,
      processingSignup,
      signin,
      processingSignin,
      updateProfileImage,
      addFcmToken,
    };
  }, [
    initialized,
    user,
    signup,
    signin,
    processingSignup,
    processingSignin,
    addFcmToken,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
