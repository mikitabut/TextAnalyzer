import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, of, empty } from 'rxjs';
import { EventEmitter } from 'events';
import { map, repeatWhen, takeWhile, expand } from 'rxjs/operators';

@Injectable()
export class TextAnalyzerService {
  words: string[][];

  progressAnalyzing: Subject<string>;
  progressObservable;

  currentWords = [];
  currentText = '';

  constructor() {}

  getAnalyzer(subject) {
    const analyzerSubject = new Subject<string>();
    const analyzerOutputEmitter = new Subject<{
      newWords: string[];
      otherText: string;
    }>();
    analyzerSubject
      .pipe(
        expand(otherText => {
          let nextSentenceIndex = 0;
          const words = [];
          let currentText = otherText;
          const step = currentText.length > 30000 ? 30000 : currentText.length;
          nextSentenceIndex = step + currentText.substr(step).indexOf('.');
          if (nextSentenceIndex < 0) {
            nextSentenceIndex = currentText.length - 1;
          }
          const sentence = currentText.substring(0, nextSentenceIndex);
          currentText = currentText.substring(nextSentenceIndex + 1);
          words.push(
            ...sentence.split(/[ \.\,\n\t\r\d]/).map(word => word.trim()).filter(word => word.length > 0)
          );
          const returnValue = {
            newWords: words,
            otherText: currentText
          };
          subject.next(returnValue);
          if (returnValue.otherText.length) {
            return of(returnValue.otherText);
          }
          return empty();
        })
      )
      .subscribe();
    return { analyzerSubject };
  }

  getWords() {}
}
