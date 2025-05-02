import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Setting } from "@shared/schema";

interface AppointmentTimeSettings {
  startTime: string;
  endTime: string;
  intervalMinutes: number;
}

type SettingsContextType = {
  settings: Map<string, Setting> | undefined;
  isLoading: boolean;
  error: Error | null;
  getSettingValue: (key: string, defaultValue?: string) => string;
  getSettingsByCategory: (category: string) => Setting[];
  allSettings: Setting[] | undefined;
  isMaintenanceMode: boolean;
  showAppointmentsBubble: boolean;
  getAvailableAppointmentDays: () => string[];
  getAppointmentTimeSettings: () => AppointmentTimeSettings;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const {
    data: allSettings,
    error,
    isLoading,
  } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a map for faster lookups
  const settingsMap = new Map<string, Setting>();
  allSettings?.forEach(setting => {
    settingsMap.set(setting.key, setting);
  });

  const getSettingValue = (key: string, defaultValue = "") => {
    return settingsMap.get(key)?.value || defaultValue;
  };

  const getSettingsByCategory = (category: string) => {
    return allSettings?.filter(setting => setting.category === category) || [];
  };

  // Check if maintenance mode is enabled
  const isMaintenanceMode = getSettingValue("maintenance_mode") === "true";
  
  // Check if appointments bubble should be shown
  const showAppointmentsBubble = getSettingValue("show_appointments_bubble") === "true";
  
  // Get appointments settings
  const getAvailableAppointmentDays = () => {
    const days = getSettingValue("appointments_available_days", "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday");
    return days.split(',').map(day => day.trim());
  };
  
  const getAppointmentTimeSettings = () => {
    return {
      startTime: getSettingValue("appointments_start_time", "9:00"),
      endTime: getSettingValue("appointments_end_time", "17:00"),
      intervalMinutes: parseInt(getSettingValue("appointments_interval", "60"), 10)
    };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: settingsMap,
        isLoading,
        error,
        getSettingValue,
        getSettingsByCategory,
        allSettings,
        isMaintenanceMode,
        showAppointmentsBubble,
        getAvailableAppointmentDays,
        getAppointmentTimeSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}