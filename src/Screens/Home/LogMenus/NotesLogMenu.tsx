import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import UploadImageOptions from '../../../Components/Modals/UploadImageOptions';
import PrimaryButton from '../../../Components/PrimaryButton';
import {setIsUploadImageOptionModal} from '../../../Redux/slices/modalSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import COLORS from '../../../Utilities/Colors';
import {hp, verticalScale, wp} from '../../../Utilities/Metrics';
import {postData, postFormData} from '../../../APIServices/api';
import ENDPOINTS from '../../../APIServices/endPoints';
import {setFileData} from '../../../Redux/slices/newMealSlice';
import Toast from 'react-native-toast-message';
import {addSchedule} from '../../../Redux/slices/ScheduleSlice';
import {setHomeActiveIndex} from '../../../Redux/slices/initialSlice';

interface CapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  name?: string;
}

const NotesLogMenu = () => {
  const dispatch = useAppDispatch();
  const {isUploadImageOptionModal} = useAppSelector(state => state.modals);

  const {userData} = useAppSelector(state => state.userData);

  // Update state to store complete image object instead of just URI
  const [image, setImage] = useState<CapturedPhoto | null>(null);
  const [comment, setComment] = useState('');

  const closeModal = () => {
    dispatch(setIsUploadImageOptionModal(false));
  };

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.5}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageData: CapturedPhoto = {
          uri: asset.uri || '',
          width: asset.width,
          height: asset.height,
          type: asset.type,
          name: asset.fileName,
        };

        const formData = new FormData();
        const assetData = imageData;
        formData.append('asset', {
          uri: assetData.uri,
          type: assetData.type,
          name: assetData.name,
        });

        try {
          const response = await postFormData<any>(
            ENDPOINTS.uploadFile,
            formData,
          );

          if (response.data) {
            const get_Image_url = response.data.url;
            if (get_Image_url) {
              setImage(get_Image_url);
            }
          }
        } catch (error) {
          console.log(error, 'Something went wrong');
        }
      }
      closeModal();
    });
  };

  const handleCameraPick = async () => {
    // Fixed typo in function name
    try {
      const result = await launchCamera({
        quality: 0.5,
        mediaType: 'photo',
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        console.log('Camera error:', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageData: CapturedPhoto = {
          uri: asset.uri || '',
          width: asset.width,
          height: asset.height,
          type: asset.type,
          name: asset.fileName,
        };

        const formData = new FormData();
        const assetData = imageData;
        formData.append('asset', {
          uri: assetData.uri,
          type: assetData.type,
          name: assetData.name,
        });

        try {
          const response = await postFormData<any>(
            ENDPOINTS.uploadFile,
            formData,
          );

          if (response.data) {
            const get_Image_url = response.data.url;

            if (get_Image_url) {
              console.log('image', image);

              setImage(get_Image_url);
            }
          }
        } catch (error) {
          console.log(error, 'Something went wrong');
        }
      }

      closeModal();
    } catch (error) {
      console.log('Camera capture failed:', error);
    }
  };

  const logNotes = async () => {
    // Validate image

    // Validate comment
    if (!comment || comment.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter a comment',
        visibilityTime: 2000,
      });
      return;
    }

    const now = new Date(); // current date
    const scheduleDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );
    const data = {
      description: '',
      schedule_at: scheduleDate.toISOString(),
      user_id: userData?.user_id,
      status: 'done',
      type: 'note',
      content: {
        image: image ? image : '',
        notes: comment,
      },
    };

    try {
      const response = await postData<any>(ENDPOINTS.createSchedule, {data});
      if (response.data.data) {
        dispatch(addSchedule(response.data.data));

        Toast.show({
          type: 'success',
          text1: 'Measurements Logged Successfully',
          visibilityTime: 2000,
        });
        dispatch(setHomeActiveIndex(0));
        setImage(null);
        setComment('');
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  return (
    <View style={styles.logNotesView}>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          gap: verticalScale(20),
          flexGrow: 1,
        }}>
        <CustomText fontFamily="bold">Image</CustomText>
        <TouchableOpacity
          onPress={() => {
            dispatch(setIsUploadImageOptionModal(true));
          }}
          style={styles.uploadImageView}
          activeOpacity={0.8}>
          {image ? (
            <Image
              source={{uri: image}}
              style={{height: hp(18), width: wp(80), resizeMode: 'cover'}}
            />
          ) : (
            <CustomIcon
              Icon={ICONS.UploadImageIcon}
              height={verticalScale(70)}
              width={verticalScale(70)}
            />
          )}
        </TouchableOpacity>

        <CustomText fontFamily="bold">Comment</CustomText>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </ScrollView>
      <View
        style={{
          backgroundColor: COLORS.brown,
          width: wp(100),
          paddingVertical: verticalScale(25),
        }}>
        <PrimaryButton title="Log Comment" onPress={logNotes} />
      </View>
      {isUploadImageOptionModal && (
        <UploadImageOptions
          closeModal={closeModal}
          isModalVisible={isUploadImageOptionModal}
          onPressCamera={handleCameraPick}
          onPressGallery={handleImagePick}
        />
      )}
    </View>
  );
};

export default NotesLogMenu;

const styles = StyleSheet.create({
  uploadImageView: {
    height: hp(18),
    width: wp(80),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CECECE',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  commentInput: {
    height: hp(17),
    width: wp(80),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CECECE',
    backgroundColor: 'transparent',
    color: COLORS.white,
    padding: 10,
    textAlignVertical: 'top', // For multiline input on Android
  },

  logNotesView: {
    flex: 1,
  },
});
