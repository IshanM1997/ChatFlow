import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  readonly demo = [
    { username: 'alice',   password: 'alice123'   },
    { username: 'bob',     password: 'bob123'     },
    { username: 'charlie', password: 'charlie123' },
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private snack:  MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  loginAs(demo: { username: string; password: string }): void {
    this.form.patchValue(demo);
    this.submit();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/chat']),
      error: () => {
        this.loading = false;
        this.snack.open('Invalid credentials', 'OK', { duration: 3000 });
      }
    });
  }
}
