import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB
const mockIDB = {
  databases: async () => [],
  deleteDatabase: vi.fn(),
  open: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIDB,
  writable: true,
});
