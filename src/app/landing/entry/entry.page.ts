import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-entry-page',
  templateUrl: './entry.page.html',
  styleUrls: ['./entry.page.scss']
})
export class EntryPageComponent {
  fileReader = new FileReader();

  words = [];

  files: File[] = [];
  currentLoadProgress = 0;

  constructor() {
    this.fileReader.onprogress = ev => {
      this.currentLoadProgress = (ev.loaded / ev.total) * 100;
    };

    this.fileReader.onload = () => {
      this.words = [
        ...this.words,
        ...(this.fileReader.result as string)
          .split(/[ \.\,\n\t\r\d]/)
          .map(element => element.trim())
          .filter(word => word.length > 0)
      ];
      console.log(this.words);
    };
  }

  fileChanged(e) {
    this.files = e.target.files;
    this.uploadDocuments();
  }

  uploadDocuments() {
    let i = 0;
    while (this.files.length > i) {
      const currentFile = this.files[i];
      this.fileReader.readAsText(currentFile);
      i++;
    }
  }

  onClearLoadQueue() {
    this.fileReader.abort();
    this.files = null;
  }

  onClearLoadedTexts() {
    this.files = null;
    this.words = [];
  }
}
