import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
@Component({
  selector: 'app-entry-page',
  templateUrl: './entry.page.html',
  styleUrls: ['./entry.page.scss']
})
export class EntryPageComponent {
  fileReader = new FileReader();
  dictReader = new FileReader();

  words = [];
  dictionary = '';
  legend = `CC Coord Conjuncn and,but,or
  CD Cardinal number one,two
  DT Determiner the,some
  EX Existential there there
  FW Foreign Word mon dieu
  IN Preposition of,in,by
  JJ Adjective big
  JJR Adj., comparative bigger
  JJS Adj., superlative biggest
  LS List item marker 1,One
  MD Modal can,should
  NN Noun, sing. or mass dog
  NNP Proper noun, sing. Edinburgh
  NNPS Proper noun, plural Smiths
  NNS Noun, plural dogs
  POS Possessive ending Õs
  PDT Predeterminer all, both
  PP$ Possessive pronoun my,oneÕs
  PRP Personal pronoun I,you,she
  RB Adverb quickly
  RBR Adverb, comparative faster
  RBS Adverb, superlative fastest
  RP Particle up,off
  SYM Symbol +,%,&
  TO ÒtoÓ to
  UH Interjection oh, oops
  VB verb, base form eat
  VBD verb, past tense ate
  VBG verb, gerund eating
  VBN verb, past part eaten
  VBP Verb, present eat
  VBZ Verb, present eats
  WDT Wh-determiner which,that
  WP Wh pronoun who,what
  WP$ Possessive-Wh whose
  WRB Wh-adverb how,where
  , Comma ,
  . Sent-final punct . ! ?
  : Mid-sent punct. : ; Ñ
  $ Dollar sign $
  # Pound sign #
  " quote "
  ( Left paren (
  ) Right paren )`;

  files: File[] = [];
  currentLoadProgress = 0;
  currentFile: File;
  dictFile: any;

  constructor(private _FileSaverService: FileSaverService, private cdr: ChangeDetectorRef) {
    this.fileReader.onload = () => {
      this.dictionary = null;
      this.words = [
        ...(this.fileReader.result as string)
          .split(/[ \!\?\_\-\.\,\;\"\]\[\)\(\`\:\’\‘\s\n\t\r\d]/)
          .map(element => element.trim())
          .filter(word => word.length > 0)
          .map(word => ({
            word: word.toLowerCase(),
            filename: this.currentFile.name,
            text: this.fileReader.result
          }))
      ];
    };
    this.dictReader.onload = () => {
      this.dictionary = this.dictReader.result as string;
      this.onClearLoadedTexts();
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
}
