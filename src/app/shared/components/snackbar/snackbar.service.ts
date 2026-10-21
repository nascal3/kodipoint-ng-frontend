import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  open(message: string, action = 'Dismiss', config: MatSnackBarConfig = {}): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...config,
    });
  }

  error(message: string, action = 'Dismiss', config: MatSnackBarConfig = {}): void {
    this.openWithStyle(message, 'app-snackbar--error', action, config);
  }

  success(message: string, action = 'Dismiss', config: MatSnackBarConfig = {}): void {
    this.openWithStyle(message, 'app-snackbar--success', action, config);
  }

  warning(message: string, action = 'Dismiss', config: MatSnackBarConfig = {}): void {
    this.openWithStyle(message, 'app-snackbar--warning', action, config);
  }

  private openWithStyle(
    message: string,
    styleClass: string,
    action: string,
    config: MatSnackBarConfig,
  ): void {
    const existingClasses = config.panelClass
      ? Array.isArray(config.panelClass)
        ? config.panelClass
        : [config.panelClass]
      : [];

    this.open(message, action, {
      ...config,
      panelClass: [...existingClasses, styleClass],
    });
  }
}
