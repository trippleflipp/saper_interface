import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rules-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Правила Зоны Отчуждения</h2>
      <div class="rules-scroll-container">
        <div class="rules-content">
          <div class="rules-section">
            <h3>Ты — сталкер Чернобыльской Зоны.</h3>
            <p>Твоя цель — пройти поле, не попав в аномалию.
            Один неверный шаг — и ты станешь очередной легендой Зоны, как Чёрный Сталкер.
            Зона скрывает смерть под плитами.
            Кликай левой кнопкой, чтобы проверить клетку.
            Если повезёт — увидишь цифру. Если не повезёт… ну, ты понял.</p>
          </div>

          <div class="rules-section">
            <p>Цифры — это количество аномалий вокруг.
            Число на плитке показывает, сколько аномалий рядом.
            "1" — одна аномалия в соседних клетках, "3" — три, и так далее.
            Не игнорируй знаки, иначе тебя разнесёт в клочья.</p>
          </div>

          <div class="rules-section">
            <p>Болт — твой спаситель от слепой смерти.
            Если чуешь, что под клеткой аномалия — жми правую кнопку и кидай болт.
            Это как пометить вход в "Выверт". Но если ошибёшься — Зона накажет.</p>
          </div>

          <div class="rules-section">
            <p>Прошёл всё поле? Не радуйся. Зона всегда ждёт нового подвига.
            Нажми "Новая игра" — и снова в бой, сталкер.</p>
          </div>

          <h3>Совет от бывалого:</h3>
          <div class="rules-section">
            <p>Начинай с малого — лёгкий уровень (маленькое поле, мало аномалий).
            Потом уже лезь в Радар или ЧАЭС.
            Удачи. И помни: Зона не прощает ошибок.</p>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button mat-button (click)="closeDialog()">Закрыть</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #1a1a1a;
    }
    .dialog-title {
      color: rgb(255, 187, 1) !important;
      font-size: 30px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .rules-scroll-container {
      flex: 1;
      overflow: hidden;
      margin: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .rules-content {
      height: 100%;
      overflow-y: auto;
      padding: 0 20px;
      color: white;
      font-size: 18px;
    }
    h3 {
      color: rgb(255, 187, 1);
      margin-top: 20px;
      font-size: 22px;
    }
    .rules-section {
      margin: 20px 0;
    }
    p {
      margin: 12px 0;
      line-height: 1.6;
      text-indent: 20px;
    }
    .dialog-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background-color: #1a1a1a;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    ::ng-deep .mat-mdc-dialog-actions {
      .mat-mdc-button {
        background-color: rgba(255, 187, 1, 0.1);
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: rgba(100, 181, 246, 0.1);
          transform: scale(1.05);
        }
        
        &:active {
          transform: scale(0.95);
          background-color: rgba(100, 181, 246, 0.2);
        }
        
        &:focus {
          outline: 2px solid #64b5f6;
          outline-offset: 2px;
        }
      }
    }
  `]
})
export class RulesDialogComponent {
  constructor(private dialogRef: MatDialogRef<RulesDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
} 