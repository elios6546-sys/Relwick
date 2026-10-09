import { DeviceType } from '@relwick/shared';
import { isbot } from 'isbot';
import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: DeviceType;
  deviceVendor: string | null;
  deviceModel: string | null;
  isBot: boolean;
}

function mapDeviceType(type: string | undefined): DeviceType {
  switch (type) {
    case 'mobile':
      return DeviceType.MOBILE;
    case 'tablet':
      return DeviceType.TABLET;
    case 'console':
    case 'smarttv':
    case 'wearable':
    case 'embedded':
      return DeviceType.UNKNOWN;
    default:
      return type === undefined ? DeviceType.DESKTOP : DeviceType.DESKTOP;
  }
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const bot = isbot(userAgent);
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  let deviceType = mapDeviceType(device.type);
  if (!device.type && !bot) {
    deviceType = DeviceType.DESKTOP;
  }

  return {
    browser: browser.name ?? null,
    browserVersion: browser.version ?? null,
    os: os.name ?? null,
    osVersion: os.version ?? null,
    deviceType,
    deviceVendor: device.vendor ?? null,
    deviceModel: device.model ?? null,
    isBot: bot,
  };
}
