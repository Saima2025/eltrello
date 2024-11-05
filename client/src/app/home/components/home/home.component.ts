import { Component, OnInit } from "@angular/core";
import { Route, Router } from "@angular/router";
import { AuthService } from "src/app/auth/services/auth.service";

@Component({
    selector: "home" ,
    templateUrl: "./home.component.html"
})

export class HomeComponent implements OnInit {
    constructor(private authService: AuthService, private router: Router) {

    }

    ngOnInit(): void {
        this.authService.isLogged$.subscribe((isLoggedIn)=> {
            console.log(isLoggedIn);
            if(isLoggedIn) {
                this.router.navigateByUrl('/boards') ;
        }})
    }
}