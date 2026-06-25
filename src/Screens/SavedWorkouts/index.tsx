import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomText} from '../../Components/CustomText';
import CustomIcon from '../../Components/CustomIcon';
import PrimaryButton from '../../Components/PrimaryButton';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {
  selectFilteredAndSortedWorkouts,
  selectWorkoutStats,
  deleteWorkout,
  setActiveWorkout,
  clearActiveWorkout,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  SavedWorkout,
} from '../../Redux/slices/savedWorkoutsSlice';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale, wp, hp} from '../../Utilities/Metrics';
import ICONS from '../../Assets/Icons';
import {SavedWorkoutsScreenProps} from '../../Typings/route';
import {
  resetNewWorkoutSlice,
  setActiveStep,
} from '../../Redux/slices/newWorkoutSlice';

const SavedWorkouts: React.FC<SavedWorkoutsScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const workouts = useAppSelector(selectFilteredAndSortedWorkouts);
  const stats = useAppSelector(selectWorkoutStats);
  const {searchQuery, sortBy, sortOrder} = useAppSelector(
    state => state.savedWorkouts,
  );

  const [showSortOptions, setShowSortOptions] = useState(false);

  // Add a header with back button
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'My Workouts',
      headerStyle: {
        backgroundColor: COLORS.darkBrown,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        color: COLORS.yellow,
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  const handleDeleteWorkout = (workoutId: string, workoutName: string) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workoutName}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteWorkout(workoutId)),
        },
      ],
    );
  };

  const handleSetActiveWorkout = (workoutId: string) => {
    dispatch(setActiveWorkout(workoutId));
    Alert.alert('Success', 'Workout set as active!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderWorkoutCard = ({item}: {item: SavedWorkout}) => (
    <View style={styles.workoutCard}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              item.coverImage?.uri ||
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
          }}
          style={styles.workoutImage}
        />
        <View style={styles.workoutInfo}>
          <View style={styles.workoutTitleRow}>
            <CustomText
              color={COLORS.yellow}
              fontFamily="bold"
              fontSize={16}
              numberOfLines={1}>
              {item.name}
            </CustomText>
            {item.isActive && (
              <View style={styles.activeBadge}>
                <CustomText color={COLORS.white} fontSize={10}>
                  ACTIVE
                </CustomText>
              </View>
            )}
          </View>
          <CustomText
            color={COLORS.nickel}
            fontSize={12}
            numberOfLines={2}
            style={styles.description}>
            {item.description}
          </CustomText>
          <View style={styles.workoutMeta}>
            <CustomText color={COLORS.nickel} fontSize={10}>
              {item.daysInWeek} days • {item.durationInWeeks} weeks
            </CustomText>
            <CustomText color={COLORS.nickel} fontSize={10}>
              {item.completedSessions} sessions completed
            </CustomText>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.activeButton]}
          onPress={() => handleSetActiveWorkout(item.id)}
          disabled={item.isActive}>
          <CustomIcon Icon={ICONS.DumbellWhiteIcon} height={16} width={16} />
          <CustomText fontSize={12}>
            {item.isActive ? 'Active' : 'Set Active'}
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            // TODO: Navigate to edit workout
          }}>
          <CustomIcon Icon={ICONS.EditIcon} height={16} width={16} />
          <CustomText fontSize={12}>Edit</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteWorkout(item.id, item.name)}>
          <CustomIcon Icon={ICONS.DeleteIcon} height={16} width={16} />
          <CustomText fontSize={12}>Delete</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <CustomText color={COLORS.nickel} fontSize={10}>
          Created: {formatDate(item.createdAt)}
        </CustomText>
        {item.rating && (
          <View style={styles.rating}>
            <CustomText color={COLORS.yellow} fontSize={10}>
              ⭐ {item.rating}/5
            </CustomText>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CustomIcon Icon={ICONS.DumbellWhiteIcon} height={80} width={80} />
      <CustomText
        color={COLORS.nickel}
        fontFamily="medium"
        fontSize={18}
        style={styles.emptyTitle}>
        No Workouts Yet
      </CustomText>
      <CustomText
        color={COLORS.nickel}
        fontSize={14}
        style={styles.emptyDescription}>
        Create your first workout to get started with your fitness journey!
      </CustomText>
      <PrimaryButton
        title="Create Workout"
        onPress={() => {
          // Reset the new workout slice and navigate to create workout
          dispatch(resetNewWorkoutSlice());
          dispatch(setActiveStep(1));
          navigation.navigate('addNewWorkout');
        }}
        style={styles.createButton}
      />
    </View>
  );

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <CustomText
        color={COLORS.yellow}
        fontFamily="bold"
        fontSize={20}
        style={styles.title}>
        My Workouts
      </CustomText>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <CustomText color={COLORS.yellow} fontFamily="bold" fontSize={16}>
            {stats.totalWorkouts}
          </CustomText>
          <CustomText color={COLORS.nickel} fontSize={12}>
            Total
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText color={COLORS.green} fontFamily="bold" fontSize={16}>
            {stats.activeWorkouts}
          </CustomText>
          <CustomText color={COLORS.nickel} fontSize={12}>
            Active
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText color={COLORS.blue} fontFamily="bold" fontSize={16}>
            {stats.totalCompletedSessions}
          </CustomText>
          <CustomText color={COLORS.nickel} fontSize={12}>
            Sessions
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText color={COLORS.orange} fontFamily="bold" fontSize={16}>
            {stats.averageRating.toFixed(1)}
          </CustomText>
          <CustomText color={COLORS.nickel} fontSize={12}>
            Avg Rating
          </CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderStatsHeader()}

      {workouts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  statsContainer: {
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.whiteTail,
  },
  title: {
    marginBottom: verticalScale(15),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  listContainer: {
    padding: horizontalScale(20),
  },
  workoutCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: horizontalScale(15),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(15),
  },
  workoutImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 8,
    marginRight: horizontalScale(15),
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(5),
  },
  activeBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: 10,
  },
  description: {
    marginBottom: verticalScale(8),
  },
  workoutMeta: {
    gap: verticalScale(2),
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    borderRadius: 8,
    marginHorizontal: horizontalScale(2),
    gap: horizontalScale(5),
  },
  activeButton: {
    backgroundColor: COLORS.green,
  },
  editButton: {
    backgroundColor: COLORS.blue,
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(40),
  },
  emptyTitle: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },
  createButton: {
    width: wp(60),
  },
});

export default SavedWorkouts;
