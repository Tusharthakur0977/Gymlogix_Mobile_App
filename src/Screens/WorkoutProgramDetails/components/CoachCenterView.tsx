import React, {FC, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {fetchData, postData} from '../../../APIServices/api';
import ENDPOINTS from '../../../APIServices/endPoints';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import COLORS from '../../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../../Utilities/Metrics';
import {ChatBubble} from '../../Plan/WorkoutProgramDetails';
const messages = [
  {id: '1', text: 'you will have to do hard', sender: false},
  {id: '2', text: 'How do I work the bench press', sender: true},
  {id: '3', text: 'You can start with light weights', sender: false},
];

type CoachData = {
  planId: any;
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

const CoachCenterView: FC<CoachData> = ({planId}) => {
  const [message, setMessage] = useState('');
  const [ispremium, setIspremium] = useState(false); // Simulating premium status
  // const [ispremium, setIspremium] = useState(Math.random() < 0.5); // Simulating premium status
  const [messages, setMessages] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isKyeboard, setisKyeboard] = useState(false);

  const flatListRef = useRef<FlatList>(null); // Reference to FlatList for scrolling

  const SENT_MESSAGES = async () => {
    if (message.trim() === '') {
      return;
    }
    const data = {
      plan_id: planId,
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
    if (pageNumber > 1) setLoadingMore(true);
    try {
      const response = await fetchData<ResponseData>(
        `${ENDPOINTS.get_messages}plan_id=${planId}`,
      );
      const formatted =
        response.data?.messages?.flatMap((item: any, parentIndex: number) =>
          item.messages.map((msg: any, index: number) => ({
            id: `${item.id}-${msg.created_at}-${index}-${parentIndex}`,
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

  useEffect(() => {
    GET_MESSAGES();
  }, []);

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? verticalScale(238) : 0}>
      <View style={styles.conversationContainer}>
        {ispremium ? (
          <>
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
                style={styles.messageInput}
                placeholderTextColor={COLORS.brown}
              />
              <View style={styles.sendIconContainer}>
                <CustomIcon
                  Icon={ICONS.SendMessageIcon}
                  height={40}
                  width={40}
                  onPress={SENT_MESSAGES}
                />
              </View>
            </View>
          </>
        ) : (
          <View
            style={{
              alignItems: 'center',
              marginTop: verticalScale(20),
              flex: 1,
              justifyContent: 'center',
            }}>
            <CustomText fontFamily="medium" fontSize={20}>
              Premium Access Only
            </CustomText>

            <CustomText
              fontFamily="medium"
              fontSize={14}
              style={{
                marginTop: verticalScale(10),
                marginBottom: verticalScale(30),
                textAlign: 'center',
                width: wp(70),
              }}>
              Upgrade now to chat, ask questions, and get expert support!
            </CustomText>

            <PrimaryButton
              title="Upgrade now!"
              onPress={() => {}}
              backgroundColor="#FFB700"
              style={{width: wp(70)}}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CoachCenterView;

const styles = StyleSheet.create({
  conversationContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
    flex: 1,
    justifyContent: 'space-between',
    // marginBottom: verticalScale(20),
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
