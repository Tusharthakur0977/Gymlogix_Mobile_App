import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../Utilities/Metrics';
import {useAppSelector} from '../../Redux/store';
import {
  deleteLocalStorageData,
  getLocalStorageData,
} from '../../Utilities/Storage';
import STORAGE_KEYS from '../../Utilities/Constants';
import {SettingScreenProps} from '../../Typings/route';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as RNIap from 'react-native-iap';
import {
  acknowledgePurchaseAndroid,
  ErrorCode,
  fetchProducts,
  getAvailablePurchases,
  ProductSubscription,
  ProductSubscriptionAndroid,
  ProductSubscriptionIOS,
  PurchaseError,
  useIAP,
} from 'react-native-iap';
import {postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';

const productIds = Platform.select({
  android: [
    'com.gymlogix.subscription.monthly',
    'com.gymlogix.subscription.yearly',
  ],
});

const ANDROID_SUB_IDS = [
  'com.gymlogix.subscription.monthly',
  'com.gymlogix.subscription.yearly',
];

const SETTINGS: FC<SettingScreenProps> = ({navigation}) => {
  const [acitveUi, setAcitveUi] = useState(0);

  const {userData} = useAppSelector(state => state.userData);

  // Expanded UI states
  const [expandedSoundUI, setExpandedSoundUI] = useState(false);
  const [expandedGeneralUI, setExpandedGeneralUI] = useState(false);
  const [expandedWorkoutUI, setExpandedWorkoutUI] = useState(false);
  const [expandedDataUI, setExpandedDataUI] = useState(false);
  const [expandedHelpUI, setExpandedHelpUI] = useState(false);

  // Sound & Notification settings
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableReminders, setEnableReminders] = useState(true);

  // General settings
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedUnits, setSelectedUnits] = useState('Metric'); // Metric or Imperial
  const [preventScreenLock, setPreventScreenLock] = useState(true);

  const [selectedPlanType, setSelectedPlanType] = useState<
    'monthly' | 'yearly' | any
  >(null);

  const [selectedRMFormula, setSelectedRMFormula] = useState('Epley Formula');
  const [
    updateBodyWeightFromMeasurements,
    setUpdateBodyWeightFromMeasurements,
  ] = useState(true);

  // Data settings
  const [syncToCloud, setSyncToCloud] = useState(true);
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState('1 Year');
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState<{
    productId: string; // The base plan ID or iOS product ID
    offerToken?: string; // The specific Android offer token
    planTitle: string; // The plan display name
  } | null>(null);

  const [subscriptionsList, setSubscriptionsList] = useState<
    ProductSubscription[] | null
  >([]);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState<string | null>(
    null,
  );
  const [activeAndroidSub, setActiveAndroidSub] = useState<any>(null);

  const {connected, requestPurchase, validateReceipt, finishTransaction} =
    useIAP({
      onPurchaseSuccess: async purchase => {
        console.log(purchase, 'PURCHASE');

        try {
          const token = await getLocalStorageData(STORAGE_KEYS.token);

          // 1️⃣ Validate receipt
          const validation = await validateReceipt(purchase.productId, {
            packageName: 'com.gymlogix',
            productToken: purchase?.purchaseToken!,
            accessToken: token,
            isSub: true,
          });

          console.log(validation, 'VALIDATION SUCCESS');

          // 2️⃣ Detect plan type (Monthly / Yearly)

          const upgradeType = selectedPlanType || 'monthly';

          // 3️⃣ Call your backend upgrade API
          const upgradeResponse = await handleUpgradeMemberShip(
            upgradeType,
            purchase.transactionId || purchase.purchaseToken, // receipt
            Platform.OS === 'android' ? 'google' : 'apple',
            Platform.OS === 'android' ? 'com.gymlogix' : 'com.gymlogix',
            Platform.OS === 'android' ? purchase.productId : purchase.productId,
          );

          // 4️⃣ Finish transaction
          await finishTransaction({purchase});

          const updatedSub = await refreshActiveSub();

          if (updatedSub) {
            setActiveAndroidSub(updatedSub);
            setSelectedPlanTitle(null);
            setSelectedPurchaseDetails(null);
          }
        } catch (error) {
          console.error('Purchase Flow Error:', error);

          // Still finish to avoid stuck purchases
          await finishTransaction({purchase});
        }
      },
      onPurchaseError: async error => {
        // Always show the loading state is finished

        console.error('IAP Purchase Failed:', error.code, error.message);

        const isItemAlreadyOwnedError =
          error.message === 'Item is already owned';

        if (Platform.OS === 'android' && isItemAlreadyOwnedError) {
          setTimeout(() => {
            // Alert.alert(
            //   'Subscription Already Active',
            //   'This subscription is currently active on your device. It is linked to a different Google Play account on this device (likely the one used by your original app account). Please ensure you are logged into the correct Google Play Store account, or switch your account within the Play Store settings to buy it again from this account.',
            //   [
            //     {
            //       text: 'Got It',
            //     },
            //     {
            //       text: 'Manage Play Accounts',
            //       onPress: async () => {
            //         await RNIap.deepLinkToSubscriptions({
            //           skuAndroid: error.productId,
            //           packageNameAndroid: 'com.gymlogix', // Your app's package name
            //         });
            //       },
            //     },
            //   ],
            // );
          }, 400);
          return;
        } else if (
          error.code === 'developer-error' &&
          error.message === 'Invalid arguments provided to the API'
        ) {
          setTimeout(() => {
            Alert.alert(
              'Subscription Conflict Detected',
              'This device has a recently cancelled subscription linked to a **different** Google Play account. Please ensure the correct account is logged into the Play Store, or wait for the existing subscription to fully expire to make a new purchase.',
              [
                {
                  text: 'Got It',
                },
                {
                  text: 'Manage Play Accounts',
                  onPress: async () => {
                    await RNIap.deepLinkToSubscriptions({
                      skuAndroid: error.productId,
                      packageNameAndroid: 'com.gymlogix', // Your app's package name
                    });
                  },
                },
              ],
            );
          }, 400);
          return;
        } else if (error.code !== ErrorCode.UserCancelled) {
          // Default error handling for all other genuine errors
          Alert.alert('Error', error.message);
        }
      },
    });

  const handlePlanSelect = (
    purchaseDetails: typeof selectedPurchaseDetails,
  ) => {
    if (selectedPlanTitle === purchaseDetails?.planTitle) {
      setSelectedPlanTitle(null);
      setSelectedPurchaseDetails(null);
    } else {
      setSelectedPlanTitle(purchaseDetails?.planTitle || null);
      setSelectedPurchaseDetails(purchaseDetails);
    }
  };

  const handleUpgradeMemberShip = async (
    upgrade: any, // 'monthly' or 'yearly'
    receipt: any, // purchase receipt
    platform: any, // 'google' or 'apple'
    packageName: any, // required for Google (optional for Apple)
    subscriptionId: any, // required for Google (optional for Apple)
  ) => {
    try {
      const data = {
        upgrade,
        receipt,
        platform,
        packageName,
        subscriptionId,
      };

      const response = await postData(ENDPOINTS.subscriptions, data);

      return response;
    } catch (error) {
      console.error('Upgrade API Error:', error);
    }
  };

  // const handleRestorePurchase = useCallback(async () => {
  //   if (!connected) {
  //     Alert.alert('Error', 'Billing not connected.');
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);

  //     const purchases = await getAvailablePurchases();

  //     if (!purchases?.length) {
  //       Alert.alert('Restore Failed', 'No previous purchases found.');
  //       return;
  //     }

  //     // Get only valid subs
  //     const validSubscriptions = purchases.filter(p =>
  //       productIds?.includes(p.productId),
  //     );

  //     if (!validSubscriptions.length) {
  //       Alert.alert('Restore Failed', 'No active subscription found.');
  //       return;
  //     }

  //     // Pick latest subscription
  //     const activeSubscription = validSubscriptions.sort(
  //       (a, b) => b.transactionDate - a.transactionDate,
  //     )[0];

  //     console.log('RESTORE PURCHASE:', activeSubscription);

  //     // Detect plan
  //     const planType =
  //       activeSubscription.productId === 'com.gymlogix.subscription.yearly'
  //         ? 'yearly'
  //         : 'monthly';

  //     // Sync with backend
  //     const response = await handleUpgradeMemberShip(
  //       planType,
  //       Platform.OS === 'android'
  //         ? activeSubscription.purchaseToken
  //         : activeSubscription.transactionId,
  //       Platform.OS === 'android' ? 'google' : 'apple',
  //       'com.gymlogix',
  //       activeSubscription.productId,
  //     );

  //     console.log('RESTORE SYNC RESPONSE:', response);

  //     await finishTransaction({purchase: activeSubscription});

  //     Alert.alert(
  //       'Success',
  //       `${
  //         planType.charAt(0).toUpperCase() + planType.slice(1)
  //       } subscription restored successfully.`,
  //     );
  //   } catch (error) {
  //     console.error('RESTORE ERROR:', error);
  //     Alert.alert('Restore Error', 'Could not restore subscription.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [connected]);

  const handleManageSubscription = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
        return;
      }

      console.log('SELETC', selectedPurchaseDetails);

      if (Platform.OS === 'android') {
        if (!activeAndroidSub?.productId) {
          Alert.alert(
            'No Active Subscription',
            'No active subscription found for this account.',
          );
          return;
        }

        await RNIap.deepLinkToSubscriptions({
          skuAndroid: activeAndroidSub.productId,
          packageNameAndroid: 'com.gymlogix',
        });
      }
    } catch (error) {
      console.error('Failed to open subscription management:', error);

      Alert.alert(
        'Error',
        'Unable to open subscription settings. Please try again later.',
      );
    }
  };

  const getPriceDetails = (
    subscription: ProductSubscriptionAndroid | ProductSubscriptionIOS,
  ) => {
    if (Platform.OS === 'ios') {
      const iosSubscription = subscription as ProductSubscriptionIOS;

      return {
        mainPrice: iosSubscription.displayPrice,
        introductoryPrice: iosSubscription.introductoryPriceAsAmountIOS,
        introductoryPeriod:
          iosSubscription.introductoryPriceSubscriptionPeriodIOS,
        currency: iosSubscription.currency,
        purchaseId: iosSubscription.id,
        length: iosSubscription.subscriptionPeriodUnitIOS,
      };
    } else {
      const androidSubscription = subscription as ProductSubscriptionAndroid;

      // Android: Find both introductory and recurring phases
      let mainPrice = androidSubscription.displayPrice;
      let introOffer: {price: string; period: string} | null = null;
      let offerToken: string | undefined = undefined; // New field for Android purchase
      let purchaseId = androidSubscription.id; // Default to main ID

      const offerDetails =
        (androidSubscription.subscriptionOfferDetailsAndroid || [])[0];

      if (offerDetails) {
        const pricingPhases = offerDetails.pricingPhases?.pricingPhaseList;
        offerToken = offerDetails.offerToken; // Get the offer token
        purchaseId = offerDetails.basePlanId; // Use base plan ID

        if (pricingPhases && pricingPhases.length > 0) {
          const introductoryPhase = pricingPhases.find(
            phase => phase.recurrenceMode === 2,
          );

          if (introductoryPhase) {
            introOffer = {
              price: introductoryPhase.formattedPrice,
              period: introductoryPhase.billingPeriod,
            };
          }

          const recurringPhase = pricingPhases.find(
            phase => phase.recurrenceMode === 1,
          );

          if (recurringPhase) {
            mainPrice = recurringPhase.formattedPrice;
          } else {
            mainPrice = pricingPhases[pricingPhases.length - 1].formattedPrice;
          }
        }
      }

      return {
        mainPrice,
        introductoryPrice: introOffer?.price,
        introductoryPeriod: introOffer?.period,
        currency: androidSubscription.currency,
        offerToken, // Added offerToken
        purchaseId, // Added purchaseId (Base Plan ID)
        length: 'Month',
      };
    }
  };

  const refreshActiveSub = async () => {
    try {
      const purchases = await getAvailablePurchases();

      const activeSub = purchases.find(p =>
        ANDROID_SUB_IDS.includes(p.productId),
      );

      if (activeSub) {
        setActiveAndroidSub(activeSub);
        return activeSub;
      }

      setActiveAndroidSub(null);
      return null;
    } catch (e) {
      console.log('Refresh sub error', e);
      return null;
    }
  };

  const handleSubscription = useCallback(
    async (itemId: string, offerToken?: string) => {
      let activeSub = activeAndroidSub;
      if (!activeSub) {
        activeSub = await refreshActiveSub();
      }

      type AndroidSubPayload = RNIap.RequestSubscriptionAndroidProps & {
        purchaseTokenAndroid?: string;
        prorationModeAndroid?: number;
      };

      const androidPayload: AndroidSubPayload = {
        skus: [itemId],
      };

      // Only add upgrade params if active sub exists
      if (activeSub?.purchaseToken) {
        androidPayload.purchaseTokenAndroid = activeSub.purchaseToken;
        androidPayload.prorationModeAndroid = 3;
      }

      // Offer token (if exists)
      if (Platform.OS === 'android' && offerToken) {
        androidPayload.subscriptionOffers = [
          {
            sku: itemId,
            offerToken,
          },
        ];
      }

      try {
        await requestPurchase({
          request: {
            ios: {
              sku: itemId,
              appAccountToken: userData?.id,
            },
            android: androidPayload,
          },
          type: 'subs',
        });
      } catch (err: any) {
        console.warn('requestPurchase failed:', err);
        Alert.alert('Subscription Failed', err.message);
      }
    },
    [subscriptionsList, activeAndroidSub],
  );

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const subscriptions = await fetchProducts({
        skus: productIds as string[], // Use the defined productIds
        type: 'subs',
      });

      setSubscriptionsList(subscriptions as ProductSubscription[]);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSamePlan = (sku: string) => {
    return activeAndroidSub?.productId === sku;
  };

  useEffect(() => {
    if (!connected) return;

    loadSubscriptions();

    getAvailablePurchases()
      .then(purchases => {
        if (Platform.OS !== 'android') return;

        const activeSub = purchases.find(p =>
          ANDROID_SUB_IDS.includes(p.productId),
        );

        if (activeSub) {
          console.log('ACTIVE ANDROID SUB:', activeSub.productId);
          setActiveAndroidSub(activeSub);
        }
      })
      .catch(e => console.error('Purchase check error', e));
  }, [connected]);

  const rendermemberShipData = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          width: wp(100),

          gap: verticalScale(10),
        }}
        style={{flex: 1, marginBottom: verticalScale(5)}}>
        <View
          style={{
            paddingHorizontal: horizontalScale(20),
            paddingVertical: verticalScale(20),
            alignSelf: 'center',
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            borderRadius: 10,
            width: '95%',
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: horizontalScale(10),
              alignItems: 'center',
            }}>
            <CustomIcon
              onPress={() => setAcitveUi(0)}
              Icon={ICONS.BackArrow}
              height={16}
              width={16}
            />
            <CustomText
              fontFamily="italicBold"
              color={COLORS.yellow}
              fontSize={20}>
              Membership Benefits
            </CustomText>
          </View>

          <View style={{gap: verticalScale(20)}}>
            <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
              <CustomIcon Icon={ICONS.Membership1Icon} height={22} width={22} />
              <View style={{flex: 1}}>
                <CustomText
                  fontFamily="italicBold"
                  color={COLORS.yellow}
                  fontSize={14}>
                  Access to all programs
                </CustomText>
                <CustomText
                  color={COLORS.whiteTail}
                  fontSize={11}
                  fontFamily="medium">
                  Gain unlimited access to all workout and nutrition programs,
                  tailored to your goals.
                </CustomText>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
              <CustomIcon Icon={ICONS.Membership2Icon} height={22} width={22} />
              <View style={{flex: 1}}>
                <CustomText
                  fontFamily="italicBold"
                  color={COLORS.yellow}
                  fontSize={14}>
                  AI Driven insight
                </CustomText>
                <CustomText
                  color={COLORS.whiteTail}
                  fontSize={11}
                  fontFamily="medium">
                  Track progress smarter with AI-driven insights—review detailed
                  summaries of past workouts to fine-tune your performance and
                  reach your fitness goals faster.
                </CustomText>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
              <CustomIcon Icon={ICONS.Membershi3Icon} height={22} width={22} />
              <View style={{flex: 1}}>
                <CustomText
                  fontFamily="italicBold"
                  color={COLORS.yellow}
                  fontSize={14}>
                  Expert Guidance
                </CustomText>
                <CustomText
                  color={COLORS.whiteTail}
                  fontSize={11}
                  fontFamily="medium">
                  Get expert guidance on demand—receive personalized feedback
                  from real trainers and ask questions to enhance your workout
                  experience anytime.
                </CustomText>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
              <CustomIcon Icon={ICONS.Membershi4Icon} height={22} width={22} />
              <View style={{flex: 1}}>
                <CustomText
                  fontFamily="italicBold"
                  color={COLORS.yellow}
                  fontSize={14}>
                  Advanced Meteric
                </CustomText>
                <CustomText
                  color={COLORS.whiteTail}
                  fontSize={11}
                  fontFamily="medium">
                  Elevate your progress with in-depth metrics and detailed
                  statistics, helping you analyze and optimize every aspect of
                  your training.
                </CustomText>
              </View>
            </View>
          </View>

          <View
            style={{
              gap: verticalScale(10),
              paddingHorizontal: horizontalScale(20),
              marginVertical: verticalScale(20),
            }}>
            <CustomText
              fontSize={12}
              fontFamily="bold"
              style={{textAlign: 'center'}}>
              Cancel Anytime * Recurring Billing
            </CustomText>
            <CustomText
              fontSize={11}
              fontFamily="medium"
              style={{textAlign: 'center'}}>
              Your Google Play or iTunes account will be charged, and the
              membership will renew automatically. You can cancel at least 24
              hours before the end of the billing period to prevent renewal.
            </CustomText>
          </View>

          <View style={{paddingHorizontal: horizontalScale(40)}}>
            <CustomText
              fontSize={12}
              fontFamily="medium"
              style={{textAlign: 'center'}}>
              You acknowledge and accept GymLogix's{' '}
              <CustomText
                fontSize={12}
                fontFamily="medium"
                color={COLORS.yellow}>
                privacy policy
              </CustomText>{' '}
              and{' '}
              <CustomText
                fontSize={12}
                fontFamily="medium"
                color={COLORS.yellow}>
                Terms & Conditions
              </CustomText>
            </CustomText>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: horizontalScale(20),
            paddingVertical: verticalScale(20),
            alignSelf: 'center',
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            width: '95%',
            borderRadius: 10,
          }}>
          <CustomText
            style={{textAlign: 'center'}}
            fontFamily="bold"
            fontSize={12}>
            Join Now to access all beinfits
          </CustomText>
          {isLoading ? (
            <ActivityIndicator size={10} color={COLORS.crimson} />
          ) : subscriptionsList && subscriptionsList.length > 0 ? (
            subscriptionsList.map((plan: ProductSubscription) => {
              const offerDetails = plan.subscriptionOfferDetailsAndroid?.[0];
              const offerToken = offerDetails?.offerToken || null;

              const {mainPrice, introductoryPrice, introductoryPeriod} =
                getPriceDetails(plan);

              const getPlanType = () => {
                if (mainPrice.includes('₹1,100.00')) {
                  return 'Monthly';
                }

                if (mainPrice.includes('₹10,800.00')) {
                  return 'Yearly';
                }

                return '';
              };

              // DYNAMIC FEATURES: Create feature list
              // let planFeatures = [...STATIC_PLAN_FEATURES];

              if (
                introductoryPrice &&
                introductoryPeriod &&
                (introductoryPrice === 'Free' ||
                  introductoryPrice === '0' ||
                  introductoryPrice === '$0.00') // Check for "Free" (Android) or "$0.00" (iOS)
              ) {
                let formattedPeriod;

                // Format the period for display (Handle RNIap's specific formats)
                if (Platform.OS === 'android') {
                  formattedPeriod =
                    introductoryPeriod === 'P1W'
                      ? '1 Week'
                      : introductoryPeriod;
                } else {
                  // iOS case (introductoryPeriod is usually "week", "month", etc.)
                  formattedPeriod =
                    introductoryPeriod === 'week'
                      ? '1 Week'
                      : introductoryPeriod;
                }

                // Add the trial feature to the list
                // planFeatures.unshift(`✦    ${formattedPeriod} FREE Trial!`);

                // Update the button title to emphasize the trial
                //  buttonDisplayTitle = `Start ${formattedPeriod} FREE Trial`;
              }

              const planTitle = plan.displayName || plan.title;

              const purchaseDetails = {
                productId: plan.id,
                offerToken,
                planTitle,
              };

              const isActive = isSamePlan(purchaseDetails.productId);

              return (
                <View style={{gap: verticalScale(10)}} key={plan.id}>
                  {/* Buttons */}
                  <View
                    style={{
                      borderRadius: 100,
                      flexDirection: 'row',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}>
                    {/* Continue Button */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: isActive ? '#999999' : '#D71745',
                        paddingVertical: verticalScale(10),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        if (
                          Platform.OS === 'android' &&
                          isSamePlan(purchaseDetails.productId)
                        ) {
                          Alert.alert(
                            'Already Active',
                            'This subscription is already active.',
                          );
                          return;
                        }

                        handlePlanSelect(purchaseDetails);
                        setSelectedPlanType(getPlanType().toLowerCase());
                        handleSubscription(
                          purchaseDetails.productId,
                          purchaseDetails.offerToken,
                        );
                      }}>
                      <CustomText fontSize={12} fontFamily="medium">
                        CONTINUE
                      </CustomText>
                    </TouchableOpacity>

                    {/* Price Button */}
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isActive ? '#706567' : '#941231',
                        paddingVertical: verticalScale(10),
                      }}>
                      <CustomText
                        fontSize={12}
                        fontFamily="medium"
                        style={{textAlign: 'center'}}>
                        {`${mainPrice}/${getPlanType()}`}
                      </CustomText>
                    </View>
                  </View>
                  <CustomText
                    fontSize={12}
                    fontFamily="medium"
                    style={{textAlign: 'center'}}>
                    {planTitle === 'Yearly Plan'
                      ? 'Billed Annually at this'
                      : 'Billed Monthly at this'}
                  </CustomText>
                </View>
              );
            })
          ) : (
            <CustomText color={COLORS.white} fontSize={16}>
              No plans available.
            </CustomText>
          )}

          <CustomText
            fontFamily="medium"
            color={COLORS.yellow}
            fontSize={12}
            onPress={handleManageSubscription}
            style={{textAlign: 'center'}}>
            MANAGE SUBSCRIPTIONS
          </CustomText>
          {/* <View style={{gap: verticalScale(10)}}>
            <View
              style={{
                borderRadius: 100,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#D71745',
                  paddingVertical: verticalScale(10),
                }}>
                <CustomText
                  fontSize={12}
                  fontFamily="medium"
                  style={{textAlign: 'center'}}>
                  CONTINUE
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#941231',
                  paddingVertical: verticalScale(10),
                }}>
                <CustomText
                  fontSize={12}
                  fontFamily="medium"
                  style={{textAlign: 'center'}}>
                  29.99$/mo
                </CustomText>
              </TouchableOpacity>
            </View>
            <CustomText
              fontSize={12}
              fontFamily="medium"
              style={{textAlign: 'center'}}>
              Billed annually at 202%/year
            </CustomText>
          </View>
          <View style={{gap: verticalScale(10)}}>
            <View
              style={{
                borderRadius: 100,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#999999',
                  paddingVertical: verticalScale(10),
                }}>
                <CustomText
                  fontSize={12}
                  fontFamily="medium"
                  style={{textAlign: 'center'}}>
                  CONTINUE
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#706567',
                  paddingVertical: verticalScale(10),
                }}>
                <CustomText
                  fontSize={12}
                  fontFamily="medium"
                  style={{textAlign: 'center'}}>
                  29.99$/mo
                </CustomText>
              </TouchableOpacity>
            </View>
            <CustomText
              fontSize={12}
              fontFamily="medium"
              style={{textAlign: 'center'}}>
              Billed Monthly
            </CustomText>
          </View> */}
        </View>
      </ScrollView>
    );
  };

  const logOut = () => {
    Alert.alert('Log out', 'Are your sure you want to log out', [
      {
        text: 'cancel',
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: async () => {
          deleteLocalStorageData(STORAGE_KEYS.token);
          await GoogleSignin.signOut();
          navigation.replace('authStack', {
            screen: 'signIn',
          });
        },
      },
    ]);
  };

  // Helper component for settings row with switch
  const SettingsRowWithSwitch = ({
    title,
    subtitle,
    value,
    onValueChange,
    icon,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon?: any;
  }) => (
    <View style={styles.settingsRow}>
      {icon && <CustomIcon Icon={icon} height={20} width={20} />}
      <View style={styles.settingsTextContainer}>
        <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
          {title}
        </CustomText>
        {subtitle && (
          <CustomText
            fontFamily="regular"
            fontSize={12}
            color={COLORS.whiteTail}>
            {subtitle}
          </CustomText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: COLORS.lightBrown, true: COLORS.yellow}}
        thumbColor={value ? COLORS.white : COLORS.whiteTail}
      />
    </View>
  );

  // Helper component for settings row with selection
  const SettingsRowWithSelection = ({
    title,
    subtitle,
    value,
    onPress,
    icon,
  }: {
    title: string;
    subtitle?: string;
    value: string;
    onPress: () => void;
    icon?: any;
  }) => (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      {icon && <CustomIcon Icon={icon} height={20} width={20} />}
      <View style={styles.settingsTextContainer}>
        <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
          {title}
        </CustomText>
        {subtitle && (
          <CustomText
            fontFamily="regular"
            fontSize={12}
            color={COLORS.whiteTail}>
            {subtitle}
          </CustomText>
        )}
      </View>
      <View style={styles.settingsValueContainer}>
        <CustomText fontFamily="medium" fontSize={14} color={COLORS.yellow}>
          {value}
        </CustomText>
        <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
      </View>
    </TouchableOpacity>
  );

  const renderSoundUI = () => {
    return (
      <View style={styles.expandedContainer}>
        {/* Volume Level Slider */}
        <View style={styles.settingsRow}>
          <CustomIcon Icon={ICONS.NotificationIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Volume Level
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              {volumeLevel}%
            </CustomText>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.customSlider}>
              <View style={[styles.sliderTrack, {width: '100%'}]} />
              <View style={[styles.sliderFill, {width: `${volumeLevel}%`}]} />
              <TouchableOpacity
                style={[
                  styles.sliderThumb,
                  {left: `${Math.max(0, Math.min(92, volumeLevel))}%`},
                ]}
                onPress={() => {
                  // Cycle through volume levels
                  const levels = [0, 25, 50, 75, 100];
                  const currentIndex = levels.findIndex(
                    level => level >= volumeLevel,
                  );
                  const nextIndex = (currentIndex + 1) % levels.length;
                  setVolumeLevel(levels[nextIndex]);
                }}
              />
            </View>
            {/* Volume level buttons */}
            <View style={styles.volumeButtons}>
              <TouchableOpacity
                onPress={() => setVolumeLevel(Math.max(0, volumeLevel - 10))}>
                <CustomText fontSize={12} color={COLORS.yellow}>
                  -
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setVolumeLevel(Math.min(100, volumeLevel + 10))}>
                <CustomText fontSize={12} color={COLORS.yellow}>
                  +
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <SettingsRowWithSwitch
          title="Enable Notifications"
          subtitle="Receive workout reminders and updates"
          value={enableNotifications}
          onValueChange={setEnableNotifications}
          icon={ICONS.NotificationIcon}
        />

        <SettingsRowWithSwitch
          title="Enable Reminders"
          subtitle="Get reminded about scheduled workouts"
          value={enableReminders}
          onValueChange={setEnableReminders}
          icon={ICONS.CalendarWithDumbellIcon}
        />
      </View>
    );
  };

  const renderGeneralUI = () => {
    return (
      <View style={styles.expandedContainer}>
        <SettingsRowWithSelection
          title="Language"
          subtitle="Choose your preferred language"
          value={selectedLanguage}
          onPress={() => {
            Alert.alert('Language', 'Choose your preferred language', [
              {
                text: 'English',
                onPress: () => setSelectedLanguage('English'),
              },
              {
                text: 'Español',
                onPress: () => setSelectedLanguage('Español'),
              },
              {
                text: 'Français',
                onPress: () => setSelectedLanguage('Français'),
              },
              {text: 'Cancel', style: 'cancel'},
            ]);
          }}
          icon={ICONS.GeneralIcon}
        />

        <SettingsRowWithSelection
          title="System Units"
          subtitle="Weight and distance measurement units"
          value={selectedUnits}
          onPress={() => {
            Alert.alert('Unit System', 'Choose your preferred unit system', [
              {
                text: 'Metric (kg/km)',
                onPress: () => setSelectedUnits('Metric'),
              },
              {
                text: 'Imperial (lb/mi)',
                onPress: () => setSelectedUnits('Imperial'),
              },
              {text: 'Cancel', style: 'cancel'},
            ]);
          }}
          icon={ICONS.GeneralIcon}
        />
        <SettingsRowWithSwitch
          title="Prevent Screen Lock"
          subtitle="Keep screen on during workouts"
          value={preventScreenLock}
          onValueChange={setPreventScreenLock}
          icon={ICONS.GeneralIcon}
        />
      </View>
    );
  };

  const renderWorkoutUI = () => {
    return (
      <View style={styles.expandedContainer}>
        <SettingsRowWithSelection
          title="RM Formula"
          subtitle="Choose your preferred 1RM calculation formula"
          value={selectedRMFormula}
          onPress={() => {
            Alert.alert(
              'RM Formula',
              'Choose your preferred 1RM calculation formula',
              [
                {
                  text: 'Epley Formula',
                  onPress: () => setSelectedRMFormula('Epley Formula'),
                },
                {
                  text: 'Brzycki Formula',
                  onPress: () => setSelectedRMFormula('Brzycki Formula'),
                },
                {
                  text: 'Lombardi Formula',
                  onPress: () => setSelectedRMFormula('Lombardi Formula'),
                },
                {
                  text: "O'Connor Formula",
                  onPress: () => setSelectedRMFormula("O'Connor Formula"),
                },
                {text: 'Cancel', style: 'cancel'},
              ],
            );
          }}
          icon={ICONS.WorkoutIcon}
        />

        <SettingsRowWithSwitch
          title="Update body weight from measurements"
          subtitle="Automatically update body weight from measurement data"
          value={updateBodyWeightFromMeasurements}
          onValueChange={setUpdateBodyWeightFromMeasurements}
          icon={ICONS.WorkoutIcon}
        />
      </View>
    );
  };

  const renderDataUI = () => {
    return (
      <View style={styles.expandedContainer}>
        <CustomText
          fontFamily="bold"
          fontSize={18}
          color={COLORS.yellow}
          style={styles.sectionTitle}>
          Data Management
        </CustomText>

        <SettingsRowWithSwitch
          title="Sync to Cloud"
          subtitle="Automatically sync data to cloud storage"
          value={syncToCloud}
          onValueChange={setSyncToCloud}
          icon={ICONS.DataIcon}
        />

        <SettingsRowWithSelection
          title="Data Retention Period"
          subtitle="How long to keep workout history"
          value={dataRetentionPeriod}
          onPress={() => {
            Alert.alert('Data Retention', 'Choose how long to keep your data', [
              {
                text: '6 Months',
                onPress: () => setDataRetentionPeriod('6 Months'),
              },
              {
                text: '1 Year',
                onPress: () => setDataRetentionPeriod('1 Year'),
              },
              {
                text: '2 Years',
                onPress: () => setDataRetentionPeriod('2 Years'),
              },
              {
                text: 'Forever',
                onPress: () => setDataRetentionPeriod('Forever'),
              },
              {text: 'Cancel', style: 'cancel'},
            ]);
          }}
          icon={ICONS.DataIcon}
        />

        <SettingsRowWithSwitch
          title="Share Analytics"
          subtitle="Help improve the app by sharing usage data"
          value={shareAnalytics}
          onValueChange={setShareAnalytics}
          icon={ICONS.DataIcon}
        />

        {/* Export Options */}
        <View style={styles.settingsRow}>
          <CustomIcon Icon={ICONS.DataIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Export Data
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Export your data to external files
            </CustomText>
          </View>
        </View>

        {/* Export Buttons */}
        <View
          style={{gap: verticalScale(10), paddingLeft: horizontalScale(35)}}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() =>
              Alert.alert('Export', 'Exporting all workout data...')
            }>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Export Workouts
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() =>
              Alert.alert('Export', 'Exporting training plans...')
            }>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Export Plans
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => Alert.alert('Export', 'Exporting meal data...')}>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Export Meals
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => Alert.alert('Export', 'Exporting notes...')}>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Export Notes
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => Alert.alert('Export', 'Exporting measurements...')}>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Export Measurements
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, {backgroundColor: COLORS.yellow}]}
            onPress={() =>
              Alert.alert('Export', 'Exporting complete data file...')
            }>
            <CustomText
              fontFamily="bold"
              fontSize={14}
              color={COLORS.darkBrown}>
              Export All Data
            </CustomText>
            <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHelpUI = () => {
    return (
      <View style={styles.expandedContainer}>
        <CustomText
          fontFamily="bold"
          fontSize={18}
          color={COLORS.yellow}
          style={styles.sectionTitle}>
          Help & Support
        </CustomText>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() =>
            Alert.alert(
              'FAQ',
              'Frequently Asked Questions will be displayed here',
            )
          }>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              FAQ
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Frequently asked questions
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Contact', 'Contact support team')}>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Contact Support
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Get help from our support team
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Feedback', 'Send us your feedback')}>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Send Feedback
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Help us improve the app
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Tutorial', 'App tutorial will start')}>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              App Tutorial
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Learn how to use the app
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Terms', 'Terms and conditions')}>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Terms & Conditions
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Read our terms and conditions
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Privacy', 'Privacy policy')}>
          <CustomIcon Icon={ICONS.HelpIcon} height={20} width={20} />
          <View style={styles.settingsTextContainer}>
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.white}>
              Privacy Policy
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.whiteTail}>
              Read our privacy policy
            </CustomText>
          </View>
          <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View
          style={{
            width: '100%',
            paddingVertical: verticalScale(20),
            gap: verticalScale(10),
          }}>
          <View
            style={{
              width: '100%',
              paddingHorizontal: horizontalScale(20),
              flexDirection: 'row',
              alignItems: 'center',
              gap: horizontalScale(10),
            }}>
            <Image
              source={IMAGES.profileDummy}
              style={{
                height: verticalScale(66),
                width: verticalScale(66),
                resizeMode: 'contain',
              }}
            />
            <View style={{flex: 1}}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  gap: horizontalScale(10),
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <CustomText fontFamily="bold">{`${userData?.first_name} ${userData?.last_name}`}</CustomText>
                  <CustomText fontFamily="medium" fontSize={14}>
                    {userData?.email}
                  </CustomText>
                </View>

                <CustomIcon Icon={ICONS.dummyQr} />
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(10),
                  justifyContent: 'space-between',
                  marginTop: verticalScale(10),
                }}>
                <CustomText fontFamily="medium" fontSize={12}>
                  ID: {userData?.user_id}
                </CustomText>
                <CustomIcon
                  Icon={ICONS.RightArrowIcon}
                  width={12}
                  height={20}
                />
              </View>
            </View>
          </View>
        </View>

        {acitveUi === 0 && (
          <ScrollView
            contentContainerStyle={{
              width: wp(100),
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: COLORS.brown,
              paddingHorizontal: horizontalScale(10),
              alignSelf: 'center',
            }}
            style={{flex: 1, marginBottom: verticalScale(5)}}>
            <TouchableOpacity
              onPress={() => setAcitveUi(1)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.MembershipIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Membership
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setExpandedSoundUI(!expandedSoundUI)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon
                Icon={ICONS.NotificationIcon}
                height={24}
                width={24}
              />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Sound & notification
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>
            {expandedSoundUI && renderSoundUI()}
            <TouchableOpacity
              onPress={() => setExpandedGeneralUI(!expandedGeneralUI)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.GeneralIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                General
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>
            {expandedGeneralUI && renderGeneralUI()}
            <TouchableOpacity
              onPress={() => setExpandedWorkoutUI(!expandedWorkoutUI)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.WorkoutIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Workout
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>

            {expandedWorkoutUI && renderWorkoutUI()}
            <TouchableOpacity
              onPress={logOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.WorkoutIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Log out
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(40),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}
            />
            <TouchableOpacity
              onPress={() => setExpandedDataUI(!expandedDataUI)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.DataIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Data
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>
            {expandedDataUI && renderDataUI()}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.lightBrown,
              }}>
              <CustomIcon Icon={ICONS.HelpIcon} height={24} width={24} />
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                Help & Suggestions
              </CustomText>
              <CustomIcon Icon={ICONS.RightArrowIcon} height={12} width={20} />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
                paddingVertical: verticalScale(30),
              }}>
              <CustomText fontFamily="medium" fontSize={18} style={{flex: 1}}>
                About
              </CustomText>
              <CustomText fontFamily="medium" fontSize={18} style={{}}>
                1.0.1
              </CustomText>
            </View>
          </ScrollView>
        )}
        {acitveUi === 1 && rendermemberShipData()}
      </SafeAreaView>
    </View>
  );
};

