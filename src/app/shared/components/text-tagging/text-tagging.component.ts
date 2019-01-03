import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { colors } from '../../colors/colors.constant';

declare var nlp: any;

@Component({
  selector: 'app-text-tagging',
  templateUrl: './text-tagging.component.html',
  styleUrls: ['./text-tagging.component.scss']
})
export class TextTaggingComponent implements OnChanges {
  @Input() text: string;
  @Input() dictionary;
  @Input() savedText: string;

  @Output() saveText = new EventEmitter();

  sentences = '';
  rawSentences = [];
  processedSentences = [];

  colors = colors;
  currentSentenceNumber = 0;
  currentSentence: string;
  categoriesColorsWithLegend = new Map();
  colorsLegend = [];

  singleCategories = new Map();
  pairCategories = new Map();
  singleCategoriesArray = [];
  pairCategoriesArray = [];

  constructor() {}

  ngOnChanges() {
    if(this.savedText){
      const data = JSON.parse(this.savedText);
      this.processedSentences = this.getProcessedSentences(data, true);

    } else {
      this.processedSentences = [];
      this.rawSentences = this.getRawSentences(this.text);
      this.processedSentences = this.getProcessedSentences(this.rawSentences);
    }
  }

  /*
   * Use it for update legend
   */
  updateTagsCategoriesColors(processedSentence: any) {
    let colorIndex = Math.round(Math.random() * colors.length);

    return processedSentence.map(word => {
      const sortedTags = word.tags.sort() as any[];
      const sortedTagsString = sortedTags.join(',');
      if (!this.categoriesColorsWithLegend.has(sortedTagsString)) {
        this.categoriesColorsWithLegend.set(
          sortedTagsString,
          colors[colorIndex]
        );
        colorIndex = Math.round(Math.random() * colors.length);
      }

      word.color = this.categoriesColorsWithLegend.get(sortedTagsString);
      return {
        ...word
      };
    });
  }

  private getRawSentences(text: string): any[] {
    text = text.replace('.', ' .');
    text = text.replace('!', ' !');
    text = text.replace('?', ' ?');
    text = text.replace(',', ' ,');

    const doc = nlp(text);

    return doc
      .sentences()
      .normalize({ case: false, punctuation: false })
      .data();
  }

  private getProcessedSentences(rawSentences: any[], notFirst = false) {
    this.singleCategories = new Map();
    this.pairCategories = new Map();
    return rawSentences.map(value => {
      const curValues = notFirst ? value : nlp(value.text).out('tags');
      const wordTags = curValues.reduce((resultedTaggedWords, curValue) => {
        const index = (curValue.text as string).search(/\.|\!|\?|\,/);
        if (index !== -1 && !notFirst) {
          return [
            ...resultedTaggedWords,
            { ...curValue, text: curValue.text.replace(/\.|\?|\!|\,/, '') },
            {
              text: curValue.text.slice(index, index + 1),
              tags: [curValue.text.slice(index, index + 1)]
            }
          ];
        }
        return [...resultedTaggedWords, curValue];
      }, []);
      this.updateStatistics(wordTags);
      return this.updateTagsCategoriesColors(wordTags);
    });
  }
  updateStatistics(processedSentence: any) {

    const dictWords = Array.from(this.dictionary.values())
      .filter(value => !processedSentence.find(sentValue =>{
        return sentValue.text === value.word;
      })
      ).map(val => ({
      ...val,
      fict: true
    }));
    [...processedSentence, ...dictWords].reduce((prevTagsArr, word) => {
      const sortedTags = word.tags.filter(value => value !== '(EMPTY)').sort() as any[];
      const sortedTagsString = sortedTags.join(',');
      if (this.singleCategories.has(sortedTagsString)) {
        const curVal = this.singleCategories.get(sortedTagsString);
        this.singleCategories.set(sortedTagsString, {
          word: word.text || word.word,
          tags: sortedTagsString,
          count: word.fict ? curVal.count : curVal.count + 1
        });
      } else {
        this.singleCategories.set(sortedTagsString, {
          word: word.text,
          tags: sortedTagsString,
          count: word.fict ? 0 : 1
        });
      }
      if(word.fict) {
        return prevTagsArr;
      }
      const prevTags = prevTagsArr.pop();
      if (prevTags) {
        const key = prevTags + '_' + sortedTagsString;
        if (this.pairCategories.has(key)) {
          const curVal = this.pairCategories.get(key);
          this.pairCategories.set(key, {
            tag1: prevTags,
            tag2: sortedTagsString,
            count: word.fict ? curVal.count : curVal.count + 1
          });
        } else {
          this.pairCategories.set(key, {
            tag1: prevTags,
            tag2: sortedTagsString,
            count: word.fict ? 0 : 1
          });
        }
      }
      prevTagsArr.push(sortedTagsString);
      return prevTagsArr;
    }, []);

    this.singleCategoriesArray = Array.from(this.singleCategories.values());
    this.pairCategoriesArray = Array.from(this.pairCategories.values());
  }

  changeTag(word, sentenceIndex, newTags) {}

  goNextSentence() {
    this.currentSentenceNumber += 10;
    this.currentSentenceNumber =
      this.currentSentenceNumber % this.processedSentences.length;
  }

  tagSelect(word, currTags: string) {
    this.processedSentences.map(sentence => {
      const realWord = sentence.find(
        val => val.text === word.text && val.tags === word.tags
      );
      if (realWord) {
        realWord.tags = currTags;
      }
    });
    this.processedSentences = this.getProcessedSentences(
      this.processedSentences,
      true
    );
  }

  onSaveText() {
    this.saveText.emit(this.processedSentences);
  }
}
