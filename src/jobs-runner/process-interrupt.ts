import * as ansiEscapes from 'ansi-escapes';
import { Observable, Subscriber } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export const processInterrupt$ = Observable.create((observer: Subscriber<void>) => {
  process.on('exit', () => {
    process.stdout.write(ansiEscapes.cursorDown(1));
    process.stdout.write(ansiEscapes.cursorLeft);
    process.stdout.write(ansiEscapes.cursorShow);
    observer.next();
    observer.complete();
  });

  process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    process.exit(1);
  });

  process.on('SIGUSR1', () => {
    console.log('Process killed');
    process.exit(1);
  });

  process.on('SIGUSR2', () => {
    console.log('Process killed');
    process.exit(1);
  });

  process.on('uncaughtException', () => {
    console.log('Uncaught Exception');
    process.exit(1);
  });
}).pipe(shareReplay(1));
