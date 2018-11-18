import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-changeable-value-editor',
  templateUrl: './changeable-value-editor.component.html',
  styleUrls: ['./changeable-value-editor.component.scss']
})
export class ChangeableValueEditorComponent implements OnInit {
  @Output() startEdit = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() resetChanges = new EventEmitter();

  editStarted = false;

  constructor() { }

  ngOnInit() {}

  onStartEdit() {
    this.editStarted = true;
    this.startEdit.emit();
  }

  onSave() {
    this.editStarted = false;
    this.save.emit();
  }

  onRemove() {
    this.editStarted = false;
    this.remove.emit();
  }

  onResetChanges() {
    this.editStarted = false;
    this.resetChanges.emit();
  }
}
