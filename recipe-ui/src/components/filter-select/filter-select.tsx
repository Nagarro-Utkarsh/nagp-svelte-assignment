import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';
import type { FilterChangeDetail } from './filter-select.types';

let instances = 0;

@Component({
  tag: 'filter-select',
  styleUrl: 'filter-select.css',
  shadow: true,
})
export class FilterSelect {
  private uid = `filter-select-${++instances}`;
  private triggerEl?: HTMLButtonElement;
  private searchEl?: HTMLInputElement;
  private listEl?: HTMLUListElement;
  private pendingFocus = false;

  @Element() host!: HTMLElement;

  @Prop() label = '';

  @Prop() value = '';

  @Prop() options = '';

  @Prop() anyLabel = 'Any';

  @Prop() searchable = true;

  @Prop() searchLabel = 'Type to filter options';

  @State() open = false;

  @State() search = '';

  @State() activeIndex = 0;

  @Event({ eventName: 'filter-change' }) filterChange!: EventEmitter<FilterChangeDetail>;

  @Listen('click', { target: 'document' })
  handleDocumentClick(e: MouseEvent) {
    if (this.open && !e.composedPath().includes(this.host)) this.close();
  }

  componentDidRender() {
    if (this.pendingFocus) {
      this.pendingFocus = false;
      (this.searchEl ?? this.listEl)?.focus();
    }

    const active = this.listEl?.children[this.activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest' });
  }

  private get all() {
    return this.options
      .split(',')
      .map(option => option.trim())
      .filter(Boolean);
  }

  private get visible() {
    const term = this.search.trim().toLowerCase();

    if (term) return this.all.filter(option => option.toLowerCase().includes(term));

    return this.anyLabel ? ['', ...this.all] : this.all;
  }

  private close(refocus = false) {
    this.open = false;
    this.search = '';
    this.activeIndex = 0;

    if (refocus) this.triggerEl?.focus();
  }

  private select(next: string) {
    const changed = next !== this.value;

    this.close(true);

    if (changed) this.filterChange.emit({ value: next });
  }

  private toggle = () => {
    if (this.open) {
      this.close();
      return;
    }

    this.search = '';
    this.activeIndex = Math.max(0, this.visible.indexOf(this.value));
    this.open = true;
    this.pendingFocus = true;
  };

  private handleSearch = (e: Event) => {
    this.search = (e.target as HTMLInputElement).value;
    this.activeIndex = 0;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const visible = this.visible;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(visible.length - 1, this.activeIndex + 1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(0, this.activeIndex - 1);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (visible.length) this.select(visible[this.activeIndex]);
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      this.close(e.key === 'Escape');
    }
  };

  render() {
    const visible = this.visible;
    const labelId = `${this.uid}-label`;
    const listId = `${this.uid}-list`;
    const activeId = visible.length ? `${this.uid}-option-${this.activeIndex}` : null;

    return (
      <Host>
        {this.label ? (
          <span class="label" id={labelId}>
            {this.label}
          </span>
        ) : null}

        <span class="wrap">
          <button
            type="button"
            class={{ trigger: true, 'trigger--set': Boolean(this.value) }}
            ref={el => (this.triggerEl = el)}
            aria-haspopup="listbox"
            aria-expanded={String(this.open)}
            aria-labelledby={this.label ? labelId : null}
            onClick={this.toggle}
          >
            <span class="trigger__text">{this.value || this.anyLabel}</span>

            <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {this.open ? (
            <div class="panel" onKeyDown={this.handleKeyDown}>
              {this.searchable ? (
                <input
                  type="text"
                  class="search"
                  ref={el => (this.searchEl = el)}
                  role="combobox"
                  value={this.search}
                  placeholder={this.searchLabel}
                  aria-label={this.searchLabel}
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  autocomplete="off"
                  onInput={this.handleSearch}
                />
              ) : null}

              {visible.length ? (
                <ul
                  class="list"
                  id={listId}
                  role="listbox"
                  tabindex={this.searchable ? undefined : -1}
                  aria-labelledby={this.label ? labelId : null}
                  aria-activedescendant={this.searchable ? null : activeId}
                  ref={el => (this.listEl = el)}
                >
                  {visible.map((option, index) => (
                    <li
                      key={option}
                      id={`${this.uid}-option-${index}`}
                      role="option"
                      class={{
                        option: true,
                        'option--active': index === this.activeIndex,
                        'option--selected': option === this.value,
                      }}
                      aria-selected={String(option === this.value)}
                      onClick={() => this.select(option)}
                      onMouseEnter={() => (this.activeIndex = index)}
                    >
                      {option || this.anyLabel}
                    </li>
                  ))}
                </ul>
              ) : (
                <p class="empty">
                  <slot name="empty">No matches</slot>
                </p>
              )}
            </div>
          ) : null}
        </span>
      </Host>
    );
  }
}
