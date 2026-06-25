import React from 'react';
import { useAppSelector } from '../../Redux/store';
import CountryPicker from './CountryPicker';
import { useDispatch } from 'react-redux';
import { setSelectedCountry } from '../../Redux/slices/footerSlice';
import { setIsCountryPickerVisible } from '../../Redux/slices/modalSlice';

/**
 * GlobalModals component that renders all global modals in one place
 * This ensures modals are only rendered once in the app
 */
const GlobalModals = () => {
  const dispatch = useDispatch();
  
  const handleCountrySelect = (country: any) => {
    dispatch(setSelectedCountry(country));
    dispatch(setIsCountryPickerVisible(false));
  };

  return (
    <>
      {/* Country Picker Modal - now rendered only once */}
      <CountryPicker selectCountry={handleCountrySelect} />
    </>
  );
};

export default GlobalModals;
