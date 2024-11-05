import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BoardsComponent } from "./components/boards/boards.component";
import { AuthGuardService } from "../auth/services/authGuard.servics";
import { BoardsService } from "../shared/services/boards.service";
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopbarModule } from "../shared/modules/topbar/topbar.module";

const routes : Routes = [{
    path: 'boards',
    component: BoardsComponent,
    canActivate: [AuthGuardService]
}] ;
@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes),InlineFormModule,TopbarModule],
    declarations: [BoardsComponent],
    providers: [BoardsService]
})

export class BoardsModule {

}