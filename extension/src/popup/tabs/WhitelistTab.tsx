import { MessageType } from '../../shared/messages';
import type { StorageSchema } from '../../shared/types';
import { WhitelistForm } from '../components/WhitelistForm';
import { WhitelistList } from '../components/WhitelistList';

type Props = {
  state: StorageSchema;
  setState: React.Dispatch<React.SetStateAction<StorageSchema>>;
};

export function WhitelistTab({ state, setState }: Props) {
  async function addOrigin(origin: string) {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.ADD_WHITELIST,
      payload: { origin },
    });
    if (response?.state) {
      setState(response.state);
      return { ok: true };
    }
    return { ok: false, error: response?.error };
  }

  async function removeOrigin(origin: string) {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.REMOVE_WHITELIST,
      payload: { origin },
    });
    if (response?.state) {
      setState(response.state);
    }
  }

  return (
    <div className="space-y-4">
      <WhitelistForm onAdd={addOrigin} />
      <WhitelistList whitelist={state.whitelist} onRemove={removeOrigin} />
    </div>
  );
}
