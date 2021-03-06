import React, {useContext, useEffect} from 'react';
import {UserContext} from './context/Context';

//firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// react navigation
import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Action
import {
  IS_AUTHTHENTICATED,
  SET_CHATS,
  SET_CHAT_LIST,
  SET_USER,
} from './context/action.type';

// Components
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import AddChat from './screens/AddChat';
import Chat from './screens/Chat';
import EmptyContainer from './components/EmptyContainer';
import ChatHeader from './layout/ChatHeader';
import HomeHeader from './layout/HomeHeader';

const Stack = createStackNavigator();

const App = () => {
  const {appData, dispatch} = useContext(UserContext);

  // Function to check auth state of user
  const onAuthStateChanged = (user) => {
    if (user) {
      // if user is authenticated then featching all user data from database
      dispatch({type: IS_AUTHTHENTICATED, payload: true});
      firestore()
        .collection('Users')
        .doc(user._user.uid)
        .get()
        .then((documentSnapshot) => {
          console.log('users: ', documentSnapshot._data);
          dispatch({type: SET_USER, payload: documentSnapshot._data});
        });
    } else {
      // if user is not authenticated the cleanup state
      dispatch({type: IS_AUTHTHENTICATED, payload: false});
      dispatch({type: SET_USER, payload: []});
      dispatch({type: SET_CHAT_LIST, payload: []});
      dispatch({type: SET_CHATS, payload: null});
    }
  };

  useEffect(() => {
    const susbcriber = auth().onAuthStateChanged(onAuthStateChanged);
    return susbcriber;
  }, []);

  // Loading page that will display till user data load from database
  if (appData.isAuthenticated && !appData.user.uid) {
    return <EmptyContainer />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#075E54',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}>
        {appData.isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{headerTitle: (props) => <HomeHeader {...props} />}}
            />
            <Stack.Screen name="AddChat" component={AddChat} />
            <Stack.Screen
              name="Chat"
              component={Chat}
              options={{headerTitle: (props) => <ChatHeader {...props} />}}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
