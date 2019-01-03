import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
declare var nlp: any;
@Component({
  selector: 'app-text-tagged-word',
  templateUrl: './text-tagged-word.component.html',
  styleUrls: ['./text-tagged-word.component.scss']
})
export class TextTaggedWordComponent implements OnChanges {
  @Input() word: string;
  @Input() tags: string[];
  @Input() dictionary: any;
  @Input() color: string;

  @Output() wordSave = new EventEmitter();
  @Output() tagUnselect = new EventEmitter();
  @Output() tagSelect = new EventEmitter();

  valuesChangerOpened = false;
  selectedTagsVisible = [];
  worldTags = [];
  worldTagsVisible = [];
  dictionaryTagsVisible = [];

  constructor() {}

  ngOnChanges() {
    this.selectedTagsVisible = [...this.tags];
    this.updateTagArrays();
  }
  updateWorldTags(): any {
    const resultTags = Object.keys(nlp('').world().tags);
    for (const value of Array.from(this.dictionary.values())) {
      resultTags.push(
        ...value.tags.filter(
          tag => !resultTags.includes(tag) && tag !== '(EMPTY)'
        )
      );
    }
    this.worldTags = resultTags.sort();
  }

  openValuesChanger() {
    this.updateTagArrays();
    this.valuesChangerOpened = !this.valuesChangerOpened;
  }

  private updateTagArrays() {
    const dictionaryWordObj = this.dictionary.get(this.word.toLowerCase());
    this.dictionaryTagsVisible =
      (dictionaryWordObj && [
        ...dictionaryWordObj.tags.filter(
          value =>
            !this.selectedTagsVisible.includes(value) && value !== '(EMPTY)'
        )
      ]) ||
      [];
    this.updateWorldTags();

    this.worldTagsVisible = [
      ...this.worldTags.filter(
        value => !this.selectedTagsVisible.includes(value)
      )
    ];
  }

  onWordSave(newWordValue: string) {
    this.wordSave.emit(newWordValue);
    this.valuesChangerOpened = false;
  }

  onTagUnselect(unselectedTag: string) {
    this.selectedTagsVisible = this.selectedTagsVisible.filter(
      value => value !== unselectedTag
    );
    this.updateTagArrays();
    this.tagUnselect.emit(unselectedTag);
  }

  onTagSelect(selectedTag: string) {
    this.selectedTagsVisible.push(selectedTag);
    this.tagSelect.emit(this.selectedTagsVisible);
    this.updateTagArrays();
  }

  onAddNewTag(tagValue: string) {
    if (!this.selectedTagsVisible.includes(tagValue)) {
      this.selectedTagsVisible.push(tagValue);
      this.updateTagArrays();
    }
  }
}
