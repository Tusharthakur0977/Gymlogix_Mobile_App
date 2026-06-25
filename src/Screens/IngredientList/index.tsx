import React, {FC, memo, useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import ContextMenu from '../../Components/Modals/ContextMenu';
import UploadImageOptions from '../../Components/Modals/UploadImageOptions';
import PrimaryButton from '../../Components/PrimaryButton';
import {addnewIngredient} from '../../Redux/slices/ingredientSlice';
import {addIngredientsToMeal} from '../../Redux/slices/myMealsSlice';
import {setIngredient} from '../../Redux/slices/newMealSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {IngredientItem} from '../../Seeds/MealPlansData';
import {IngredientScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import {CapturedPhoto} from '../AddNewMeal';
import {postData, postFormData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import {
  getLocalStorageData,
  storeLocalStorageData,
} from '../../Utilities/Storage';
import STORAGE_KEYS from '../../Utilities/Constants';
import {showCustomToast} from '../../Utilities/Helpers';
import {setQuickMeals, setSource} from '../../Redux/slices/QuickMeals';

const tabData = [
  {label: 'Category', value: 1},
  {label: 'History', value: 2},
  {label: 'List', value: 3},
];

// Define the type for selected ingredients with quantity
export interface SelectedIngredientWithQuantity {
  id: string;
  quantity: number; // Changed to number for easier arithmetic operations
}

const IngredientList: FC<IngredientScreenProps> = ({navigation, route}) => {
  const dispatch = useAppDispatch();
  const {isFrom, mealId} = route.params;
  const [searchedWord, setSearchedWord] = useState('');

  const [showAddNewIngredientUI, setShowAddNewIngredientUI] = useState(false);
  const {ingreidnetList: Ingredients} = useAppSelector(
    state => state.ingredients,
  );

  const [activeTab, setActiveTab] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredientWithQuantity[]
  >([]); // Updated state type
  const [filteredIngredients, setFilteredIngredients] =
    useState<IngredientItem[]>(Ingredients);

  // Add new Ingredient States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [image, setImage] = useState<CapturedPhoto | null>(null);
  const [isUploadImageOptionModal, setIsUploadImageOptionModal] =
    useState(false);

  const [currentImageType, setCurrentImageType] = useState<
    'cover' | 'ingredient'
  >('cover');

  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);

  const [fileData, setFileData] = useState<string | null>(null);

  const [showServingMeasurementType, setShowServingMeasurementType] =
    useState(false);
  const [serving, setServing] = useState('');
  const [selectedServingMeasurement, setSelectedServingMeasurement] =
    useState('g');
  const [measurementTypePosition, setMeasurementTypePosition] = useState({
    top: 0,
    right: 0,
  });

  const [errors, setErrors] = useState({
    title: '',
    fileData: '',
    serving: '',
    calories: '',
    fat: '',
    carbs: '',
    protein: '',
    description: '',
  });

  // Search functionality
  const handleSearch = useCallback(
    (text: string) => {
      setSearchedWord(text);
      if (text.trim() === '') {
        setFilteredIngredients(Ingredients);
      } else {
        const filtered = Ingredients.filter(ingredient =>
          ingredient.title.toLowerCase().includes(text.toLowerCase()),
        );
        setFilteredIngredients(filtered);
      }
    },
    [Ingredients],
  ); // Added Ingredients to dependency array

  // Selection functionality
  const toggleIngredientSelection = useCallback((ingredientId: string) => {
    setSelectedIngredients(prev => {
      const isAlreadySelected = prev.some(item => item.id === ingredientId);
      if (isAlreadySelected) {
        return prev.filter(item => item.id !== ingredientId); // Deselect
      } else {
        // Select with a default quantity of 1
        return [...prev, {id: ingredientId, quantity: 1}];
      }
    });
  }, []);

  const handleQuantityChange = useCallback(
    (ingredientId: string, newQuantity: number) => {
      setSelectedIngredients(prev =>
        prev.map(item =>
          item.id === ingredientId ? {...item, quantity: newQuantity} : item,
        ),
      );
    },
    [],
  );

  const renderTabs = useCallback(
    () => (
      <View style={styles.tabContainer}>
        {tabData.map(tab => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeTab === tab.value ? COLORS.yellow : 'transparent',
              },
            ]}>
            <CustomText fontSize={14} fontFamily="medium">
              {tab.label}
            </CustomText>
          </Pressable>
        ))}
      </View>
    ),
    [activeTab],
  );

  const ListCard = memo(
    ({
      ingredient,
      onToggleSelection,
      onQuantityChange,
      selectedQuantity, // This will be `number | undefined` now
    }: {
      ingredient: IngredientItem;
      onToggleSelection: (ingredientId: string) => void;
      onQuantityChange: (ingredientId: string, quantity: number) => void;
      selectedQuantity: number | undefined; // Updated type
    }) => {
      const isSelected = selectedQuantity !== undefined;

      const handleIncreaseQuantity = () => {
        const newQuantity = (selectedQuantity || 0) + 1;
        onQuantityChange(ingredient.idFood.toString(), newQuantity);
      };

      const handleDecreaseQuantity = () => {
        const newQuantity = Math.max(1, (selectedQuantity || 0) - 1); // Ensure min quantity is 1
        onQuantityChange(ingredient.idFood.toString(), newQuantity);
        if (newQuantity === 0 && isSelected) {
          // Option to deselect if quantity becomes 0 (user preference)
          onToggleSelection(ingredient.idFood.toString());
        }
      };

      return (
        <View style={[styles.ingredientItem]}>
          <Image
            source={{
              uri: ingredient.image,
            }}
            style={styles.ingredientImage}
          />
          <View style={styles.ingredientContent}>
            <View style={styles.ingredientHeader}>
              <View>
                <CustomText
                  color={COLORS.yellow}
                  fontFamily="medium"
                  fontSize={15}>
                  {ingredient.title}
                </CustomText>
                <CustomText
                  color={COLORS.whiteTail}
                  fontFamily="medium"
                  fontSize={13}>
                  {`${ingredient.size}g`}
                </CustomText>
              </View>

              <View style={styles.quantityControls}>
                {isSelected && (
                  <>
                    {selectedQuantity > 1 && (
                      <TouchableOpacity
                        onPress={handleDecreaseQuantity}
                        style={styles.quantityButton}>
                        <CustomText color={COLORS.white} fontSize={18}>
                          -
                        </CustomText>
                      </TouchableOpacity>
                    )}
                    <CustomText
                      color={COLORS.white}
                      fontFamily="bold"
                      fontSize={16}
                      style={styles.quantityDisplay}>
                      {selectedQuantity}
                    </CustomText>
                    <TouchableOpacity
                      onPress={handleIncreaseQuantity}
                      style={styles.quantityButton}>
                      <CustomText color={COLORS.white} fontSize={18}>
                        +
                      </CustomText>
                    </TouchableOpacity>
                  </>
                )}
                {isSelected ? (
                  <TouchableOpacity
                    onPress={() =>
                      toggleIngredientSelection(ingredient.idFood.toString())
                    }
                    style={[styles.actionButton, styles.selectedButton]}>
                    <CustomText color={COLORS.white} fontFamily="bold">
                      ✓
                    </CustomText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      toggleIngredientSelection(ingredient.idFood.toString())
                    }
                    style={styles.actionButton}>
                    <CustomIcon Icon={ICONS.PlusIcon} height={12} width={12} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.tagsContainer}>
              {ingredient.calories.map((value, idx) => {
                const getKey = () => {
                  switch (idx) {
                    case 0:
                      return 'Calories';
                    case 1:
                      return 'Carbs';
                    case 2:
                      return 'Fat';
                    case 3:
                      return 'protein';

                    default:
                      break;
                  }
                };
                return (
                  <View
                    key={`${ingredient.id}-${idx}`}
                    style={styles.nutritionItem}>
                    <CustomText fontSize={10} color={COLORS.whiteTail}>
                      {getKey()}
                    </CustomText>
                    <CustomText
                      style={styles.tag}
                      fontSize={10}
                      color={COLORS.whiteTail}>
                      {value}
                    </CustomText>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      );
    },
  );

  const validInputs = () => {
    let valid = true;
    let newErrors = {
      title: '',
      fileData: '',
      serving: '',
      calories: '',
      fat: '',
      carbs: '',
      protein: '',
      description: '',
    };
    if (!title.trim()) {
      valid = false;
      newErrors.title = 'Title is required.';
      showCustomToast('error', newErrors.title);
      return;
    }
    if (!fileData) {
      valid = false;
      newErrors.fileData = 'CoverImage is required.';
      showCustomToast('error', newErrors.fileData);
      return;
    }
    if (!serving.trim()) {
      valid = false;
      newErrors.serving = 'Serving Size is required.';
      showCustomToast('error', newErrors.serving);
      return;
    }
    if (!calories.trim()) {
      valid = false;
      newErrors.calories = 'Calories is required.';
      showCustomToast('error', newErrors.calories);
      return;
    }
    if (!fat.trim()) {
      valid = false;
      newErrors.fat = 'Fat is required.';
      showCustomToast('error', newErrors.fat);
      return;
    }
    if (!carbs.trim()) {
      valid = false;
      newErrors.carbs = 'Crabs is required.';
      showCustomToast('error', newErrors.carbs);
      return;
    }
    if (!protein.trim()) {
      valid = false;
      newErrors.protein = 'Protien is required.';
      showCustomToast('error', newErrors.protein);
      return;
    }
    if (!description.trim()) {
      valid = false;
      newErrors.description = 'Description required.';
      showCustomToast('error', newErrors.description);
      return;
    }
    setErrors(newErrors);
    return valid;
  };

  const renderAddNewIngredientUi = () => {
    // ... (Your existing renderAddNewIngredientUi logic, no changes needed here)
    const handleSave = async () => {
      if (!validInputs()) {
        return;
      }
      const data = {
        name: title, //must include
        category: '',
        image_url: fileData ? fileData : '',
        description: description,
        image_urls: ['https://nix-tag-images.s3.amazonaws.com/384_highres.jpg'],
        serving_size_amount: 1,
        serving_size_measurement: selectedServingMeasurement,
        serving_weight_grams: Number(serving),
        calories: Number(calories),
        carbs: Number(carbs),
        fat: Number(fat),
        protein: Number(protein),
        gluten_free: false,
        dairy_free: false,
        nut_free: false,
        soy_free: false,
        egg_free: false,
        is_vegan: false,
        is_paleo: false,
        is_halal: false,
        is_kosher: false,
        is_public: true,
      };

      try {
        const response = await postData<any>(ENDPOINTS.foodCreate, {data});
        if (response?.data) {
          const getFood_id = await response.data.data.food_id;
          const id = await response.data.data.id;

          dispatch(
            addnewIngredient({
              id: id,
              idFood: Number(getFood_id),
              title: title,
              percentage: 0,
              image: fileData ? fileData : '',
              calories: [
                Number(calories),
                Number(fat),
                Number(carbs),
                Number(protein),
              ],
              quantity: '1',
              measurementUnit: selectedServingMeasurement,
              size: Number(serving),
            }),
          );

          //  Save to local storage
          const localFoodList =
            (await getLocalStorageData(STORAGE_KEYS.localFoodData)) || [];

          const newFoodItem = {
            id: id,
            food_id: getFood_id,
            name: title,
            image_url: fileData || '',
            description: description,
            calories: Number(calories),
            carbs: Number(carbs),
            fat: Number(fat),
            protein: Number(protein),
            serving_size_amount: 1,
            serving_size_measurement: selectedServingMeasurement,
            serving_weight_grams: Number(serving),
            gluten_free: false,
            dairy_free: false,
            nut_free: false,
            soy_free: false,
            egg_free: false,
            is_vegan: false,
            is_paleo: false,
            is_halal: false,
            is_kosher: false,
            is_public: true,
          };

          const updatedFoodList = [...localFoodList, newFoodItem];
          await storeLocalStorageData(
            STORAGE_KEYS.localFoodData,
            updatedFoodList,
          );
          setCarbs('0');
          setFat('0');
          setProtein('0');
          setCalories('0');
          setDescription('');
          setTitle('');
          setServing('');
          setFileData(null);
          setShowAddNewIngredientUI(false);
        }
      } catch (error) {
        console.log(error, 'Something wnet wrong');
      }
    };

    const closeModal = () => {
      setIsUploadImageOptionModal(false);
    };

    const openImagePicker = (type: 'cover' | 'ingredient', index?: number) => {
      setCurrentImageType(type);
      setIsUploadImageOptionModal(true);
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
          };

          if (currentImageType === 'cover') {
            setImage(imageData);
          }

          const formData = new FormData();
          const assesData = asset;
          formData.append('asset', {
            uri: assesData.uri,
            name: assesData.fileName,
            type: assesData.type,
          });

          try {
            const api_response = await postFormData<any>(
              ENDPOINTS.uploadFile,
              formData,
            );
            console.log('nfkfdkk', api_response.data);
            if (api_response.data) {
              const get_Image_Url = api_response.data.url;
              if (get_Image_Url) {
                setFileData(get_Image_Url);
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
          };

          if (currentImageType === 'cover') {
            setImage(imageData);
          }

          const formData = new FormData();
          const assesData = asset;
          formData.append('asset', {
            uri: assesData.uri,
            name: assesData.fileName,
            type: assesData.type,
          });

          try {
            const api_response = await postFormData<any>(
              ENDPOINTS.uploadFile,
              formData,
            );
            if (api_response.data) {
              const get_Image_Url = api_response.data.url;
              if (get_Image_Url) {
                setFileData(get_Image_Url);
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

    return (
      <View style={styles.contentContainer}>
        {/* Cover Image Section */}
        <ImageBackground
          source={{
            uri: fileData ? fileData : '',
          }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', '#1F1A16']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <View style={styles.headerContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                <CustomIcon
                  Icon={ICONS.BackArrow}
                  onPress={() => {
                    setShowAddNewIngredientUI(false);
                    setTitle(''),
                      setServing(''),
                      setFileData(null),
                      setCalories(''),
                      setFat(''),
                      setCarbs(''),
                      setProtein(''),
                      setDescription('');
                  }}
                />
                <View style={styles.headerTextContainer}>
                  <CustomIcon
                    onPress={() => {
                      openImagePicker('cover');
                    }}
                    Icon={ICONS.EditIcon}
                  />
                </View>
              </View>

              {/* Title Section */}
              <View style={[styles.section, {width: '100%'}]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: horizontalScale(5),
                  }}>
                  <CustomText fontFamily="extraBold" fontSize={18}>
                    {title}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => setShowTitleInput(!showTitleInput)}>
                    <CustomIcon Icon={ICONS.EditIcon} height={20} width={20} />
                  </TouchableOpacity>
                </View>
                {showTitleInput && (
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter meal title"
                    placeholderTextColor={COLORS.lightBrown}
                  />
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <ScrollView
          contentContainerStyle={{
            gap: verticalScale(40),
          }}>
          {/* Serving Section */}
          <View style={[styles.section, {paddingHorizontal: 10}]}>
            <View
              style={{
                justifyContent: 'space-between',
                gap: verticalScale(10),
              }}>
              <CustomText fontFamily="extraBold" fontSize={18}>
                Serving Size
              </CustomText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(10),
                  justifyContent: 'space-between',
                  paddingHorizontal: horizontalScale(20),
                }}>
                <CustomText fontFamily="medium" fontSize={12}>
                  Serving Size
                </CustomText>
                <View style={styles.macroValueContainer}>
                  <TextInput
                    style={styles.macroInput}
                    value={serving}
                    onChangeText={setServing}
                    placeholder="100"
                    placeholderTextColor={COLORS.lightBrown}
                    keyboardType="numeric"
                  />
                  <CustomText
                    onPress={e => {
                      setMeasurementTypePosition({
                        top: e.nativeEvent.pageY + verticalScale(20),
                        right:
                          Dimensions.get('window').width - e.nativeEvent.pageX,
                      });
                      setShowServingMeasurementType(
                        !showServingMeasurementType,
                      );
                    }}>
                    {selectedServingMeasurement}
                  </CustomText>
                  <ContextMenu
                    isVisible={showServingMeasurementType}
                    menuItems={[
                      {
                        label: 'gram',
                        onPress: () => {
                          setSelectedServingMeasurement('g');
                        },
                        textColor: 'white',
                      },
                      {
                        label: 'oz',
                        onPress: () => {
                          setSelectedServingMeasurement('oz');
                        },
                        textColor: 'white',
                      },
                      {
                        label: 'killo',
                        onPress: () => {
                          setSelectedServingMeasurement('killo');
                        },
                        textColor: 'white',
                      },
                    ]}
                    onClose={() => setShowServingMeasurementType(false)}
                    position={{
                      right: measurementTypePosition.right,
                      top: measurementTypePosition.top,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Macros Section */}
          <View style={[styles.section, {paddingHorizontal: 10}]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CustomText fontFamily="extraBold" fontSize={18}>
                Macros (Per Serving)
              </CustomText>
            </View>
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <CustomText
                  fontFamily="medium"
                  fontSize={14}
                  color={COLORS.whiteTail}>
                  Calories
                </CustomText>
                <View style={styles.macroValueContainer}>
                  <TextInput
                    style={styles.macroInput}
                    value={calories}
                    onChangeText={setCalories}
                    placeholder="512"
                    placeholderTextColor={COLORS.lightBrown}
                    keyboardType="numeric"
                  />
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.yellow}>
                    cal
                  </CustomText>
                </View>
              </View>

              <View style={styles.macroItem}>
                <CustomText
                  fontFamily="medium"
                  fontSize={14}
                  color={COLORS.whiteTail}>
                  Fat
                </CustomText>
                <View style={styles.macroValueContainer}>
                  <TextInput
                    style={styles.macroInput}
                    value={fat}
                    onChangeText={setFat}
                    placeholder="12"
                    placeholderTextColor={COLORS.lightBrown}
                    keyboardType="numeric"
                  />
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.yellow}>
                    g
                  </CustomText>
                </View>
              </View>

              <View style={styles.macroItem}>
                <CustomText
                  fontFamily="medium"
                  fontSize={14}
                  color={COLORS.whiteTail}>
                  Carbs
                </CustomText>
                <View style={styles.macroValueContainer}>
                  <TextInput
                    style={styles.macroInput}
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="9"
                    placeholderTextColor={COLORS.lightBrown}
                    keyboardType="numeric"
                  />
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.yellow}>
                    g
                  </CustomText>
                </View>
              </View>

              <View style={styles.macroItem}>
                <CustomText
                  fontFamily="medium"
                  fontSize={14}
                  color={COLORS.whiteTail}>
                  Protein
                </CustomText>
                <View style={styles.macroValueContainer}>
                  <TextInput
                    style={styles.macroInput}
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="30"
                    placeholderTextColor={COLORS.lightBrown}
                    keyboardType="numeric"
                  />
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.yellow}>
                    g
                  </CustomText>
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={[styles.section, {paddingHorizontal: 10}]}>
            <View
              style={{
                justifyContent: 'space-between',
                gap: verticalScale(10),
              }}>
              <CustomText fontFamily="extraBold" fontSize={18}>
                Description
              </CustomText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(10),
                }}>
                <CustomText fontFamily="medium" fontSize={12}>
                  Please add description
                </CustomText>
                <TouchableOpacity
                  onPress={() =>
                    setShowDescriptionInput(!showDescriptionInput)
                  }>
                  <CustomIcon Icon={ICONS.EditIcon} height={20} width={20} />
                </TouchableOpacity>
              </View>
            </View>
            {showDescriptionInput && (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter meal description"
                placeholderTextColor={COLORS.lightBrown}
                multiline
                numberOfLines={4}
              />
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <PrimaryButton
          title="Add"
          onPress={handleSave}
          style={styles.saveButton}
          // disabled={!title || !description || !serving}
        />

        {isUploadImageOptionModal && (
          <UploadImageOptions
            closeModal={closeModal}
            isModalVisible={isUploadImageOptionModal}
            onPressCamera={handleCameraPick}
            onPressGallery={handleImagePick}
            title={
              currentImageType === 'cover'
                ? 'Select Cover Image'
                : 'Select Ingredient Image'
            }
          />
        )}
      </View>
    );
  };

  const handleAddFood = () => {
    const ingredientsToAdd = selectedIngredients
      .map(selected => {
        const originalIngredient = Ingredients.find(
          ing => ing.idFood.toString() === selected.id,
        );

        if (!originalIngredient) {
          // This should ideally not happen if your data is consistent
          console.warn(`Original ingredient with ID ${selected.id} not found.`);
          return null; // Or handle this error as appropriate
        }

        // Extract the numerical part and the unit from the original quantity string
        const match = originalIngredient.quantity.match(
          /^(\d+(\.\d+)?)([a-zA-Z]+)$/,
        );

        let originalBaseQuantity = 0;
        let originalUnit = '';

        if (match) {
          originalBaseQuantity = parseFloat(match[1]); // e.g., 750 from "750g"
          originalUnit = match[3]; // e.g., "g" from "750g"
        } else {
          console.warn(
            `Could not parse quantity for ${originalIngredient.title}: ${originalIngredient.quantity}`,
          );
          // Fallback if parsing fails, maybe use the selected quantity directly
          originalBaseQuantity = 1; // Default to 1 unit if parsing fails
          originalUnit = 'unit'; // Default unit
        }

        // Calculate the new total quantity
        const newTotalQuantity = originalBaseQuantity * selected.quantity;

        return {
          ...originalIngredient,
          quantity: newTotalQuantity.toString(),
          measurementUnit: originalIngredient.measurementUnit,
        };
      })
      .filter(Boolean) as IngredientItem[]; // Filter out any nulls if an ingredient wasn't found

    // The rest of your dispatch logic
    if (isFrom === 'addNewMeal') {
      dispatch(setIngredient(ingredientsToAdd));
      dispatch(setQuickMeals(ingredientsToAdd));
      dispatch(setSource('addNewMeal'));
      navigation.goBack();
    } else if (isFrom === 'editMeal') {
      dispatch(
        addIngredientsToMeal({
          mealId: mealId!,
          ingredients: ingredientsToAdd,
        }),
      );
      navigation.goBack();
    } else if (isFrom === 'Logmeal') {
      dispatch(
        addIngredientsToMeal({
          mealId: mealId!,
          ingredients: ingredientsToAdd,
        }),
      );
      navigation.goBack();
    }
  };

  useEffect(() => {
    setFilteredIngredients(Ingredients);
  }, [Ingredients]);

  const renderMainView = useCallback(() => {
    const getSelectedQuantity = (ingredientId: string) => {
      const selectedItem = selectedIngredients.find(
        item => item.id === ingredientId,
      );
      return selectedItem ? selectedItem.quantity : undefined;
    };

    switch (activeTab) {
      case 1:
        return (
          <FlatList
            data={filteredIngredients}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <ListCard
                ingredient={item}
                onToggleSelection={toggleIngredientSelection}
                onQuantityChange={handleQuantityChange}
                selectedQuantity={getSelectedQuantity(item.idFood.toString())}
              />
            )}
            contentContainerStyle={styles.mainListContent}
          />
        );
      case 2:
        return (
          <FlatList
            data={filteredIngredients}
            keyExtractor={exercise => exercise.id}
            renderItem={({item}) => (
              <ListCard
                ingredient={item}
                onToggleSelection={toggleIngredientSelection}
                onQuantityChange={handleQuantityChange}
                selectedQuantity={getSelectedQuantity(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        );
      case 3:
        return (
          <FlatList
            data={filteredIngredients}
            keyExtractor={exercise => exercise.id}
            renderItem={({item}) => {
              return (
                <ListCard
                  ingredient={item}
                  onToggleSelection={toggleIngredientSelection}
                  onQuantityChange={handleQuantityChange}
                  selectedQuantity={getSelectedQuantity(item.id)}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    selectedIngredients,
    filteredIngredients,
    toggleIngredientSelection,
    handleQuantityChange,
  ]);

  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safeArea}>
        {showAddNewIngredientUI ? (
          renderAddNewIngredientUi()
        ) : (
          <>
            <View style={styles.header}>
              <CustomIcon
                onPress={() => {
                  navigation.goBack();
                }}
                Icon={ICONS.BackArrow}
              />
              <View style={styles.searchContainer}>
                <CustomIcon Icon={ICONS.searchIcon} height={25} width={25} />
                <TextInput
                  value={searchedWord}
                  onChangeText={handleSearch}
                  placeholder="Search for ingredients"
                  placeholderTextColor={COLORS.nickel}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowAddNewIngredientUI(true);
                }}
                style={styles.newButton}>
                <View style={styles.newIconContainer}>
                  <CustomIcon Icon={ICONS.PlusIcon} height={26} width={26} />
                </View>
                <CustomText
                  style={{position: 'absolute', bottom: verticalScale(-22)}}>
                  New
                </CustomText>
              </TouchableOpacity>
            </View>
            {renderTabs()}
            {renderMainView()}

            <PrimaryButton title={'Add Food'} onPress={handleAddFood} />
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

export default IngredientList;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
    paddingBottom: verticalScale(5),
  },
  safeArea: {flex: 1, gap: verticalScale(10)},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    width: wp(100),
  },
  searchContainer: {
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 100,
    paddingHorizontal: verticalScale(10),
    paddingVertical: verticalScale(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    flex: 0.85,
  },
  searchInput: {width: '100%', color: COLORS.white},
  newButton: {alignItems: 'center', gap: verticalScale(5)},
  newIconContainer: {
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 100,
    padding: verticalScale(10),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: horizontalScale(15),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  selectedText: {paddingHorizontal: horizontalScale(15)},
  trainingPlanContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.brown,
    marginHorizontal: horizontalScale(15),
    borderRadius: verticalScale(8),
  },
  mainListContent: {
    paddingHorizontal: horizontalScale(15),
  },
  listContent: {
    paddingHorizontal: horizontalScale(15),
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: verticalScale(10),
    backgroundColor: COLORS.lightBrown,
    padding: verticalScale(5),
    borderWidth: 1,
    borderColor: COLORS.white,
    gap: horizontalScale(10),
    marginVertical: verticalScale(5),
  },
  ingredientImage: {
    height: '100%',
    minHeight: horizontalScale(70),
    width: horizontalScale(70),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  ingredientContent: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(15),
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: horizontalScale(20),
  },
  selectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
  },
  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    borderRadius: 100,
    height: verticalScale(28),
    width: verticalScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: COLORS.yellow,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
  },
  tag: {
    backgroundColor: '#403633',
    paddingHorizontal: horizontalScale(10),
    width: '100%',
  },
  categoryContainer: {gap: verticalScale(10)},
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(20),
  },
  categoryImage: {
    height: 60,
    width: 60,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
  },
  nutritionItem: {
    minWidth: horizontalScale(30),
    alignItems: 'center',
    gap: verticalScale(2),
  },

  coverImage: {
    height: hp(20),
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
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
    paddingBottom: verticalScale(30),
    gap: verticalScale(20),
  },
  section: {
    gap: verticalScale(10),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    height: verticalScale(200),
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: verticalScale(5),
    flexDirection: 'row',
    padding: verticalScale(10),
  },
  overlayText: {
    color: COLORS.whiteTail,
    fontFamily: 'medium',
  },
  input: {
    backgroundColor: COLORS.brown,
    borderRadius: 8,
    padding: verticalScale(10),
    color: COLORS.whiteTail,
    fontFamily: 'medium',
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.lightBrown,
  },
  multilineInput: {
    minHeight: verticalScale(100),
    textAlignVertical: 'top',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
  },
  infoInputContainer: {
    flex: 1,
    gap: verticalScale(5),
  },
  infoInput: {
    backgroundColor: COLORS.brown,
    borderRadius: 8,
    padding: verticalScale(8),
    color: COLORS.whiteTail,
    fontFamily: 'medium',
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.lightBrown,
    textAlign: 'center',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    marginVertical: verticalScale(5),
  },

  ingredientInput: {
    flex: 1,
  },
  weightInput: {
    width: wp(20),
    textAlign: 'center',
  },
  saveButton: {
    width: wp(40),
    alignSelf: 'center',
  },
  ingredientImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  macrosContainer: {},
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 8,
  },
  macroValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    minWidth: horizontalScale(100),
  },
  macroInput: {
    backgroundColor: COLORS.lightBrown,
    borderRadius: 6,
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    color: COLORS.white,
    fontFamily: 'medium',
    fontSize: 14,
    textAlign: 'center',
    minWidth: wp(15),
  },

  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: horizontalScale(5),
    width: wp(90),
    paddingHorizontal: horizontalScale(10),
  },
  imageItem: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: 20,

    overflow: 'hidden',
    position: 'relative',
    marginBottom: verticalScale(10),
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.darkBrown,
    borderRadius: 15,
    padding: 5,
  },
  addImageButton: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(3),
  },
  quantityButton: {
    borderRadius: 50,
    width: wp(7),
    height: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    minWidth: horizontalScale(10), // Ensure enough space for the number
    textAlign: 'center',
  },
});
