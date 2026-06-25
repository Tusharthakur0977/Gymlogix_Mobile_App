import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC, useState } from "react";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { faqScreenProps } from "../../Typings/route";
import { CustomText } from "../../Components/CustomText";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";

const faqList = [
  // About Bokitta
  {
    question: "What does BOKITTA mean?",
    answer:
      "Bokitta comes from the word bouquet (Bouquet of flowers) which is full of colors and textures.",
  },
  {
    question: "Do you have a physical store?",
    answer:
      'We do have stores in: Brunei, Malaysia, Singapore. You can check "our stores" page for more information.',
  },
  {
    question: "Is there an offer for the first order?",
    answer: 'We offer 10% off your first order. Use coupon code "first10".',
  },
  {
    question: "What is your loyalty program & how to use?",
    answer: `Our reward program is based on 🌸Flowers🌸.
100 flowers = $1 discount.
You can use your flowers by pressing the "Rewards" widget on the bottom-left corner on our website page, then Ways to Redeem > "Redeem".
You’ll get a discount code at the end which you can use on the checkout page.
Then you can put the total flowers you would like to use as a discount.`,
  },
  {
    question: "How to earn flowers?",
    answer: `- Subscribe → 200 points
- Place an order → 5 points per $1 spent
- Refer a friend → $5 off
- Follow us on Facebook and Instagram → 100 points`,
  },

  // Shipping
  {
    question: "How will my order be shipped?",
    answer:
      "Bokitta ships your orders via DHL express. Once the order is shipped, you will receive a tracking number so that you may know where your items are every step of the way!",
  },
  {
    question: "When will I receive my order?",
    answer:
      "Orders placed on our website require a two working days processing time. Once the order is shipped, allow for two days if shipping locally or up to 10 days if shipping internationally.",
  },
  {
    question: "Where does Bokitta ship to?",
    answer:
      "Bokitta will ship your items anywhere around the world and deliver it directly to you. You can check our shipping page for more information.",
  },
  {
    question: "How long does it take to arrive to my country?",
    answer: `We only deliver with DHL express, it usually takes up to two days to process your order, and 2-7 days to arrive to your destination, depending on your location.
If you are located in the gulf or in Europe it could take 2 days, if you are in East Asia it could take 4-to-7 days.`,
  },
  {
    question: "COD available?",
    answer:
      "We provide COD in India and Gulf countries: KSA/ Qatar/ UAE/ Oman/ Kuwait and Bahrain.",
  },

  // About the Product
  {
    question: "How are the products selected?",
    answer:
      "Our team carefully selects the fabrics that will be used to manufacture bokitta hijabs in each stage. The prints are designed by our designers using the colors of the season and the prints in style.",
  },
  {
    question: "Can I wash/iron my hijab?",
    answer:
      "Yes, you can hand wash in cold water up to 30 degrees, and iron at low temperature. Do not bleach. Do not tumble dry.",
  },
  {
    question: "What is an Inner?",
    answer: `The inner is like a matching piece of cloth which you tie over your head to wear under the scarf to cover up your hair on your forehead and to hold the hijab well on your head.
We provide B-inner & X-inner.
The B inner is straight on the forehead, while the X inner (Cross inner) has an overlapping part that forms a V shape on the forehead.`,
  },
  {
    question:
      "What is the difference between the different styles in your shop?",
    answer: `We have nine hijab styles, in our shop:
Voilà - Chic - Carré - Freestyle - CapShawl - Jolie - Taj - Vogue - Posh.
Differ in length, coverage & design. You can see the difference between all styles in the complete hijab design style guide.`,
  },

  // Ordering
  {
    question: "How can I order? What will happen after?",
    answer: `Simply select the items you wish to purchase. Next, you will be asked to enter your payment details, shipping information and shipping method.
When your order is placed, you will receive a confirmation email with an order number.
Once the order is shipped you will receive a tracking number so that you may know your items are on their way to you!`,
  },
  {
    question: "How can I choose the right size for me?",
    answer: `We only have one size that fits all. All our instant hijabs have an elastic piece right at the chin area which stretches to fit the largest head.
You can take our quiz to see which style matches your face shape.`,
  },
  {
    question: "Can I return an item that does not fit me properly?",
    answer: `Please check the description of each product before purchase. Some provide headbands or elastic bands instead of a Bokitta Magic!Inner.
If you receive the item and you wish to return it, Bokitta will accept returns for unworn items within 7 days from the date you receive your package.

For further information, please visit the Shipping And Returns section.`,
  },
  {
    question: "What happens if I forget my password information?",
    answer: `If you forget your password, simply click on the “Forgot your password?” link on the Sign In page and fill out the short form.
You will receive an email telling you how to retrieve your password.`,
  },

  // Privacy and Security
  {
    question: "What forms of payment do you accept?",
    answer:
      "We currently accept Visa and MasterCard for all orders. Please keep in mind, that if purchasing with an International Credit Card, your order may take up to 72 hours to process prior to shipping.",
  },
  {
    question: "How do I know my credit card is secure?",
    answer:
      "With Bokitta, the safety of our customers is primordial. We have devoted our time and efforts to ensure all transactions are 100% secure. Bokitta processes your credit card through TAP and Fasterpay gateway where the transaction is made. Your credit card information will not be stored with us.",
  },
  {
    question: "What information do we collect?",
    answer:
      "We collect information from you when you register on our site or place an order. When ordering or registering on our site, as appropriate, you may be asked to enter your name, e-mail address, mailing address, phone number or credit card information.",
  },
  {
    question: "Order Inquiries?",
    answer:
      "Let us know if you have a question about any aspect of your order. We would be glad to help you.\ncare@bokitta.com",
  },
  {
    question: "Feedback and Suggestions",
    answer:
      "We are constantly working on improving the website to make it a more enjoyable experience. Please give us your feedback, it is always appreciated and taken into consideration.\ninfo@bokitta.com",
  },
  {
    question: "Product Advice",
    answer:
      "Need some styling advice to impress? Need help choosing the perfect gift?\ncare@bokitta.com",
  },
];

