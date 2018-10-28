import { Component, OnInit } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
@Component({
  selector: 'app-entry-page',
  templateUrl: './entry.page.html',
  styleUrls: ['./entry.page.scss']
})
export class EntryPageComponent {
  fileReader = new FileReader();

  words = [];
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

  constructor(private _FileSaverService: FileSaverService) {
    this.fileReader.onprogress = ev => {
      this.currentLoadProgress = (ev.loaded / ev.total) * 100;
    };

    this.fileReader.onload = ev => {
      this.words = [
        ...this.words,
        ...(this.fileReader.result as string)
          .split(/[ \.\,\n\t\r\d]/)
          .map(element => element.trim())
          .filter(word => word.length > 0)
          .map(word => ({
            word,
            filename: this.currentFile.name,
            text: this.fileReader.result
          }))
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
      this.currentFile = currentFile;
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

  onRemoveWord(wordProperties: {
    oldWord: string;
    word: string;
    files: { filename: string; text: string }[];
  }) {
    wordProperties.files.map(fileProp => {
      const replace = wordProperties.oldWord;
      const re = new RegExp(replace, 'g');
      const newText = fileProp.text.replace(
        re,
        wordProperties.word
      );
      this._FileSaverService.saveText(newText, fileProp.filename);
    });
  }
}
