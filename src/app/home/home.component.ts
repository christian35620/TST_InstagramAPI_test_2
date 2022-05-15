import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService, TestService, ValidatorsService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  accounts: any[];
  forma: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private testService: TestService,
    private validatorsService:ValidatorsService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.accountService
      .getAll()
      .pipe(first())
      .subscribe((accounts) => (this.accounts = accounts));
    this.getOwnIgBusinessAccountId();
  }

  get accountsToSearch() {
    return this.forma.get('accountsToSearch') as FormArray;
  }

  get accountsToSearchInvalid() {
    return (
      this.forma.get('accountsToSearch').invalid && this.forma.get('accountsToSearch').touched
    );
  }

  buildForm() {
    this.forma = this.fb.group({
      accountsToSearch: this.fb.array([], this.validatorsService.minLengthArray(1)),
    });
  }

  addAccountToSearch() {
    this.accountsToSearch.push(this.fb.control('', Validators.required));
  }

  removeAccountToSearch(i: number) {
    this.accountsToSearch.removeAt(i);
  }

  getOwnIgBusinessAccountId() {
    this.testService.getOwnIgBusinessAccountId().subscribe((resp) => {
      console.log('IG Business Account Id (first found)', resp);
    });
  }

  getThirdPartyIgAccountsInfo() {
    if (this.forma.invalid) {
      return Object.values(this.forma.controls).forEach((control) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((control) =>
            control.markAsTouched()
          );
        } else if(control instanceof FormArray){
          Object.values(control.controls).forEach((control) =>
            control.markAsTouched()
          );
        }
        else {
          control.markAsTouched();
        }
      });
    }

    this.testService.getThirdPartyIgAccountsInfo(this.accountsToSearch.value);
  }

  deleteAccount(id: string) {
    const account = this.accounts.find((x) => x.id === id);
    account.isDeleting = true;
    this.accountService
      .delete(id)
      .pipe(first())
      .subscribe(
        () => (this.accounts = this.accounts.filter((x) => x.id !== id))
      );
  }
}
