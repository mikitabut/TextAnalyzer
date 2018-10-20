import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import * as lex from 'en-lexicon';

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
      tags: string,
      count: number;
      fileMeta: { filename: string; text: string }[];
    }
  >();

  currentOrder = 1;
  selectedSorting: 'Name' | 'Count' = 'Count';

  currentPage = 1;
  countOnPage = 10;
  pages = [];
  showedWords: any[];

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
    console.log('sorting applied');
    this.onCountSelected(this.countOnPage);
    console.log('count selected');
  }

  setWord(
    word: string,
    newWordfileMeta: { filename: string; text: string }[],
    count = 1
  ) {
    if (this.wordMap.has(word)) {
      const oldWord = this.wordMap.get(word);
      const files = oldWord.fileMeta;
      files.push(...newWordfileMeta);
      this.wordMap.set(word, {
        word,
        tags: lex.lexicon[word],
        count: oldWord.count + count,
        fileMeta: files
      });
    } else {
      this.wordMap.set(word, { word, tags: lex.lexicon[word], count: count, fileMeta: newWordfileMeta });
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
      this.words.sort(
        (a, b) =>
          this.wordMap.get(a).count < this.wordMap.get(b).count ? 1 : -1
      );
    } else {
      this.words.sort(
        (a, b) =>
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

  onKey(event, word) {
    if (word !== event.target.value) {
      const oldWord = this.wordMap.get(word) || {
        fileMeta: [],
        count: 1
      };
      this.setWord(event.target.value, oldWord.fileMeta, oldWord.count);
      if (oldWord.fileMeta) {
        this.wordRemove.emit({
          oldWord: word,
          word: event.target.value,
          files: oldWord.fileMeta
        });
      }
      this.wordMap.delete(word);
      this.words = Array.from(this.wordMap.keys());
      this.updateView();
    }
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
}
