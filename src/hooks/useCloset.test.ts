import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCloset } from './useCloset';
import * as closetStorage from '@/lib/closet-storage';
import type { CustomMainTag, ClosetState } from '@/types/closet';

vi.mock('@/lib/closet-storage');

describe('useCloset - Custom Main Tags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock storage functions to return empty state
    vi.mocked(closetStorage.readClosetState).mockResolvedValue({
      items: [],
      outfits: [],
      customMainTags: [],
    });
    vi.mocked(closetStorage.readLegacyClosetState).mockReturnValue({
      items: [],
      outfits: [],
      customMainTags: [],
    });
    vi.mocked(closetStorage.writeClosetState).mockResolvedValue(undefined);
  });

  it('should initialize with empty custom main tags', async () => {
    const { result } = renderHook(() => useCloset());

    // Wait for async state loading
    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.customMainTags).toEqual([]);
  });

  it('should add a custom main tag', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    let newTag: CustomMainTag | undefined;
    await act(async () => {
      newTag = result.current.addCustomTag('Athletic Wear');
    });

    expect(newTag).toBeDefined();
    expect(newTag?.label).toBe('Athletic Wear');
    expect(newTag?.id).toBeDefined();
    expect(newTag?.createdAt).toBeDefined();
    expect(result.current.customMainTags).toHaveLength(1);
    expect(result.current.customMainTags[0].label).toBe('Athletic Wear');
  });

  it('should generate unique IDs for custom main tags', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    let tag1: CustomMainTag | undefined;
    let tag2: CustomMainTag | undefined;

    await act(async () => {
      tag1 = result.current.addCustomTag('Athletic Wear');
      tag2 = result.current.addCustomTag('Formal Wear');
    });

    expect(tag1?.id).toBeDefined();
    expect(tag2?.id).toBeDefined();
    expect(tag1?.id).not.toBe(tag2?.id);
  });

  it('should delete a custom main tag', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    let tagId: string | undefined;
    await act(async () => {
      const tag = result.current.addCustomTag('Athletic Wear');
      tagId = tag?.id;
    });

    expect(result.current.customMainTags).toHaveLength(1);

    await act(async () => {
      result.current.deleteCustomTag(tagId!);
    });

    expect(result.current.customMainTags).toHaveLength(0);
  });

  it('should persist custom main tags to storage', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    await act(async () => {
      result.current.addCustomTag('Athletic Wear');
    });

    // Wait for storage write
    await vi.waitFor(() => {
      expect(closetStorage.writeClosetState).toHaveBeenCalled();
    });

    const writeCall = vi.mocked(closetStorage.writeClosetState).mock.calls[
      vi.mocked(closetStorage.writeClosetState).mock.calls.length - 1
    ];
    const savedState = writeCall[0] as ClosetState;

    expect(savedState.customMainTags).toHaveLength(1);
    expect(savedState.customMainTags?.[0].label).toBe('Athletic Wear');
  });

  it('should load custom main tags from storage', async () => {
    const existingTag: CustomMainTag = {
      id: 'test-id',
      label: 'Athletic Wear',
      createdAt: Date.now(),
    };

    vi.mocked(closetStorage.readClosetState).mockResolvedValue({
      items: [],
      outfits: [],
      customMainTags: [existingTag],
    });

    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.customMainTags).toHaveLength(1);
    expect(result.current.customMainTags[0].label).toBe('Athletic Wear');
  });

  it('should add default X and Y positions when creating custom tags', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    let newTag: CustomMainTag | undefined;
    await act(async () => {
      newTag = result.current.addCustomTag('Athletic Wear', { defaultX: 100, defaultY: 200 });
    });

    expect(newTag?.defaultX).toBe(100);
    expect(newTag?.defaultY).toBe(200);
  });

  it('should add subcategories to custom tags', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    let newTag: CustomMainTag | undefined;
    await act(async () => {
      newTag = result.current.addCustomTag('Athletic Wear', {
        subcategories: ['Sports Shoes', 'Sports Top', 'Sports Bottom'],
      });
    });

    expect(newTag?.subcategories).toEqual(['Sports Shoes', 'Sports Top', 'Sports Bottom']);
  });

  it('should delete custom tags without affecting items using other categories', async () => {
    const { result } = renderHook(() => useCloset());

    await vi.waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    // Add an item in a built-in category
    await act(async () => {
      result.current.addItem({
        name: 'T-Shirt',
        category: 'tops',
        imageData: 'data:image/png;base64,test',
      });
    });

    expect(result.current.items).toHaveLength(1);

    // Add a custom tag
    let tagId: string | undefined;
    await act(async () => {
      const tag = result.current.addCustomTag('Athletic Wear');
      tagId = tag?.id;
    });

    // Delete the custom tag
    await act(async () => {
      result.current.deleteCustomTag(tagId!);
    });

    // Item should still exist
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('T-Shirt');
  });
});
