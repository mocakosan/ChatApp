import {RouteProp, useRoute} from '@react-navigation/native';
import Screen from '../components/screen';
import {RootStackParamList} from '../types';
import useChat from '../hooks/useChat';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import Colors from '../modules/Color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthContext from '../components/AuthContext';
import Message from '../components/Message';
import UserPhoto from '../components/UserPhoto';
import dayjs from 'dayjs';
import ImageCropPicker from 'react-native-image-crop-picker';
import MicButton from '../components/MicButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  membersSection: {},
  membersTitleText: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userProfile: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    backgroundColor: Colors.BLACK,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileText: {
    color: Colors.WHITE,
  },
  messageList: {
    flex: 1,
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 10,
    borderRadius: 24,
    borderColor: Colors.BLACK,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  textInput: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BLACK,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  sendText: {
    color: Colors.WHITE,
  },
  sendIcon: {
    color: Colors.WHITE,
    fontSize: 18,
  },
  messageSeparator: {
    height: 8,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: Colors.BLACK,
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  imageIcon: {
    color: Colors.BLACK,
    fontSize: 32,
  },
  sendingContainer: {
    paddingTop: 10,
    alignItems: 'flex-end',
  },
});

const disabledSendButtonStyle = [
  styles.sendButton,
  {backgroundColor: Colors.GRAY},
];

const ChatScreen = () => {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {userIds} = params;
  console.log(params);
  const {
    loadingChat,
    chat,
    sendMessage,
    messages,
    loadingMessages,
    updateMessageReadAt,
    userToMessageReadAt,
    sendImageMessage,
    sendAudioMessage,
    sending,
  } = useChat(userIds);
  const [text, setText] = useState('');
  const {user: me} = useContext(AuthContext);
  const loading = loadingChat || loadingMessages;

  const other = useMemo(() => {
    if (chat != null && me != null) {
      return chat.users.filter(u => u.userId !== me.userId)[0];
    }
    return null;
  }, [chat, me]);

  //채팅방에 들어가기 전에 me가 비어있거나 메세지가 로딩 되지 않았는데 읽혔다고 표시를 없애는것을 방지하기위해 메세지가 로딩후 읽히게
  useEffect(() => {
    if (me != null && messages.length > 0) {
      updateMessageReadAt(me?.userId);
    }
  }, [me, messages.length, updateMessageReadAt]);

  //입력이 안하면 버튼 비활성화
  const sendDisabled = useMemo(() => text.length === 0, [text]);

  //메세지를 보내면 입력창 초기화
  const onPressSendButton = useCallback(() => {
    if (me != null) {
      sendMessage(text, me);
      setText('');
    }
  }, [me, sendMessage, text]);

  const onChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);
  const onPressImageButton = useCallback(async () => {
    if (me != null) {
      const image = await ImageCropPicker.openPicker({cropping: true});
      sendImageMessage(image.path, me);
    }
  }, [me, sendImageMessage]);

  const onRecorded = useCallback(
    (path: string) => {
      Alert.alert('녹음 완료', '음성 메시지를 보낼까요?', [
        {text: '아니요'},
        {
          text: '네',
          onPress: () => {
            console.log('path', path);
            if (me != null) {
              sendAudioMessage(path, me);
            }
          },
        },
      ]);
    },
    [me, sendAudioMessage],
  );

  const renderChat = useCallback(() => {
    if (chat == null) {
      return null;
    }
    return (
      <View style={styles.chatContainer}>
        <View style={styles.membersSection}>
          <Text style={styles.membersTitleText}>대화상대</Text>
          <FlatList
            data={chat.users}
            renderItem={({item: user}) => (
              <UserPhoto
                size={34}
                style={styles.userProfile}
                name={user.name}
                nameStyle={styles.userProfileText}
                imageUrl={user.profileUrl}
              />
            )}
            horizontal
          />
        </View>

        <FlatList
          inverted
          style={styles.messageList}
          data={messages}
          renderItem={({item: message}) => {
            const user = chat.users.find(u => u.userId === message.user.userId);
            const unreadUsers = chat.users.filter(u => {
              const messageReadAt = userToMessageReadAt[u.userId] ?? null;
              if (messageReadAt == null) {
                return true;
              }
              return dayjs(messageReadAt).isBefore(message.createdAt);
            });
            const unreadCount = unreadUsers.length;

            const commonProps = {
              name: user?.name ?? '',
              createdAt: message.createdAt,
              isOtherMessage: message.user.userId !== me?.userId,
              userImageUrl: user?.profileUrl,
              unreadCount: unreadCount,
            };
            if (message.text != null) {
              return (
                <Message {...commonProps} message={{text: message.text}} />
              );
            }
            if (message.imageUrl != null) {
              return (
                <Message
                  {...commonProps}
                  message={{imageUrl: message.imageUrl}}
                />
              );
            }
            if (message.audioUrl != null) {
              return (
                <Message
                  {...commonProps}
                  message={{audioUrl: message.audioUrl}}
                />
              );
            }
            return null;
          }}
          ItemSeparatorComponent={() => (
            <View style={styles.messageSeparator} />
          )}
          ListHeaderComponent={() => {
            if (sending) {
              return (
                <View style={styles.sendingContainer}>
                  <ActivityIndicator />
                </View>
              );
            }
            return null;
          }}
        />
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={onChangeText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={sendDisabled ? disabledSendButtonStyle : styles.sendButton}
            disabled={sendDisabled}
            onPress={onPressSendButton}>
            <Text style={styles.sendText}>Send</Text>
            <Icon style={styles.sendIcon} name="send" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={onPressImageButton}>
            <Icon name="image" style={styles.imageIcon} />
          </TouchableOpacity>
          <View>
            <MicButton onRecorded={onRecorded} />
          </View>
        </View>
      </View>
    );
  }, [
    chat,
    onChangeText,
    text,
    sendDisabled,
    onPressSendButton,
    messages,
    me?.userId,
    userToMessageReadAt,
    onPressImageButton,
    onRecorded,
    sending,
  ]);
  return (
    <Screen title={other?.name}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          renderChat()
        )}
      </View>
    </Screen>
  );
};
export default ChatScreen;
