import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-dictionary-list',
  templateUrl: './dictionary-list.html',
  styleUrls: ['./dictionary-list.scss']
})
export class DictionaryListComponent implements OnChanges {
  @Input()
  data;

  words = [];
  wordMap = {};

  currentOrder = 1;
  currentPage = 1;
  pages = this.words.length / 100;

  selectedSorting: 'Name' | 'Count' | 'No' = 'No';

  ngOnChanges(changes) {
    this.data.map(word => this.setWord(word));
    this.words = Object.keys(this.wordMap);
  }

  setWord(word: string) {
    if (this.wordMap[word]) {
      this.wordMap[word].count += 1;
    } else {
      this.wordMap[word] = { word, count: 1 };
    }
  }

  getWordsKeys() {
    this.words = Object.keys(this.data);
    return this.words;
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
        (a, b) => (this.wordMap[a].count < this.wordMap[b].count ? 1 : -1)
      );
    } else {
      this.words.sort(
        (a, b) => (this.wordMap[a].count < this.wordMap[b].count ? -1 : 1)
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
  }

  onKey(event, word) {
    if (word !== event.target.value) {
      this.setWord(event.target.value);
      delete this.wordMap[word];
      this.words = Object.keys(this.wordMap);
    }
  }
}
