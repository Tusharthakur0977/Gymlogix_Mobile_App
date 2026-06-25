import {useNavigation} from '@react-navigation/native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {fetchData, postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import {useAppSelector} from '../../Redux/store';
import {ActivePlanListItem} from '../../Seeds/Plans';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale} from '../../Utilities/Metrics';
import ProgramExcercise from './ProgramExcerciseList';

type WorkoutProgramDetailsProps = {
  onPressBack: () => void;
};

const TabOptions: Array<'Excercise' | 'Details' | "Coach's corner"> = [
  'Excercise',
  'Details',
  "Coach's corner",
];

const COLOR = {
  sender: '#F5ECDC',
  receiver: '#EEF3F8',
  black: '#000',
  white: '#fff',
};

const messages = [
  {id: '1', text: 'you will have to do hard', sender: false},
  {id: '2', text: 'How do I work the bench press', sender: true},
  {id: '3', text: 'You can start with light weights', sender: false},
  {id: '4', text: 'You can start with light weights', sender: false},
  {id: '5', text: 'You can start with light weights', sender: false},
  {id: '6', text: 'You can start with light weights', sender: false},
  {id: '7', text: 'You can start with light weights', sender: true},
];

export const ChatBubble: FC<{text: string; sender: boolean}> = ({
  text,
  sender,
}) => {
  return (
    <View
      style={[
        styles.chatBubble,
        {
          backgroundColor: sender ? COLOR.sender : COLOR.receiver,
          borderTopStartRadius: sender ? 16 : 0,
          borderBottomEndRadius: sender ? 0 : 16,
          alignSelf: sender ? 'flex-end' : 'flex-start',
        },
      ]}>
      <Text style={styles.chatBubbleText}>{text}</Text>
    </View>
  );
};

interface Message {
  text: string;
  created_at: string;
  created_by: string;
}

interface MessageItem {
  id: string;
  plan_id: number;
  user_id: number;
  messages: Message[];
}

interface ResponseData {
  status: number;
  messages: MessageItem[];
}

