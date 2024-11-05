import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { InlineFormComponent } from "./components/inlineForm.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
    imports: [CommonModule,BrowserModule,ReactiveFormsModule],
    declarations: [InlineFormComponent],
    exports: [InlineFormComponent]
})
export class InlineFormModule {

}