import { ethers } from 'ethers';

/**
 * Service to simulate and calculate hardware machine fingerprints.
 * In a native desktop application, this uses CPU serial number, motherboard UUID,
 * and NIC MAC addresses. In our web-based demonstration and client simulator,
 * it derives an authentic Keccak-256 hash from client hardware signals and allows
 * switching between preset virtual test machines.
 */

export const PRESET_DEVICES = [
  {
    id: 'live_device',
    name: 'Current Machine (Live Environment)',
    os: 'Detected OS / Browser',
    specs: 'Current System Hardware',
    rawString: navigator.userAgent + '-' + screen.width + 'x' + screen.height + '-' + (navigator.hardwareConcurrency || 8)
  },
  {
    id: 'device_win11',
    name: 'Workstation Alpha (Windows 11)',
    os: 'Windows 11 Pro 64-bit (Build 22631)',
    specs: 'Intel Core i9-14900K | 64GB RAM | UUID: 550e8400-e29b-41d4-a716-446655440001',
    rawString: 'WIN11-I9-14900K-UUID-550e8400-e29b-41d4-a716-446655440001-MAC-00:1A:2B:3C:4D:5E'
  },
  {
    id: 'device_macbook',
    name: 'MacBook Pro M3 Max (macOS Sequoia)',
    os: 'macOS 15.1 Sequoia (Darwin 24.1.0)',
    specs: 'Apple M3 Max (16-core) | 36GB Unified | UUID: 7a9c3d4e-12fa-48ef-b892-881122334455',
    rawString: 'MACOS-M3MAX-UUID-7a9c3d4e-12fa-48ef-b892-881122334455-MAC-F0:18:98:AA:BB:CC'
  },
  {
    id: 'device_linux_srv',
    name: 'Enterprise Production Node (Ubuntu 24.04)',
    os: 'Ubuntu 24.04 LTS Kernel 6.8.0',
    specs: 'AMD EPYC 9654 (96 cores) | 256GB ECC RAM | MachineID: d41d8cd98f00b204e9800998ecf8427e',
    rawString: 'UBUNTU-EPYC-MACHINEID-d41d8cd98f00b204e9800998ecf8427e-MAC-52:54:00:12:34:56'
  }
];

export function getDeviceFingerprint(presetId = 'live_device') {
  const preset = PRESET_DEVICES.find(d => d.id === presetId) || PRESET_DEVICES[0];
  const encoder = new TextEncoder();
  const data = encoder.encode(preset.rawString);
  const hash = ethers.keccak256(data);
  return {
    presetId: preset.id,
    name: preset.name,
    os: preset.os,
    specs: preset.specs,
    hash: hash,
    shortHash: `${hash.slice(0, 10)}...${hash.slice(-8)}`
  };
}

export function computeCustomFingerprint(customIdentifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(customIdentifier || 'CUSTOM_HARDWARE_NODE');
  const hash = ethers.keccak256(data);
  return {
    presetId: 'custom',
    name: 'Custom Hardware Node',
    os: 'User Defined System',
    specs: customIdentifier,
    hash: hash,
    shortHash: `${hash.slice(0, 10)}...${hash.slice(-8)}`
  };
}
