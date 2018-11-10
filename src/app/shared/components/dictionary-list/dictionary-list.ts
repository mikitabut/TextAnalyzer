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

  @Output()
  wordRemove = new EventEmitter();

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

  lexicon = lex.lexicon;

  ngOnChanges(changes) {
    this.words = [];
    this.wordMap.clear();
    this.data.map((word: { word: string; filename: string; text: string }) =>
      this.setWord(word.word, [{ filename: word.filename, text: word.text }])
    );
    console.log('map setted');
    this.words = Array.from(this.wordMap.keys());
    console.log('words array setted');

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
      let tags = this.lexicon[word] && this.lexicon[word].split('|');
      if (tags == null) {
        tags = [];
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
}
