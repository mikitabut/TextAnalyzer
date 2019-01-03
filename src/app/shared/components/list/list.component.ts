import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() data: any[];
  @Input() labels: string[];
  @Input() title: string;

  currentSortFlow = 1;

  constructor() { }

  ngOnInit() {}

  onSort(label: string) {
    this.currentSortFlow *= -1;
    this.data.sort((a, b) => a[label] < b[label] ? this.currentSortFlow : this.currentSortFlow * -1);
  }
}
