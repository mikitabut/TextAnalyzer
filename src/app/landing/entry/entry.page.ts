import { Component, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { words } from '../constants/words.contant';
import { map, delay, mapTo, mergeMap } from 'rxjs/operators';
import { of, fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { TextAnalyzerService } from '../services/text-analyzer.service';

@Component({
  selector: 'app-entry-page',
  templateUrl: './entry.page.html',
  styleUrls: ['./entry.page.scss']
})
export class EntryPageComponent implements OnInit {
  fileReader;

  wordMap = {};
  words = [];

  files: File[] = [];
  fileTexts: string[] = [];
  currentLoadProgress = 0;
  currentAnalyzeProgress = 0;
  currentTextSize;
  subscription;
  progress$: Observable<number> = null;
  analyzerSubject;
  analyzerOutputObservable;
  subject = new Subject();

  constructor(private textAnalyzer: TextAnalyzerService) {
    this.fileReader = new FileReader();
    this.fileReader.onprogress = ev => {
      this.currentLoadProgress = (ev.loaded / ev.total) * 100;
    };
    this.analyzerOutputObservable = this.subject.asObservable();
    const { analyzerSubject } = this.textAnalyzer.getAnalyzer(this.subject);
    this.analyzerSubject = analyzerSubject;

    this.fileReader.onload = () => {
      this.fileTexts.push(this.fileReader.result);
      this.currentTextSize = this.fileReader.result.length;
      analyzerSubject.next(this.fileReader.result);
      // subscription.unsubscribe();
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
    this.fileTexts = [];
  }

  ngOnInit() {
    this.subscription = this.analyzerOutputObservable.pipe(
      map((value: { newWords: string[], otherText: string }) => {
        // console.log(value.newWords);
        this.words.push(...value.newWords);
        this.currentAnalyzeProgress =
          ((this.currentTextSize - value.otherText.length) /
            this.currentTextSize) *
          100;
        if (this.currentAnalyzeProgress === 100) {
          this.words = [...this.words];
        }
        return this.currentAnalyzeProgress;
      })
    );
  }
}
