import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import type { SlotAddDetail } from './meal-slot.types';

@Component({
  tag: 'meal-slot',
  styleUrl: 'meal-slot.css',
  shadow: true,
})
export class MealSlot {
  @Prop() day!: string;

  @Prop() slotLabel!: string;

  @Prop() isEmpty = false;

  @Prop() addLabel = 'Add meal';

  @Event({ eventName: 'slot-add' }) slotAdd!: EventEmitter<SlotAddDetail>;

  private handleAdd = () => {
    this.slotAdd.emit({ day: this.day, slotLabel: this.slotLabel });
  };

  render() {
    return (
      <Host>
        <section class="slot" aria-label={`${this.slotLabel}, ${this.day}`}>
          <header class="head">
            <span class="slot-label">{this.slotLabel}</span>
            <button type="button" class="add" onClick={this.handleAdd}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {this.addLabel}
            </button>
          </header>

          <div class="meals">
            {this.isEmpty ? <p class="empty">Nothing planned yet.</p> : null}
            <slot />
          </div>
        </section>
      </Host>
    );
  }
}
