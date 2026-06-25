import React, {FC} from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale} from '../../Utilities/Metrics';
import {CustomText} from '../CustomText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';

type UploadImageOptionsProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onPressCamera: () => void;
  onPressGallery: () => void;
  title?: string;
};

const UploadImageOptions: FC<UploadImageOptionsProps> = ({
  isModalVisible,
  closeModal,
  onPressCamera,
  onPressGallery,
  title = 'Select Image Upload Option',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isModalVisible}
      style={{padding: 0, margin: 0, justifyContent: 'flex-end'}}
      onRequestClose={closeModal}
      // animationIn="slideInUp"
      // animationOut="slideOutDown"
      animationType="fade"
      transparent>
      <TouchableOpacity
        onPress={closeModal}
        style={{
          flex: 1,
        }}
      />
      <View
        style={{
          backgroundColor: COLORS.brown,
          justifyContent: 'flex-end',
          paddingTop: verticalScale(20),
          paddingBottom: verticalScale(20) + insets.bottom,
          paddingHorizontal: horizontalScale(10),
          gap: verticalScale(30),
          borderTopEndRadius: 10,
          borderTopStartRadius: 10,
        }}>
        <CustomText fontFamily="bold" fontSize={20}>
          {title}
        </CustomText>

        <View style={{gap: verticalScale(20)}}>
          <TouchableOpacity
            onPress={onPressGallery}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: horizontalScale(10),
            }}>
            <CustomIcon Icon={ICONS.GalleryIcon} height={25} width={25} />
            <CustomText fontFamily="medium">Choose from Gallery</CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressCamera}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: horizontalScale(10),
            }}>
            <CustomIcon Icon={ICONS.CamearIcon} height={25} width={25} />
            <CustomText fontFamily="medium">Upload from Camera</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UploadImageOptions;
