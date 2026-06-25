import {setWorkoutTime} from '../Redux/slices/LogWorkoutSlice';
import {store} from '../Redux/store';

class WorkoutTimer {
  private interval: NodeJS.Timeout | null = null;
  private elapsedSeconds: number = 0;

  start() {
    if (this.interval) return; // already running
    this.interval = setInterval(() => {
      this.elapsedSeconds += 1;
      store.dispatch(setWorkoutTime(this.elapsedSeconds));
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.stop();
    this.elapsedSeconds = 0;
    store.dispatch(setWorkoutTime(0));
  }

  setInitial(seconds: number) {
    this.elapsedSeconds = seconds;
    store.dispatch(setWorkoutTime(seconds));
  }
}

export const workoutTimer = new WorkoutTimer();
