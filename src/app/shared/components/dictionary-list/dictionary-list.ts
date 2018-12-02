import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import * as lex from 'en-lexicon';

declare var nlp: any;

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
      canonConn?: string;
      canonChildrens: string[];
      isCanon: boolean;
    }
  >();

  currentOrder = 1;
  selectedSorting: 'Name' | 'Count' = 'Count';

  emptyValue = '(EMPTY)';

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
        tags: oldWord.tags,
        canonConn: oldWord.canonConn,
        canonChildrens: oldWord.canonChildrens,
        isCanon: oldWord.isCanon
      });
    } else {
      let tags = [];
      let canon;
      let isCanon = false;

      if (this.onNewWordAdding) {
        tags = this.getTags(word, this.newTagsValues, this.setDefaultTags);
        if (this.setDefaultTags) {
          canon = this.updateCanonForm(word);
          isCanon = canon === word;
        }
      } else {
        tags = this.getTags(word, this.newTagsValues);
        canon = this.updateCanonForm(word);
        isCanon = canon === word;
      }

      if (isCanon) {
        const canonValue = this.wordMap.get(word);
        this.wordMap.set(word, {
          ...canonValue,
          count: count,
          fileMeta: newWordfileMeta
        });
      } else {
        this.wordMap.set(word, {
          word,
          count: count,
          fileMeta: newWordfileMeta,
          tags,
          canonChildrens: [],
          isCanon,
          canonConn: canon || this.emptyValue
        });
      }
    }
  }

  private updateCanonForm(word: string, canonWord?: string) {
    const canonChildrens = [];

    let canon;

    if (!canonWord) {
      canon = this.getCanonWord(word);
    } else {
      canon = canonWord;
    }
    if (canon !== word) {
      canonChildrens.push(word);
    }
    if (!this.wordMap.has(canon)) {
      this.wordMap.set(canon, {
        word: canon,
        count: 0,
        fileMeta: [],
        tags: this.getTags(canon),
        canonChildrens,
        isCanon: true,
        canonConn: this.emptyValue
      });
    } else {
      const oldCanon = this.wordMap.get(canon);
      canonChildrens.push(
        ...oldCanon.canonChildrens.filter(
          child => !canonChildrens.includes(child)
        )
      );
      this.wordMap.set(canon, {
        ...oldCanon,
        canonChildrens
      });
    }

    return canon;
  }

  getCanonWord(word: string): any {
    const analyzedWord = nlp(word);

    if (analyzedWord.out('tags').includes('Noun')) {
      return analyzedWord
        .normalize({
          whitespace: true,
          case: true,
          numbers: true,
          punctuation: true,
          unicode: true,
          contractions: true,
          acronyms: true,
          parentheses: true,
          possessives: true,
          plurals: true,
          honorifics: true
        })
        .out('text');
    }
    return nlp(word)
      .normalize({
        whitespace: true,
        case: true,
        numbers: true,
        punctuation: true,
        unicode: true,
        contractions: true,
        acronyms: true,
        parentheses: true,
        possessives: true,
        verbs: true,
        honorifics: true
      })
      .out('text');
  }

  getTags(
    word: string,
    newTagsValues: string[] = [],
    isDefaultTagsAdding = true
  ) {
    const tags = [];

    if (isDefaultTagsAdding) {
      tags.push(...nlp(word).out('tags')[0].tags);
    }
    if (newTagsValues.length !== 0) {
      tags.push(newTagsValues);
    }
    tags.push(this.emptyValue);

    return tags;
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
    const oldWord = this.wordMap.get(word);
    const resultTags = [...oldWord.tags.filter(value => value !== tag)];
    if (!resultTags.includes(newTagValue)) {
      if (newTagValue !== undefined && newTagValue !== '') {
        resultTags.push(newTagValue);
        oldWord.canonChildrens.map(child => {
          const childWord = this.wordMap.get(child);
          if (childWord && childWord.tags.includes(tag)) {
            childWord.tags = [
              ...childWord.tags.filter(childTag => childTag !== tag),
              newTagValue
            ];
          }
        });
      } else if (tag === this.emptyValue) {
        resultTags.push(this.emptyValue);
      } else if (newTagValue === undefined || newTagValue === '') {
        oldWord.canonChildrens.map(child => {
          const childWord = this.wordMap.get(child);
          if (childWord && childWord.tags.includes(tag)) {
            childWord.tags = childWord.tags.filter(
              childTag => childTag !== tag
            );
          }
        });
      }
    }

    if (!resultTags.includes(this.emptyValue)) {
      resultTags.push(this.emptyValue);
    }
    oldWord.tags = resultTags;
  }

  onCanonChange(word: string, newCanonValue: string) {
    // alert('Be aware - all your tags of this word removed. Rewrite it according your purposes');
    const oldWord = this.wordMap.get(word);
    this.wordMap.delete(word);
    this.wordMap.set(word, {
      ...oldWord,
      tags: [this.emptyValue],
      canonConn: newCanonValue,
      isCanon: newCanonValue === word
    });
    this.updateCanonForm(word, newCanonValue);

    this.words = Array.from(this.wordMap.keys());

    this.updateView();
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
      this.addNewWord(this.newWordValue, this.newTagValue);
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

  private addNewWord(initialWord: string, initialTags: string) {
    this.newTagsValues = initialTags
      .split('|')
      .filter(value => value.length > 0);
    this.setWord(initialWord, [], 0);
    this.words = Array.from(this.wordMap.keys());
    this.updateView();
  }

  onSaveDictionary() {
    this.saveDictionary.emit(this.wordMap);
  }

  onSearch(searchPhrase: string) {
    if (searchPhrase.length === 0) {
      this.words = Array.from(this.wordMap.keys());
    } else {
      this.words = Array.from(this.wordMap.keys()).filter((word: string) =>
        word.includes(searchPhrase)
      );
    }
    this.updateView();
  }
}
