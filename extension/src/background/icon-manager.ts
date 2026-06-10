const INACTIVE_ICONS = {
  16: 'icons/icon-16.png',
  32: 'icons/icon-32.png',
  48: 'icons/icon-48.png',
  128: 'icons/icon-128.png',
};

const ACTIVE_ICONS = {
  16: 'icons/icon-16-active.png',
  32: 'icons/icon-32-active.png',
  48: 'icons/icon-48-active.png',
  128: 'icons/icon-128-active.png',
};

export async function updateIcon(active: boolean): Promise<void> {
  const path = active ? ACTIVE_ICONS : INACTIVE_ICONS;
  await chrome.action.setIcon({ path });

  if (active) {
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}
