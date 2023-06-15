import {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import dayjs from 'dayjs';
import Colors from '../modules/Color';
import UserPhoto from './UserPhoto';

interface MessageProps {
  name: string;
  text: string;
  createdAt: Date;
  isOtherMessage: boolean;
  imageUrl?: string;
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
    marginBottom: 4,
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
});
const otherMessageStyles = {
  container: [styles.container, {alignItems: 'flex-start' as const}],
  bubble: [styles.bubble, {backgroundColor: Colors.LIGHT_GRAY}],
  messageText: [styles.messageText, {color: Colors.BLACK}],
  timeText: [styles.timeText, {marginRight: 0, marginLeft: 4}],
  metaInfo: [
    styles.metaInfo,
    {alignItems: 'flex-start' as const, marginRight: 0, marginLeft: 4},
  ],
};

const Message = ({
  name,
  text,
  createdAt,
  isOtherMessage,
  imageUrl,
}: MessageProps) => {
  const messageStyles = isOtherMessage ? otherMessageStyles : styles;
  const renderMessageContainer = useCallback(() => {
    const components = [
      <Text key="timeText" style={messageStyles.timeText}>
        {dayjs(createdAt).format('HH:mm')}
      </Text>,
      <View key="message" style={messageStyles.bubble}>
        <Text style={messageStyles.messageText}>{text}</Text>
      </View>,
    ];
    //다른사람 메세지는 타임스탬프하고 메세지가 반대로 배치되게
    return isOtherMessage ? components.reverse() : components;
  }, [createdAt, text, messageStyles, isOtherMessage]);
  return (
    <View style={styles.root}>
      {isOtherMessage && (
        <UserPhoto
          style={styles.userPhoto}
          imageUrl={imageUrl}
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
