export interface VehicleData {
    charge_state: {
        battery_level: number;
        charging_state: string;
        battery_range: number;
    };
    climate_state: {
        inside_temp: number;
        outside_temp: number;
        fan_status: number;
        is_climate_on: boolean;
    };
    vehicle_state: {
        odometer: number;
        sentry_mode: boolean;
    };
    drive_state?: {
        shift_state: string | null;
        latitude: number;
    };
}

export interface Vehicle {
    id: number;
    vehicle_id: number;
    vin: string;
    display_name: string;
    option_codes: string;
    color: string | null;
    tokens: string[];
    state: string;
    in_service: boolean;
    id_s: string;
    calendar_enabled: boolean;
    api_version: number;
    backseat_token: string | null;
    backseat_token_updated_at: number | null;
    vehicle_data?: VehicleData;
    error?: string | null;
}
