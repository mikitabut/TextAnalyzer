import { NgModule } from '@angular/core';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list';
import { CommonModule } from '@angular/common';
import { ChangeableValueComponent } from './components/tag/changeable-value.component';
import { ChangeableValueEditorComponent } from './components/tag-editor/changeable-value-editor.component';

@NgModule({
  declarations: [
    DictionaryListComponent,
    ChangeableValueEditorComponent,
    ChangeableValueComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    DictionaryListComponent,
  ]
})
export class SharedModule { }
