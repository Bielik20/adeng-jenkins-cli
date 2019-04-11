import { Observable } from 'rxjs';
import { Subscriber } from 'rxjs/src/internal/Subscriber';

export const processInterrupt$ = Observable.create((observer: Subscriber<void>) => {
  process.on('exit', () => {
    console.log('');
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
});
