import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomText} from '../../Components/CustomText';
import COLORS from '../../Utilities/Colors';
import {verticalScale} from '../../Utilities/Metrics';
import RenderHTML from 'react-native-render-html';
import {useAppSelector} from '../../Redux/store';

const INSIGHT = () => {
  const {width} = useWindowDimensions();
  const {insightData} = useAppSelector(state => state.insightData);

  // Track expanded state for each accordion with an object
  const [expandedAccordions, setExpandedAccordions] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const stripHtmlWrapper = (htmlString: string) => {
    // This will remove <html>, <head>, or <body> wrapper if present
    let clean = htmlString;
    if (htmlString.includes('<body>')) {
      const bodyOnly = htmlString.split('<body>')[1]?.split('</body>')[0] || '';
      clean = bodyOnly;
    }
    return clean;
  };

  const htmlStyles = {
    body: {
      backgroundColor: COLORS.brown,
      color: COLORS.whiteTail,
    },
    h1: {
      color: COLORS.white,
      fontFamily: 'extraBold',
    },
    h2: {
      color: COLORS.yellow,
      fontFamily: 'extraBold',
    },
    table: {
      borderColor: COLORS.yellow,
    },
    th: {
      color: COLORS.yellow,
      borderBottomColor: COLORS.yellow,
    },
    td: {
      color: COLORS.yellow,
      borderBottomColor: COLORS.yellow,
    },
    h3: {
      color: COLORS.yellow,
    },
    span: {
      color: COLORS.yellow,
      fontStyle: 'italic',
      fontFamily: 'italic',
    },
    // ...etc
  };

  const getWorkoutName = (html: string) => {
    try {
      const match = html.match(/Workout Name<\/th>\s*<td[^>]*>(.*?)<\/td>/);
      return match ? match[1] : 'Insight';
    } catch (e) {
      return 'Insight';
    }
  };

  const stripInlineStyles = (html: string) => {
    // remove all style="..."
    return html.replace(/style="[^"]*"/g, '');
  };

  const renderAccordion = (id: string, html: string, title: string) => {
    return (
      <View
        key={id}
        style={{
          backgroundColor: COLORS.brown,
          paddingVertical: verticalScale(15),
          paddingHorizontal: verticalScale(15),
          borderRadius: 10,
          marginBottom: verticalScale(10),
        }}>
        <TouchableOpacity
          onPress={() => toggleAccordion(id)}
          style={styles.btnContainer}>
          {!expandedAccordions[id] && (
            <CustomText fontFamily="extraBold" fontSize={20}>
              {title}
            </CustomText>
          )}
          <CustomText fontFamily="extraBold" fontSize={20}>
            {expandedAccordions[id] ? '-' : '+'}{' '}
          </CustomText>
        </TouchableOpacity>

        {expandedAccordions[id] && (
          <View
            style={{
              marginTop: verticalScale(10),
            }}>
            <RenderHTML
              contentWidth={width}
              source={{html: stripInlineStyles(stripHtmlWrapper(html))}}
              tagsStyles={htmlStyles}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={{gap: verticalScale(10)}}>
          {insightData && insightData.length > 0 ? (
            insightData.map((insight: any) => {
              const title = getWorkoutName(insight.html);
              return renderAccordion(
                insight.insight_id.toString(),
                insight.html,
                title,
              );
            })
          ) : (
            <CustomText
              style={styles.NoInsight}
              fontSize={16}
              fontFamily="bold"
              color={COLORS.yellow}>
              No Insights Available
            </CustomText>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default INSIGHT;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: verticalScale(20),
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  NoInsight: {
    flex: 1,
    textAlign: 'center',
  },
});
