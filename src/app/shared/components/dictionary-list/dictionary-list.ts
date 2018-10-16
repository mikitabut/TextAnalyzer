import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dictionary-list',
  templateUrl: './dictionary-list.html',
  styleUrls: ['./dictionary-list.scss']
})
export class DictionaryListComponent implements OnChanges {
  @Input()
  data;

  words = [];
  wordMap = new Map<string, { word: string; count: number }>();

  currentOrder = 1;
  selectedSorting: 'Name' | 'Count' = 'Count';

  currentPage = 1;
  countOnPage = 10;
  pages = [];
  showedWords: any[];

  ngOnChanges(changes) {
    this.words = [];
    this.wordMap.clear();
    this.data.map(word => this.setWord(word));
    console.log('map setted');
    this.words = Array.from(this.wordMap.keys());
    console.log('words array setted');

    this.applySorting();
    console.log('sorting applied');
    this.onCountSelected(this.countOnPage);
    console.log('count selected');
  }

  setWord(word: string) {
    if (this.wordMap.has(word)) {
      const value = this.wordMap.get(word);
      this.wordMap.set(word, { word, count: value.count + 1 });
    } else {
      this.wordMap.set(word, { word, count: 1 });
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
      this.setWord(event.target.value);
      this.wordMap.set(event.target.value, {
        word: event.target.value,
        count: this.wordMap.get(word).count
      });
      this.wordMap.delete(word);
      this.words = Array.from(this.wordMap.keys());
    }
  }

  onCountSelected(countOnPage: number) {
    this.countOnPage = countOnPage;
    this.currentPage = 1;
    const pageCount = Math.floor(
      this.words.length / this.countOnPage +
        (this.words.length % this.countOnPage > 0 ? 1 : 0)
    );
    this.pages = new Array(pageCount).fill(0).map((x, i) => i + 1);
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
