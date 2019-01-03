import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
declare var nlp: any;

@Component({
  selector: 'app-entry-page',
  templateUrl: './entry.page.html',
  styleUrls: ['./entry.page.scss']
})
export class EntryPageComponent {
  fileReader = new FileReader();
  dictReader = new FileReader();
  textReader = new FileReader();

  words = [];
  dictionary = '';
  files: File[] = [];
  currentLoadProgress = 0;
  currentFile: File;
  dictFile: any;

  // Trick for fast solution(rewrite if you want)
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
  raskrText = '';
  textFile: any;
  raskrTextEnd = '';

  constructor(private _FileSaverService: FileSaverService, private cdr: ChangeDetectorRef) {
    this.fileReader.onload = () => {
      this.dictionary = null;
      this.words = [
        ...nlp(this.fileReader.result as string).normalize({case: false, punctuation: false}).out('text')
          .split(/[ \!\?\_\-\.\,\;\]\[\)\(\:\s\n\t\r\d]/)
          .map(element => element.trim())
          .filter(word => word.length > 0)
          .map(word => ({
            word: word.toLowerCase(),
            filename: this.currentFile.name,
            text: this.fileReader.result
          }))
      ];
      this.raskrText = this.fileReader.result as string;
      this.cdr.detectChanges();
    };
    this.dictReader.onload = () => {
      this.dictionary = this.dictReader.result as string;
      this.onClearLoadedTexts();
      this.cdr.detectChanges();
    };
    this.textReader.onload = () => {
      this.raskrTextEnd = this.textReader.result as string;
      this.cdr.detectChanges();
    };
  }

  fileChanged(e) {
    this.files = e.target.files;
    this.uploadDocuments();
  }

  fileDictChanged(e) {
    this.dictFile = e.target.files[0];
    this.uploadDictDocument();
  }
  fileTextChanged(e) {
    this.textFile = e.target.files[0];
    this.uploadTextDocument();
  }

  uploadDocuments() {
    let i = 0;
    while (this.files.length > i) {
      const currentFile = this.files[i];
      this.currentFile = currentFile;
      this.fileReader.readAsText(currentFile);
      i++;
    }
  }
  uploadDictDocument() {
    this.dictReader.readAsText(this.dictFile);
  }
  uploadTextDocument() {
    this.textReader.readAsText(this.textFile);
  }

  onClearLoadedTexts() {
    this.files = [];
    this.currentFile = undefined;
    this.words = [];
  }

  onRemoveWord(wordProperties: {
    oldWord: string;
    word: string;
    files: { filename: string; text: string }[];
  }) {
    wordProperties.files.map(fileProp => {
      const replace = wordProperties.oldWord;
      const re = new RegExp(replace, 'gi');
      const newText = fileProp.text.replace(re, wordProperties.word);
      this._FileSaverService.saveText(newText, fileProp.filename);
    });
  }

  onSaveDictionary(obj) {
    const jsonStr = JSON.stringify(Array.from(obj.entries()));
    this._FileSaverService.saveText(jsonStr, 'dictionary.dct');
  }
  onSaveText(obj) {
    const jsonStr = JSON.stringify(obj);
    this._FileSaverService.saveText(jsonStr, 'raskrText.rskr');
  }
}
