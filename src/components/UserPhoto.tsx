import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Profile from './Profile';
import ImageView from 'react-native-image-viewing';
import {useCallback, useMemo, useState} from 'react';

interface UserPhotoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
  name?: string;
  nameStyle?: StyleProp<TextStyle>;
}

const UserPhoto = ({
  size = 40,
  style,
  imageUrl,
  name,
  nameStyle,
}: UserPhotoProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const images = useMemo(
    () => (imageUrl != null ? [{uri: imageUrl}] : []),
    [imageUrl],
  );
  const showImageViewer = useCallback(() => {
    setViewerVisible(true);
  }, []);
  return (
    <>
      <Profile
        size={size}
        style={style}
        imageUrl={imageUrl}
        text={name?.[0].toUpperCase()}
        textStyle={nameStyle}
        onPress={images.length > 0 ? showImageViewer : undefined}
      />
      <ImageView
        images={images}
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </>
  );
};

export default UserPhoto;
