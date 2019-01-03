import { NgModule } from '@angular/core';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list';
import { CommonModule } from '@angular/common';
import { ChangeableValueComponent } from './components/tag/changeable-value.component';
import { ChangeableValueEditorComponent } from './components/tag-editor/changeable-value-editor.component';
import { TextTaggingComponent } from './components/text-tagging/text-tagging.component';
import { TextTaggedWordComponent } from './components/text-tagged-word/text-tagged-word.component';
import { ListComponent } from './components/list/list.component';

@NgModule({
  declarations: [
    DictionaryListComponent,
    ChangeableValueEditorComponent,
    ChangeableValueComponent,
    TextTaggingComponent,
    TextTaggedWordComponent,
    ListComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    DictionaryListComponent,
    TextTaggingComponent,
    TextTaggedWordComponent,
  ]
})
export class SharedModule { }
