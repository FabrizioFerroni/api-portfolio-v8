import { DeviceType } from '../enum/device.enum';

export interface ParsedDevice {
  deviceName: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
}
