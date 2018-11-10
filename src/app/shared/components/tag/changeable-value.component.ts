import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { emptyValue } from '../../constants/common';

@Component({
  selector: 'app-changeable-value',
  templateUrl: './changeable-value.component.html',
  styleUrls: ['./changeable-value.component.scss']
})
export class ChangeableValueComponent implements OnInit {
  @Input() value: string;
  @Input() title = 'Some title';
  @Input() placeholder = 'Set new value';

  @Output() valueChange = new EventEmitter();

  emptyValue = emptyValue;
  currentValue: string;
  showContextMenu = false;
  editStarted = false;

  constructor() {}

  ngOnInit() {
    this.currentValue = this.value;
  }

  onClick() {
    this.showContextMenu = !this.showContextMenu;
  }

  onStartEdit() {
    this.editStarted = true;
  }

  onSave() {
    if (this.currentValue !== this.value) {
      this.valueChange.emit(this.currentValue);
      this.currentValue = this.value;
    }
    this.showContextMenu = !this.showContextMenu;
    this.editStarted = false;
  }

  onRemove() {
    this.showContextMenu = !this.showContextMenu;
    this.editStarted = false;
    this.valueChange.emit();
  }

  onResetChanges() {
    this.showContextMenu = !this.showContextMenu;
    this.currentValue = this.value;
    this.editStarted = false;
  }

  onCurrentTagChange(newValue: string) {
    this.currentValue = newValue;
  }
}
