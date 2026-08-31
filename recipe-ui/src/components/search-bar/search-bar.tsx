import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import type { SearchInputDetail, SearchSubmitDetail } from './search-bar.types';

@Component({
  tag: 'search-bar',
  styleUrl: 'search-bar.css',
  shadow: true,
})
export class SearchBar {
  @Prop() value = '';

  @Prop() placeholder = 'Search recipes…';

  @Prop() label = 'Search recipes';

  @Event({ eventName: 'search-input' }) searchInput!: EventEmitter<SearchInputDetail>;

  @Event({ eventName: 'search-submit' }) searchSubmit!: EventEmitter<SearchSubmitDetail>;

  @Event({ eventName: 'search-clear' }) searchClear!: EventEmitter<void>;

  private handleInput = (e: Event) => {
    this.searchInput.emit({ value: (e.target as HTMLInputElement).value });
  };

  private handleSubmit = (e: Event) => {
    e.preventDefault();
    this.searchSubmit.emit({ value: this.value });
  };

  private handleClear = () => {
    this.searchClear.emit();
  };

  render() {
    return (
      <Host>
        <form class="bar" onSubmit={this.handleSubmit} role="search">
          <label class="visually-hidden" htmlFor="search-bar-input">
            {this.label}
          </label>

          <span class="field">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>

            <input
              id="search-bar-input"
              type="search"
              class="input"
              value={this.value}
              placeholder={this.placeholder}
              autocomplete="off"
              onInput={this.handleInput}
            />

            {this.value ? (
              <button type="button" class="clear" onClick={this.handleClear} aria-label="Clear search">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            ) : null}
          </span>

          <button type="submit" class="submit">
            Search
          </button>
        </form>

        <div class="filters">
          <slot name="filters" />
        </div>
      </Host>
    );
  }
}
