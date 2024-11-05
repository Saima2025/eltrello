import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  errorMessage: string | null = null ;
  form = this.fb.group({
    email: ['',Validators.required],
    username: ['',Validators.required],
    password: ['', Validators.required],
  })

  constructor(private fb: FormBuilder, private authService: AuthService, private router : Router,private socketService: SocketService) {

  }

  onSubmit() : void {
    if(this.form.valid)
    this.authService.register(this.form?.value).subscribe({
      next : (currentUser) => {
        this.authService.setToken(currentUser) ;
        this.authService.setCurrentUser(currentUser) ;
        this.socketService.setUpSocketConnection(currentUser);
        this.errorMessage = null ;
        this.router.navigateByUrl('/') ;
      },
      error : (err : HttpErrorResponse) => {
        console.log(err) ; 
        this.errorMessage = err.error.join(', ') ;
      }
    })

  }
}
