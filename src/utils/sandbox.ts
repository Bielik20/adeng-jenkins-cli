export const sandboxes: Sandbox[] = [
  'sandbox-adeng01',
  'sandbox-adeng02',
  'sandbox-adeng03',
  'sandbox-adeng04',
  'sandbox-adeng05',
  'sandbox-adeng06',
  'sandbox-adeng07',
  'sandbox-adeng08',
];

export type Sandbox =
  | 'sandbox-adeng01'
  | 'sandbox-adeng02'
  | 'sandbox-adeng03'
  | 'sandbox-adeng04'
  | 'sandbox-adeng05'
  | 'sandbox-adeng06'
  | 'sandbox-adeng07'
  | 'sandbox-adeng08';

export function isSandbox(input: string): input is Sandbox {
  return sandboxes.includes(input as Sandbox);
}
