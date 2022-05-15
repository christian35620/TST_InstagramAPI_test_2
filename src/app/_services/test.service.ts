import { Injectable } from '@angular/core';
import { from, NextObserver, Observable, of } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  instaBusinessAccountId: string;
  facePageId: string;
  constructor() {}

  getOwnIgBusinessAccountId(): Observable<string> {
    let facePageId$ = new Observable((observer: NextObserver<string>) => {
      FB.api('/me?fields=accounts', (response: any) => {
        console.log('fields=accounts:', response);

        //we are retrieving the first facebook page found for testing purposes
        this.facePageId = response['accounts']['data'][0]['id'];

        observer.next(this.facePageId);
        observer.complete();
      });
    });
    return facePageId$.pipe(
      switchMap((resp) => {
        return new Observable((observer: NextObserver<string>) => {
          FB.api(
            `/${resp}?fields=instagram_business_account`,
            (response: any) => {
              console.log('fields=instagram_business_account:', response);
              this.instaBusinessAccountId =
                response['instagram_business_account']['id'];
              observer.next(this.instaBusinessAccountId);
              observer.complete();
            }
          );
        });
      })
    );
  }

  getThirdPartyIgAccountsInfo(usernames: string[]) {
    console.log('usernames:', usernames);

    from(usernames)
      .pipe(
        mergeMap((username) => {
          return new Observable((observer: NextObserver<any>) => {
            FB.api(
              `/${this.instaBusinessAccountId}?fields=business_discovery.username(${username}){biography,id,ig_id,followers_count,media_count,name,profile_picture_url,username,website,media{caption,comments_count,like_count,id,media_product_type,media_type,media_url,permalink,timestamp,owner,username}}`,
              (response: any) => {
                observer.next(response);
                observer.complete();
              }
            );
          });
        }),
        catchError(() => of([]))
      )
      .subscribe((userData) =>
        console.log(
          `${userData['business_discovery']['username']} data`,
          userData
        )
      );
  }
}
