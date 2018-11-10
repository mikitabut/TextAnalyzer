import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import * as lex from 'en-lexicon';
import { emptyValue } from '../../constants/common';

@Component({
  selector: 'app-dictionary-list',
  templateUrl: './dictionary-list.html',
  styleUrls: ['./dictionary-list.scss']
})
export class DictionaryListComponent implements OnChanges {
  @Input()
  data;

  @Input()
  dictionary: string;

  @Output()
  wordRemove = new EventEmitter();
  @Output() saveDictionary = new EventEmitter();

  words = [];
  wordMap = new Map<
    string,
    {
      word: string;
      count: number;
      fileMeta: { filename: string; text: string }[];
      tags: string[];
    }
  >();

  currentOrder = 1;
  selectedSorting: 'Name' | 'Count' = 'Count';

  emptyValue = emptyValue;

  currentPage = 1;
  countOnPage = 10;
  pages = [];
  showedWords: any[];

  newWordValue = '';
  newTagValue = '';
  setDefaultTags = false;
  onNewWordAdding = false;
  newTagsValues = [];

  lexicon = lex.lexicon;

  ngOnChanges(changes) {
    this.words = [];
    if (this.dictionary != null) {
      const resultMap = new Map();
      for (const entry of JSON.parse(this.dictionary)) {
        resultMap.set(entry[0], entry[1]);
      }
      this.wordMap = resultMap;
      // this.dictionary = null;
    } else {
      this.data.map((word: { word: string; filename: string; text: string }) =>
        this.setWord(word.word, [{ filename: word.filename, text: word.text }])
      );
    }
    this.words = Array.from(this.wordMap.keys());

    this.updateView();
  }

  private updateView() {
    this.applySorting();
    this.onCountSelected(this.countOnPage);
  }

  setWord(
    word: string,
    newWordfileMeta: { filename: string; text: string }[],
    count = 1
  ) {
    if (this.wordMap.has(word)) {
      const oldWord = this.wordMap.get(word);
      const files = oldWord.fileMeta;
      for (const fileForWord of newWordfileMeta) {
        if (
          files.findIndex(file => file.filename === fileForWord.filename) === -1
        ) {
          files.push(...newWordfileMeta);
        }
      }
      this.wordMap.set(word, {
        word,
        count: oldWord.count + count,
        fileMeta: files,
        tags: oldWord.tags
      });
    } else {
      let tags = [];
      if (
        !this.onNewWordAdding ||
        (this.onNewWordAdding && this.setDefaultTags)
      ) {
        tags =
          this.lexicon[word.toLowerCase()] &&
          this.lexicon[word.toLowerCase()].split('|');
        if (tags == null) {
          tags = [];
        }
      }

      if (this.onNewWordAdding) {
        tags.push(...this.newTagsValues);
      }
      tags.push(this.emptyValue);

      this.wordMap.set(word, {
        word,
        count: count,
        fileMeta: newWordfileMeta,
        tags
      });
    }
  }

  sortByName() {
    if (this.currentOrder === -1) {
      this.words.sort((a, b) => (a < b ? 1 : -1));
    } else {
      this.words.sort((a, b) => (a < b ? -1 : 1));
    }
  }

  sortByCount() {
    if (this.currentOrder === -1) {
      this.words.sort((a, b) =>
        this.wordMap.get(a).count < this.wordMap.get(b).count ? 1 : -1
      );
    } else {
      this.words.sort((a, b) =>
        this.wordMap.get(a).count < this.wordMap.get(b).count ? -1 : 1
      );
    }
  }

  sortChange() {
    if (this.selectedSorting === 'Name') {
      this.selectedSorting = 'Count';
    } else {
      this.selectedSorting = 'Name';
    }
    this.applySorting();
  }

  sortOrderChange() {
    this.currentOrder *= -1;
    this.applySorting();
  }

  applySorting() {
    if (this.selectedSorting === 'Name') {
      this.sortByName();
    } else {
      this.sortByCount();
    }
    this.updateWordsView(1);
  }

  onCountSelected(countOnPage: number) {
    this.countOnPage = countOnPage;
    this.currentPage = 1;
    const pageCount = Math.floor(
      this.words.length / this.countOnPage +
        (this.words.length % this.countOnPage > 0 ? 1 : 0)
    );
    this.pages = new Array(pageCount).fill(0).map((_, i) => i + 1);
    this.updateWordsView(1);
  }

  onPageSelected(pageNumber: number) {
    this.updateWordsView(pageNumber);
  }

  private updateWordsView(pageNumber: number) {
    this.showedWords = this.words.slice(
      (pageNumber - 1) * this.countOnPage,
      pageNumber * this.countOnPage
    );
  }

  onTagsChange(tag: string, word: string, newTagValue: string) {
    const resultTags = [
      ...this.wordMap.get(word).tags.filter(value => value !== tag)
    ];
    if (!resultTags.includes(newTagValue)) {
      if (newTagValue !== undefined && newTagValue !== '') {
        resultTags.push(newTagValue);
      } else if (tag === this.emptyValue) {
        resultTags.push(this.emptyValue);
      }
    }

    if (!resultTags.includes(this.emptyValue)) {
      resultTags.push(this.emptyValue);
    }
    this.wordMap.get(word).tags = resultTags;
  }

  onWordChange(word: string, newWordValue: string) {
    if (word !== newWordValue) {
      const oldWord = this.wordMap.get(word) || {
        fileMeta: [],
        count: 1
      };
      if (newWordValue != null && newWordValue !== '') {
        this.setWord(newWordValue, oldWord.fileMeta, oldWord.count);
      }
      if (oldWord.fileMeta) {
        this.wordRemove.emit({
          oldWord: word,
          word: newWordValue,
          files: oldWord.fileMeta
        });
      }
      this.wordMap.delete(word);
      this.words = Array.from(this.wordMap.keys());
      this.updateView();
    }
  }

  onWordInputChange(value: string) {
    this.newWordValue = value;
  }

  onTagsInputChange(value: string) {
    this.newTagValue = value;
  }

  onSetDefaultCheckboxInputChange() {
    this.setDefaultTags = !this.setDefaultTags;
  }

  onAddNewWord() {
    if (!this.wordMap.has(this.newWordValue) && this.newWordValue !== '') {
      this.onNewWordAdding = true;
      this.newTagsValues = this.newTagValue.split('|').filter(value => value.length > 0);
      this.setWord(this.newWordValue, [], 0);
      this.words = Array.from(this.wordMap.keys());
      this.updateView();
      this.onNewWordAdding = false;
    } else {
      if (this.wordMap.has(this.newWordValue)) {
        alert(
          'Can\'t add \'' +
            this.newWordValue +
            '\' as word, because this word existing!'
        );
      }
    }
  }

  onSaveDictionary() {
    this.saveDictionary.emit(this.wordMap);
  }

  onSearch(searchPhrase: string) {
    if(searchPhrase.length === 0) {
      this.words = Array.from(this.wordMap.keys());
    } else {
      this.words = Array.from(this.wordMap.keys()).filter((word: string) => word.includes(searchPhrase));
    }
    this.updateView();
  }
}
