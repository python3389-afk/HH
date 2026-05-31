import { uriToDataUrl } from '../utils/imageDataUrl';
import { PATHS, dbUpdate } from './rtdb';

const AVATAR_MAX_BYTES = 500_000;

/** Store profile photo in Realtime Database (data URL on user profile). */
export async function uploadUserAvatar(userId, uri) {
  if (!userId || !uri) throw new Error('Missing user or image');
  const dataUrl = await uriToDataUrl(uri, AVATAR_MAX_BYTES);
  const stamp = new Date().toISOString();
  await dbUpdate(PATHS.userProfile(userId), {
    avatar: dataUrl,
    avatarVersion: stamp,
    updatedAt: stamp,
  });
  return dataUrl;
}
