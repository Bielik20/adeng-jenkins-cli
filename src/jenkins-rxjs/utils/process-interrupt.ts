import { Observable } from 'rxjs';

export const processInterrupt$ = Observable.create(observer => {
  process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    observer.next();
    observer.complete();
    process.exit();
  });
});
