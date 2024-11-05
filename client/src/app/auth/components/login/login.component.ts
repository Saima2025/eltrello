import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  error: string | null = null ;
  form = this.fb.group({
    email: ['',Validators.required],
    password: ['', Validators.required],
  })

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router,private socketService: SocketService) {

  }

  onSubmit() : void {
    if(this.form.valid)
    this.authService.login(this.form?.value).subscribe({
      next : (currentUser) => {
        this.authService.setToken(currentUser) ;
        this.authService.setCurrentUser(currentUser) ;
        this.socketService.setUpSocketConnection(currentUser);
        this.error = null;
        this.router.navigateByUrl('/boards') ;
      },
      error : (err : HttpErrorResponse) => {
        console.log(err) ; 
        this.error = err.error.emailOrPassword ;
      }
    })

  }
}
