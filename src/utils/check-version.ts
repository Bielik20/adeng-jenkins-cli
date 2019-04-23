import * as updateNotifier from 'update-notifier';
import { packageJson } from './package';

export function checkVersion() {
  const notifier = updateNotifier({
    pkg: packageJson as any,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
  notifier.notify({ isGlobal: true });
}
