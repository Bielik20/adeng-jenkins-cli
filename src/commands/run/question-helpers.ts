import axios from 'axios';
import * as branch from 'git-branch';

export function adenToUpper(input: string) {
  if (input.indexOf('aden-') === 0) {
    return `ADEN-${input.slice(5)}`;
  }
  return input;
}

export function requiredInput(input?: string): boolean | string {
  if (!!input) {
    return true;
  } else {
    return 'This file is required.';
  }
}

export function currentBranch(): string | undefined {
  try {
    return branch.sync();
  } catch (e) {
    return undefined;
  }
}

export async function replaceLatestWithAdEngineVersion(input: string) {
  if (input !== 'latest') {
    return input;
  }

  const response = await axios.get(
    'https://raw.githubusercontent.com/Wikia/ad-engine/dev/package.json',
  );

  return `v${response.data.version}`;
}
