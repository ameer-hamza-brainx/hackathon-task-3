import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { MessageType } from '../../shared/messages';
import type { StorageSchema } from '../../shared/types';

export function useFocusMode(
  setState: Dispatch<SetStateAction<StorageSchema>>,
) {
  const toggle = useCallback(async () => {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.TOGGLE_FOCUS_MODE,
    });
    if (response?.state) {
      setState(response.state);
    }
  }, [setState]);

  return { toggle };
}
