import { NgModule } from '@angular/core';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    DictionaryListComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    DictionaryListComponent,
  ]
})
export class SharedModule { }
