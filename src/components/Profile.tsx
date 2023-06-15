import {useMemo} from 'react';
import {
  View,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
  ImageStyle,
} from 'react-native';
import Colors from '../modules/Color';

const stlyes = StyleSheet.create({
  container: {
    backgroundColor: Colors.GRAY,
    overflow: 'hidden',
  },
});

interface ProfileProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  imageUrl?: string;
}

const Profile = ({
  size = 48,
  style: containerStyleProp,
  onPress,
  imageUrl,
}: ProfileProps) => {
  const containerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    return [
      stlyes.container,
      {width: size, height: size, borderRadius: size / 2},
      containerStyleProp,
    ];
  }, [containerStyleProp, size]);
  const imageStyle = useMemo<StyleProp<ImageStyle>>(
    () => ({width: size, height: size}),
    [size],
  );
  return (
    <TouchableOpacity disabled={onPress == null} onPress={onPress}>
      <View style={containerStyle}>
        {imageUrl && <Image source={{uri: imageUrl}} style={imageStyle} />}
      </View>
    </TouchableOpacity>
  );
};

export default Profile;
