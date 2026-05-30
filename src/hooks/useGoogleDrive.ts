/**
 * Google Drive Sync Hook
 * 
 * Saves/loads closet data (items + outfits) to a JSON file in Google Drive.
 * Creates a dedicated folder so your Drive stays organized.
 * 
 * Customization: Change folder/file names in src/config.ts
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import { DRIVE_FOLDER_NAME, DRIVE_DATA_FILE } from '@/config';
import type { ClothingItem, Outfit, ScheduleRecord, RandomizerLockState } from '@/types/closet';

interface DriveData {
  items: ClothingItem[];
  outfits: Outfit[];
  schedules?: ScheduleRecord[];
  randomizer?: RandomizerLockState;
  darkMode?: boolean;
  weatherCity?: string;
  weatherLat?: number; // add
  weatherLon?: number; // add
}

async function driveRequest(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  return res.json();
}

async function findOrCreateFolder(token: string): Promise<string> {
  // Search for existing folder
  const query = `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const result = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    token
  );

  if (result.files?.length > 0) return result.files[0].id;

  // Create folder
  const folder = await driveRequest('https://www.googleapis.com/drive/v3/files', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  return folder.id;
}

async function findDataFile(token: string, folderId: string): Promise<string | null> {
  const query = `name='${DRIVE_DATA_FILE}' and '${folderId}' in parents and trashed=false`;
  const result = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    token
  );
  return result.files?.[0]?.id ?? null;
}



export function useGoogleDrive(accessToken: string | undefined) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const saveToD = useCallback(async (data: DriveData) => {
    if (!accessToken) return;
    setSyncing(true);
    try {
      const folderId = await findOrCreateFolder(accessToken);
      const fileId = await findDataFile(accessToken, folderId);
      const jsonBody = JSON.stringify(data);

      const metadata = { name: DRIVE_DATA_FILE, parents: fileId ? undefined : [folderId] };
      const boundary = '---BOUNDARY---';
      const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        `--${boundary}`,
        'Content-Type: application/json',
        '',
        jsonBody,
        `--${boundary}--`,
      ].join('\r\n');

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      await fetch(url, {
        method: fileId ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });
      setLastSync(Date.now());
    } catch (err) {
      console.error('Drive save failed:', err);
    }
    setSyncing(false);
  }, [accessToken]);

  const loadFromDrive = useCallback(async (): Promise<DriveData | null> => {
    if (!accessToken) return null;
    setSyncing(true);
    try {
      const folderId = await findOrCreateFolder(accessToken);
      const fileId = await findDataFile(accessToken, folderId);
      if (!fileId) { setSyncing(false); return null; }

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) { setSyncing(false); return null; }
      const data = await res.json();
      setLastSync(Date.now());
      setSyncing(false);
      return data;
    } catch (err) {
      console.error('Drive load failed:', err);
      setSyncing(false);
      return null;
    }
  }, [accessToken]);

  return { saveToDrive: saveToD, loadFromDrive, syncing, lastSync};
}