const WorkoutProgramDetails: FC<WorkoutProgramDetailsProps> = ({
  onPressBack,
}) => {
  const navigation = useNavigation<any>();
  const {currentProgramId} = useAppSelector(state => state.initial);
  const {planData} = useAppSelector(state => state.planData);
  const {userData} = useAppSelector(state => state.userData);
  const {exerciseData} = useAppSelector(state => state.exerciseData);
  const [currentProgramDetails, setCurrentProgramDetails] =
    useState<null | ActivePlanListItem>(null);
  const [activeProgramTab, setActiveProgramTab] = useState<
    'Excercise' | 'Details' | "Coach's corner"
  >('Excercise');
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isKyeboard, setisKyeboard] = useState(false);
  const [workoutData, setWorkoutData] = useState(null);
  const [isPlanActive, setIsPlanActive] = useState(false);
  const flatListRef = useRef<FlatList>(null); // Reference to FlatList for scrolling

  const renderLevelWithStars = () => {
    const level: any = currentProgramDetails?.allData?.content?.difficulty;
    const isFilled =
      level === 'beginners' || level === 'beginner'
        ? 1
        : level === 'intermediate'
        ? 2
        : 3;

    return (
      <View style={styles.levelContainer}>
        <View style={styles.starContainer}>
          {Array.from({length: 3}).map((_, index) => (
            <CustomIcon
              key={index}
              Icon={
                index < isFilled ? ICONS.FilledStarIcon : ICONS.EmptyStarIcon
              }
              height={53}
              width={53}
            />
          ))}
        </View>
        <CustomText fontFamily="bold">
          {currentProgramDetails?.allData?.content.difficulty}
        </CustomText>
      </View>
    );
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      setisKyeboard(true);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setisKyeboard(false);
    });

    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  useEffect(() => {
    const foundProgram = planData?.find(
      item => item.allData?.plan_id === currentProgramId,
    );

    const isActivateIds = (userData?.activated_plan || []).map(
      (id: string | number) => Number(id),
    );

    const isActive = isActivateIds.includes(Number(currentProgramId));

    setIsPlanActive(isActive ?? false);

    const foundProgramWorkoutData = foundProgram?.allData?.content.workouts;

    const formattedWorkout = foundProgramWorkoutData?.map(workout => ({
      day: workout.name,
      dotColor: workout.color,
      exercises: workout.exercises.flatMap(ex =>
        ex.workout_exercises.map(we => {
          const match = exerciseData?.find(
            t => t.exercise_id === we.exercise_id,
          );

          return {
            id: match?.exercise_id,
            image:
              match?.images_urls[0] ||
              'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
            name: match?.name || '',
            sets: we.sets?.toString() || '',
            reps: we.reps?.toString() || '',
          };
        }),
      ),
      restPeriod: workout.rest_period,
    }));

    setWorkoutData(formattedWorkout! || []);
    setCurrentProgramDetails(foundProgram ?? null);
  }, [currentProgramId, planData, userData, exerciseData]);

  const createActivatePlan = async () => {
    try {
      const response = await postData(
        `${ENDPOINTS.activate_plan}plan_id=${currentProgramId}`,
      );

      if (response.data) {
        setIsPlanActive(true);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const deactivatePlan = async () => {
    try {
      const resposne = await postData(
        `${ENDPOINTS.deactivate_plan}plan_id=${currentProgramId}`,
      );
      if (resposne.data) {
        setIsPlanActive(false);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const CREATE_UPDATE_MESSAGE = async () => {
    if (message.trim() === '') {
      return;
    }
    const matchedItem = planData?.find(
      item => item.allData?.plan_id === currentProgramId,
    );

    const data = {
      plan_id: matchedItem?.allData?.plan_id,
      message: message,
    };

    try {
      const response = await postData<any>(
        `${ENDPOINTS.create_update_message}plan_id=${data.plan_id}&message=${data.message}`,
      );

      if (
        response.data.messages ===
        'Conversation successfully created or updated.'
      ) {
        setMessage('');
        await GET_MESSAGES(1);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const GET_MESSAGES = async (pageNumber: number = 1) => {
    try {
      const matchedItem = planData?.find(
        item => item.allData?.plan_id === currentProgramId,
      );
      const data = {
        plan_id: matchedItem?.allData?.plan_id,
      };

      if (pageNumber > 1) setLoadingMore(true);

      const response = await fetchData<ResponseData>(
        `${ENDPOINTS.get_messages}plan_id=${data.plan_id}`,
      );

      const formatted =
        response.data?.messages?.flatMap((item: any, parentIndex: number) =>
          item.messages.map((msg: any, index: number) => ({
            id: `${item.plan_id}-${msg.created_at}-${index}-${parentIndex}`,
            text: msg.text,
            created_by: msg.created_by,
            created_at: msg.created_at,
            plan_id: item.plan_id,
            user_id: item.user_id,
          })),
        ) || [];

      //  Sort newest first so FlatList inverted works correctly
      const sorted = formatted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setAllMessages(sorted);

      //  do NOT cut the list on refresh after sending
      if (pageNumber === 1) {
        setVisibleCount(PAGE_SIZE);
        setMessages(sorted.slice(0, PAGE_SIZE));
      } else {
        setMessages(sorted.slice(0, visibleCount));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  //  Load latest messages on mount
  useEffect(() => {
    GET_MESSAGES();
  }, []);

  //  Load more (older) when scroll up
  const loadMoreMessages = () => {
    if (loadingMore) return;
    if (visibleCount >= allMessages.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const newCount = visibleCount + PAGE_SIZE;
      setVisibleCount(newCount);
      setMessages(allMessages.slice(0, newCount)); // take more from top
      setLoadingMore(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} // adjust offset for header height
    >
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: currentProgramDetails?.coverImage
              ? currentProgramDetails?.coverImage
              : currentProgramDetails?.allData?.image_url
              ? currentProgramDetails?.allData?.image_url
              : 'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
          }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', '#1F1A16']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <View style={styles.headerContainer}>
              <CustomIcon onPress={onPressBack} Icon={ICONS.BackArrow} />
              <View style={styles.headerTextContainer}>
                <CustomText fontFamily="bold">
                  {currentProgramDetails?.title}
                </CustomText>
                <View style={styles.tagContainer}>
                  {(currentProgramDetails?.tags
                    ? currentProgramDetails?.tags
                    : currentProgramDetails?.allData?.content.tags
                    ? currentProgramDetails?.allData?.content.tags
                    : currentProgramDetails?.allData?.tags
                  )?.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <CustomText fontSize={12}>{tag}</CustomText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.tabContainer}>
          {TabOptions.filter(tab => {
            if (tab !== "Coach's corner") return true;

            const activatedIds = (userData?.activated_plan || []).map(Number);
            return activatedIds.includes(Number(currentProgramId));
          }).map(
            (
              tab: 'Excercise' | 'Details' | "Coach's corner",
              index: number,
            ) => {
              const isSelected = activeProgramTab === tab;
              return (
                <Pressable
                  key={index}
                  onPress={() => setActiveProgramTab(tab)}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: isSelected
                        ? COLORS.yellow
                        : 'transparent',
                    },
                  ]}>
                  <CustomText>{tab}</CustomText>
                </Pressable>
              );
            },
          )}
        </View>

        {activeProgramTab === 'Excercise' && (
          <ProgramExcercise
            programData={workoutData || []}
            isActivated={isPlanActive}
            onPressActive={() => {
              if (isPlanActive) {
                deactivatePlan(); // Will setIsPlanActive(false) inside
              } else {
                createActivatePlan(); // Will setIsPlanActive(true) inside
              }
            }}
          />
        )}

        {activeProgramTab === 'Details' && (
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            <View style={styles.detailsStatsContainer}>
              <View style={styles.statItem}>
                <CustomIcon Icon={ICONS.EnduranceIcon} height={48} width={48} />
                <CustomText fontSize={14} fontFamily="bold">
                  {currentProgramDetails?.allData?.content.goal || 'Endurance'}
                </CustomText>
              </View>
              <View style={styles.statItem}>
                <CustomIcon
                  Icon={ICONS.GreenCalendarIcon}
                  height={48}
                  width={48}
                />
                <CustomText fontSize={14} fontFamily="bold">
                  {`${currentProgramDetails?.allData?.content.duration} Weeks`}
                </CustomText>
              </View>
              <View style={styles.statItem}>
                <CustomIcon Icon={ICONS.barbellIcon} height={48} width={48} />
                <CustomText fontSize={14} fontFamily="bold">
                  {currentProgramDetails?.allData?.content.location}
                </CustomText>
              </View>
              <View style={styles.statItem}>
                <CustomText fontSize={30} fontFamily="bold">
                  {currentProgramDetails?.allData?.content.days_per_week}
                </CustomText>
                <CustomText fontSize={14} fontFamily="bold">
                  Days
                </CustomText>
              </View>
            </View>

            {renderLevelWithStars()}
            <CustomText fontSize={22} fontFamily="extraBold">
              Details
            </CustomText>
            <CustomText fontSize={14} style={styles.detailsText}>
              {currentProgramDetails?.allData?.content.details}
            </CustomText>
          </ScrollView>
        )}

        {activeProgramTab === "Coach's corner" && (
          <View style={styles.conversationContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              inverted
              bounces={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => {
                return (
                  <ChatBubble
                    text={item.text}
                    sender={item.created_by === 'user'}
                  />
                );
              }}
              onEndReached={loadMoreMessages} // now safe, because we're slicing
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={{margin: 10}}
                  />
                ) : null
              }
            />

            <View style={styles.inputContainer}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.brown}
                style={styles.messageInput}
              />
              <View style={styles.sendIconContainer}>
                <CustomIcon
                  Icon={ICONS.SendMessageIcon}
                  height={40}
                  width={40}
                  onPress={CREATE_UPDATE_MESSAGE}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default WorkoutProgramDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
    paddingTop: verticalScale(10),
  },
  coverImage: {
    height: hp(15),
  },
  coverImageStyle: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: verticalScale(10),
    paddingHorizontal: verticalScale(10),
    paddingVertical: verticalScale(10),
  },
  headerTextContainer: {
    gap: verticalScale(10),
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    marginTop: 5,
    // flexWrap: 'wrap',
    // flex: 1,
  },
  tag: {
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: verticalScale(8),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
  },
  detailsContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
  },
  detailsStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: verticalScale(20),
    minHeight: verticalScale(85),
    maxHeight: verticalScale(85),
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelContainer: {
    gap: verticalScale(20),
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    justifyContent: 'center',
  },
  detailsText: {
    lineHeight: 22,
  },
  conversationContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
    flex: 1,
    justifyContent: 'space-between',
  },
  chatBubble: {
    padding: 12,
    borderTopEndRadius: 16,
    borderBottomStartRadius: 16,
    maxWidth: '75%',
    marginVertical: 4,
  },
  chatBubbleText: {
    color: COLORS.black,
    fontSize: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  messageInput: {
    backgroundColor: COLORS.white,
    borderRadius: 100,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderWidth: 1.5,
    borderColor: '#979C9E',
  },
  sendIconContainer: {
    position: 'absolute',
    right: horizontalScale(0),
    top: '50%',
    transform: [{translateY: -20}],
  },
});
