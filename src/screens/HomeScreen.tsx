import {useCallback, useContext, useEffect, useState} from 'react';
import Screen from '../components/screen';
import AuthContext from '../components/AuthContext';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../modules/Color';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, RootStackNavigationProp, User} from '../types';
import {useNavigation} from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import Profile from '../components/Profile';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.BLACK,
  },
  userSectionContent: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  myProfile: {
    flex: 1,
  },
  myNameText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  myEmailText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutText: {color: Colors.WHITE},
  userListSection: {
    flex: 1,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userList: {
    flex: 1,
  },
  userListItem: {
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 12,
    padding: 20,
  },
  otherNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  otherEmailText: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.BLACK,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    color: Colors.BLACK,
  },
  profile: {
    marginRight: 10,
  },
});

const HomeScreen = () => {
  const {user: me, updateProfileImage} = useContext(AuthContext);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigation = useNavigation<RootStackNavigationProp>();
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const snapshot = await firestore().collection(Collections.USERS).get();
      setUsers(
        snapshot.docs
          .map(doc => doc.data() as User)
          .filter(u => u.userId !== me?.userId),
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [me?.userId]);
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onPressLogout = useCallback(() => {
    auth().signOut();
  }, []);

  const onPressProfile = useCallback(async () => {
    const image = await ImageCropPicker.openPicker({
      cropping: true,
      cropperCircleOverlay: true,
    });
    await updateProfileImage(image.path);
  }, [updateProfileImage]);

  const renderLoading = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    ),
    [],
  );

  if (me == null) {
    return null;
  }

  return (
    <Screen title="Home">
      <View style={styles.container}>
        <View>
          <Text style={styles.sectionTitleText}>나의 정보</Text>
          <View style={styles.userSectionContent}>
            <Profile
              style={styles.profile}
              onPress={onPressProfile}
              imageUrl={me.profileUrl}
            />
            <TouchableOpacity style={styles.profile} onPress={onPressProfile} />
            <View style={styles.myProfile}>
              <Text style={styles.myNameText}>{me?.name}</Text>
              <Text style={styles.myEmailText}>{me?.email}</Text>
            </View>
            <TouchableOpacity onPress={onPressLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.userListSection}>
          {loadingUsers ? (
            renderLoading()
          ) : (
            <>
              <Text style={styles.sectionTitleText}>
                다른 사용자와 대화를 해보세요!
              </Text>
              <FlatList
                style={styles.userList}
                data={users}
                renderItem={({item: user}) => (
                  <TouchableOpacity
                    style={styles.userListItem}
                    onPress={() => {
                      navigation.navigate('Chat', {
                        userIds: [me.userId, user.userId],
                        other: user,
                      });
                    }}>
                    <Text style={styles.otherNameText}>{user.name}</Text>
                    <Text style={styles.otherEmailText}>{user.email}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => {
                  return (
                    <Text style={styles.emptyText}>사용자가 없습니다</Text>
                  );
                }}
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
};
export default HomeScreen;
