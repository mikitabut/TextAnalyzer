import { NgModule } from '@angular/core';
import { EntryPageComponent } from './entry/entry.page';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

const appRoutes: Routes = [
  { path: '', component: EntryPageComponent },
];

@NgModule({
  declarations: [
    EntryPageComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(
      appRoutes,
    )
  ],
})
export class LandingModule { }
