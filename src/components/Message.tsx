import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import dayjs from 'dayjs';
import Colors from '../modules/Color';
import UserPhoto from './UserPhoto';
import ImageMessage from './ImageMessage';
import AudioMessage from './AudioMessage';

interface TextMessage {
  text: string;
}

interface ImageMessage {
  imageUrl: string;
}

interface AudioMessage {
  audioUrl: string;
}

interface MessageProps {
  name: string;
  createdAt: Date;
  isOtherMessage: boolean;
  userImageUrl?: string;
  unreadCount?: number;
  message: TextMessage | ImageMessage | AudioMessage;
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
  },
  container: {
    alignItems: 'flex-end',
    flex: 1,
  },
  nameText: {
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  bubble: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 12,
    flexShrink: 1,
  },
  messageText: {
    fontSize: 14,
    color: Colors.WHITE,
  },
  userPhoto: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  metaInfo: {
    marginRight: 4,
    alignItems: 'flex-end',
  },
});
const otherMessageStyles = {
  container: [styles.container, {alignItems: 'flex-start' as const}],
  bubble: [styles.bubble, {backgroundColor: Colors.LIGHT_GRAY}],
  messageText: [styles.messageText, {color: Colors.BLACK}],
  timeText: [styles.timeText],
  metaInfo: [
    styles.metaInfo,
    {alignItems: 'flex-start' as const, marginRight: 0, marginLeft: 4},
  ],
};

const Message = ({
  name,
  createdAt,
  isOtherMessage,
  userImageUrl,
  unreadCount = 0,
  message,
}: MessageProps) => {
  const messageStyles = isOtherMessage ? otherMessageStyles : styles;
  const renderMessage = useCallback(() => {
    if ('text' in message) {
      return <Text style={messageStyles.messageText}>{message.text}</Text>;
    }
    if ('imageUrl' in message) {
      return <ImageMessage url={message.imageUrl} />;
    }
    if ('audioUrl' in message) {
      return (
        <AudioMessage url={message.audioUrl} isOtherMessage={isOtherMessage} />
      );
    }
  }, [message, messageStyles.messageText, isOtherMessage]);
  const renderMessageContainer = useCallback(() => {
    const components = [
      <View key="metaInfo" style={messageStyles.metaInfo}>
        {unreadCount > 0 && (
          <Text style={styles.unreadCountText}>{unreadCount}</Text>
        )}
        <Text key="timeText" style={messageStyles.timeText}>
          {dayjs(createdAt).format('HH:mm')}
        </Text>
      </View>,
      <View key="message" style={messageStyles.bubble}>
        {renderMessage()}
      </View>,
    ];
    //다른사람 메세지는 타임스탬프하고 메세지가 반대로 배치되게
    return isOtherMessage ? components.reverse() : components;
  }, [createdAt, messageStyles, isOtherMessage, unreadCount, renderMessage]);
  return (
    <View style={styles.root}>
      {isOtherMessage && (
        <UserPhoto
          style={styles.userPhoto}
          imageUrl={userImageUrl}
          name={name}
          size={34}
        />
      )}
      <View style={messageStyles.container}>
        <Text style={styles.nameText}>{name}</Text>
        <View style={styles.messageContainer}>{renderMessageContainer()}</View>
      </View>
    </View>
  );
};

export default Message;
