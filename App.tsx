import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useContext} from 'react';
import {RootStackParamList} from './src/types';
import SignupScreen from './src/screens/SignupScreen';
import AuthProvider from './src/components/AuthProvider';
import SigninScreen from './src/screens/SigninScreen';
import AuthContext from './src/components/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Screnns = () => {
  const {user, processingSignin, processingSignup, initialized} =
    useContext(AuthContext);
  const renderRootStack = useCallback(() => {
    if (!initialized) {
      return <Stack.Screen name="Loading" component={LoadingScreen} />;
    }
    if (user != null && !processingSignin && !processingSignup) {
      //login
      return (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      );
    }
    return (
      //logout
      <>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
      </>
    );
  }, [user, processingSignin, processingSignup, initialized]);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {renderRootStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): JSX.Element {
  return (
    <AuthProvider>
      <Screnns />
    </AuthProvider>
  );
}

export default App;
