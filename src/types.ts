import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Signup: undefined;
  Signin: undefined;
  Home: undefined;
  Loading: undefined;
  Chat: {
    userIds: string[];
  };
};
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export interface User {
  userId: string;
  email: string;
  name: string;
  profileUrl?: string;
}

export enum Collections {
  USERS = 'users',
  CHATS = 'chats',
  MESSAGES = 'messages',
}

export interface Chat {
  id: string;
  userIds: string[];
  users: User[];
}

export interface Message {
  id: string;
  user: User;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: Date;
}
