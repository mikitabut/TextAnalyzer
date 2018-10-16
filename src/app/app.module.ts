import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const appRoutes: Routes = [
  { path: '', loadChildren: './landing/landing.module#LandingModule', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
    ),
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule { }
