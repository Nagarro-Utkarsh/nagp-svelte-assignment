import { Component, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import type { ConfirmDialogTone } from './confirm-dialog.types';

@Component({
  tag: 'confirm-dialog',
  styleUrl: 'confirm-dialog.css',
  shadow: true,
})
export class ConfirmDialog {
  @Prop() open = false;

  @Prop() heading = 'Are you sure?';

  @Prop() confirmLabel = 'Confirm';

  @Prop() cancelLabel = 'Cancel';

  @Prop() tone: ConfirmDialogTone = 'default';

  @Event({ eventName: 'dialog-confirm' }) dialogConfirm!: EventEmitter<void>;

  @Event({ eventName: 'dialog-cancel' }) dialogCancel!: EventEmitter<void>;

  private dialog?: HTMLDialogElement;

  @Watch('open')
  syncOpen(open: boolean) {
    this.toggleDialog(open);
  }

  componentDidLoad() {
    if (this.open) {
      this.toggleDialog(true);
    }
  }

  private toggleDialog(open: boolean) {
    if (!this.dialog) return;

    if (open && !this.dialog.open) {
      this.dialog.showModal();
    } else if (!open && this.dialog.open) {
      this.dialog.close();
    }
  }

  private handleCancel = (e: Event) => {
    e.preventDefault();
    this.dialogCancel.emit();
  };

  private handleBackdropClick = (e: MouseEvent) => {
    if (e.target === this.dialog) {
      this.dialogCancel.emit();
    }
  };

  render() {
    return (
      <Host>
        <dialog
          class="backdrop"
          ref={el => (this.dialog = el as HTMLDialogElement)}
          onCancel={this.handleCancel}
          onClick={this.handleBackdropClick}
          aria-label={this.heading}
        >
          <div class={{ panel: true, 'panel--danger': this.tone === 'danger' }}>
            <h2 class="heading">{this.heading}</h2>

            <div class="body">
              <slot />
            </div>

            <footer class="foot">
              <button type="button" class="cancel" onClick={() => this.dialogCancel.emit()}>
                {this.cancelLabel}
              </button>
              <button type="button" class="confirm" onClick={() => this.dialogConfirm.emit()}>
                {this.confirmLabel}
              </button>
            </footer>
          </div>
        </dialog>
      </Host>
    );
  }
}
