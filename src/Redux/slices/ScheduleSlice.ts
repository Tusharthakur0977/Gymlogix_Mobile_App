import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface ScheduleAPIData {
  type: string;
  status: string;
  schedule_at: string;
  content: any;
  user_id: number;
  updated_at: string;
  created_at: string;
  id: string;
  _id: string;
  finish_at?: string;
}

interface scheduleState {
  scheduleData: ScheduleAPIData[] | null;
  showInitialData: boolean;
}

const initialState: scheduleState = {
  scheduleData: [],
  showInitialData: true,
};

const scheduleSlice = createSlice({
  name: 'scheduleData',
  initialState,
  reducers: {
    setScheduleData(state, action: PayloadAction<ScheduleAPIData[] | null>) {
      state.scheduleData = action.payload;
    },
    setShowInitialData(state, action: PayloadAction<boolean>) {
      state.showInitialData = action.payload;
    },
    addSchedule(state, action: PayloadAction<ScheduleAPIData>) {
      if (!state.scheduleData) {
        state.scheduleData = [action.payload];
      } else {
        state.scheduleData.push(action.payload);
      }
    },
  },
});

export const {setScheduleData, addSchedule, setShowInitialData} =
  scheduleSlice.actions;
export default scheduleSlice.reducer;