export default SETTINGS;

const styles = StyleSheet.create({
  main: {backgroundColor: '#1C1816', flex: 1},
  safeArea: {
    flex: 1,
  },
  expandedContainer: {
    gap: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    backgroundColor: COLORS.brown,
    width: '95%',
    borderRadius: 10,
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    marginBottom: verticalScale(10),
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBrown,
  },
  settingsTextContainer: {
    flex: 1,
    gap: verticalScale(2),
  },
  settingsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  sliderContainer: {
    width: 120,
    height: 30,
    justifyContent: 'center',
  },
  volumeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(5),
    paddingHorizontal: horizontalScale(5),
  },
  customSlider: {
    height: 4,
    position: 'relative',
    borderRadius: 2,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.lightBrown,
    borderRadius: 2,
    position: 'absolute',
  },
  sliderFill: {
    height: 4,
    backgroundColor: COLORS.yellow,
    borderRadius: 2,
    position: 'absolute',
  },
  sliderThumb: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(15),
    backgroundColor: COLORS.lightBrown,
    borderRadius: 8,
    marginVertical: verticalScale(5),
  },
  selectedOption: {
    backgroundColor: COLORS.yellow,
  },
  optionText: {
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.darkBrown,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  languageModal: {
    backgroundColor: COLORS.brown,
    borderRadius: 15,
    padding: verticalScale(20),
    width: wp(85),
    maxHeight: '80%',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(15),
    borderRadius: 8,
    marginVertical: verticalScale(3),
    backgroundColor: COLORS.lightBrown,
  },
  selectedLanguageOption: {
    backgroundColor: COLORS.yellow,
  },
  closeModalButton: {
    backgroundColor: COLORS.lightBrown,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: verticalScale(15),
  },
  restoreBtn: {
    backgroundColor: '#D71745',
    paddingVertical: verticalScale(10),
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