const FaqScreen: FC<faqScreenProps> = ({ navigation }) => {
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (item: string): void => {
    setExpandedItems((prev) => {
      const isCurrentlyExpanded = prev[item];
      return isCurrentlyExpanded ? {} : { [item]: true };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomIcon
          Icon={ICONS.BackArrowIcon}
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <CustomText
          fontFamily="medium"
          fontSize={16}
          color={COLORS.black}
          style={{ flex: 1, textAlign: "center" }}
        >
          FAQ
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionsWrapper}>
          <CustomText fontSize={18} color={COLORS.black} fontFamily="bold">
            About Bokitta
          </CustomText>

          <View style={styles.questionAnswerContainer}>
            {faqList.slice(0, 5).map((item, index) => (
              <View key={index} style={{ gap: verticalScale(10) }}>
                <TouchableOpacity
                  onPress={() => toggleDropdown(item.question)}
                  style={styles.questionIcon}
                >
                  <CustomText
                    fontFamily="medium"
                    color={COLORS.black}
                    fontSize={14}
                    style={{ width: "80%" }}
                  >
                    {item.question}
                  </CustomText>
                  <CustomIcon
                    Icon={
                      expandedItems[item.question]
                        ? ICONS.DropUpIcon
                        : ICONS.DropDownIcon
                    }
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
                {expandedItems[item.question] && (
                  <CustomText
                    fontFamily="regular"
                    color={COLORS.Grey}
                    fontSize={12}
                  >
                    {item.answer}
                  </CustomText>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.questionsWrapper}>
          <CustomText fontSize={18} color={COLORS.black} fontFamily="bold">
            Shipping
          </CustomText>

          <View style={styles.questionAnswerContainer}>
            {faqList.slice(5, 10).map((item, index) => (
              <View key={index} style={{ gap: verticalScale(10) }}>
                <TouchableOpacity
                  onPress={() => toggleDropdown(item.question)}
                  style={styles.questionIcon}
                >
                  <CustomText
                    fontFamily="medium"
                    color={COLORS.black}
                    fontSize={14}
                    style={{ width: "80%" }}
                  >
                    {item.question}
                  </CustomText>
                  <CustomIcon
                    Icon={
                      expandedItems[item.question]
                        ? ICONS.DropUpIcon
                        : ICONS.DropDownIcon
                    }
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
                {expandedItems[item.question] && (
                  <CustomText
                    fontFamily="regular"
                    color={COLORS.Grey}
                    fontSize={12}
                  >
                    {item.answer}
                  </CustomText>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.questionsWrapper}>
          <CustomText fontSize={18} color={COLORS.black} fontFamily="bold">
            About the Product
          </CustomText>

          <View style={styles.questionAnswerContainer}>
            {faqList.slice(10, 14).map((item, index) => (
              <View key={index} style={{ gap: verticalScale(10) }}>
                <TouchableOpacity
                  onPress={() => toggleDropdown(item.question)}
                  style={styles.questionIcon}
                >
                  <CustomText
                    fontFamily="medium"
                    color={COLORS.black}
                    fontSize={14}
                    style={{ width: "80%" }}
                  >
                    {item.question}
                  </CustomText>
                  <CustomIcon
                    Icon={
                      expandedItems[item.question]
                        ? ICONS.DropUpIcon
                        : ICONS.DropDownIcon
                    }
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
                {expandedItems[item.question] && (
                  <CustomText
                    fontFamily="regular"
                    color={COLORS.Grey}
                    fontSize={12}
                  >
                    {item.answer}
                  </CustomText>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.questionsWrapper}>
          <CustomText fontSize={18} color={COLORS.black} fontFamily="bold">
            Ordering
          </CustomText>

          <View style={styles.questionAnswerContainer}>
            {faqList.slice(14, 18).map((item, index) => (
              <View key={index} style={{ gap: verticalScale(10) }}>
                <TouchableOpacity
                  onPress={() => toggleDropdown(item.question)}
                  style={styles.questionIcon}
                >
                  <CustomText
                    fontFamily="medium"
                    color={COLORS.black}
                    fontSize={14}
                    style={{ width: "80%" }}
                  >
                    {item.question}
                  </CustomText>

                  <CustomIcon
                    Icon={
                      expandedItems[item.question]
                        ? ICONS.DropUpIcon
                        : ICONS.DropDownIcon
                    }
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
                {expandedItems[item.question] && (
                  <CustomText
                    fontFamily="regular"
                    color={COLORS.Grey}
                    fontSize={12}
                  >
                    {item.answer}
                  </CustomText>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.questionsWrapper}>
          <CustomText fontSize={18} color={COLORS.black} fontFamily="bold">
            Privacy and Security
          </CustomText>

          <View style={styles.questionAnswerContainer}>
            {faqList.slice(18, 25).map((item, index) => (
              <View key={index} style={{ gap: verticalScale(10) }}>
                <TouchableOpacity
                  onPress={() => toggleDropdown(item.question)}
                  style={styles.questionIcon}
                >
                  <CustomText
                    fontFamily="medium"
                    color={COLORS.black}
                    fontSize={14}
                    style={{ width: "80%" }}
                  >
                    {item.question}
                  </CustomText>
                  <CustomIcon
                    Icon={
                      expandedItems[item.question]
                        ? ICONS.DropUpIcon
                        : ICONS.DropDownIcon
                    }
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
                {expandedItems[item.question] && (
                  <CustomText
                    fontFamily="regular"
                    color={COLORS.Grey}
                    fontSize={12}
                  >
                    {item.answer}
                  </CustomText>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaqScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(10),
  },
  content: {
    flex: 1,
    padding: horizontalScale(20),
  },
  questionsWrapper: {
    gap: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  questionAnswerContainer: {
    gap: verticalScale(15),
  },
  IconContainer: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(3),
    paddingVertical: verticalScale(4),
    borderColor: COLORS.MediumGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  questionIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
    justifyContent: "space-between",
  },
});
