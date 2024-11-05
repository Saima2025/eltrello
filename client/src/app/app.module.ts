import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'; 
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { AuthInterceptor } from './auth/services/authInterceptor.service';
import { BoardsModule } from './boards/boards.module';
import { BoardModule } from './board/board.module';
import { SocketService } from './shared/services/socket.service';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule ,
    AuthModule,
    HttpClientModule,
    HomeModule,
    BoardsModule,
    BoardModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true 
  },SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
