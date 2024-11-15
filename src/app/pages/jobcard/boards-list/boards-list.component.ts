import { Component, OnDestroy, OnInit } from '@angular/core';
import { Board } from '../services/board.model';
import { BoardLiveService } from '../services/boardLive.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { BoardDialogComponent } from '../dialogs/board-dialog/board-dialog.component';
import { BoardComponent } from "../board/board.component";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BoardService } from '../services/board.service';

@Component({
  selector: 'app-boards-list',
  standalone: true,
  imports: [BoardComponent, MatIconModule, DragDropModule, CommonModule],
  templateUrl: './boards-list.component.html',
  styleUrls: ['./boards-list.component.css'],
})
export class BoardsListComponent implements OnInit {
  boards: Board[] = [];
  // subscription: Subscription = new Subscription();
  companyId: string = "";

  constructor(private boardLiveService: BoardLiveService, private boardService: BoardService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.companyId = localStorage.getItem('companyId')!;
    this.loadBoards(this.companyId);
  }

  loadBoards(companyId: string) {
    this.boardService.getBoards(companyId).subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Filtered Boards:', this.boards);
      },
      error: (err) => {
        console.error('Error fetching boards:', err);
      },
    });
  }



  drop(event: CdkDragDrop<Board[]>): void {
    moveItemInArray(this.boards, event.previousIndex, event.currentIndex);
    this.boardLiveService.sortBoards(this.boards);
  }

  openBoardDialog(): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardLiveService.createBoard({
          title: result,
          companyId: this.companyId
        }).subscribe({
          next: (newBoard) => {
            this.boards.push(newBoard);
            console.log('Board created successfully:', newBoard);
          },
          error: (err) => console.error('Error creating board:', err)
        });
      }
    });
  }


}