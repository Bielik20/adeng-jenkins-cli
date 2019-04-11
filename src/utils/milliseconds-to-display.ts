export function millisecondsToDisplay(milliseconds: number): string {
  const minutes: number = Math.floor(milliseconds / 60000);
  const seconds: number = +((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ' min' + (seconds < 1 ? '' : ` ${seconds} sec`);
}
