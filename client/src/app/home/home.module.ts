import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./components/home/home.component";
import { RouterModule, Routes } from "@angular/router";

const routes : Routes = [{
    path: '',
    component: HomeComponent
}] ;
@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    declarations: [HomeComponent]
})

export class HomeModule {

}