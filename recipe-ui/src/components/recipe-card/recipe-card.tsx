import { Component, Event, EventEmitter, Host, Prop, h } from "@stencil/core";
import type { CardOpenDetail, FavoriteToggleDetail } from "./recipe-card.types";

@Component({
  tag: "recipe-card",
  styleUrl: "recipe-card.css",
  shadow: true,
})
export class RecipeCard {
  @Prop() recipeId!: string;

  @Prop() name!: string;

  @Prop() image?: string;

  @Prop() category?: string;

  @Prop() area?: string;

  @Prop() isFavorite = false;

  @Prop() isOwned = false;

  @Event({ eventName: "favorite-toggle" })
  favoriteToggle!: EventEmitter<FavoriteToggleDetail>;

  @Event({ eventName: "card-open" }) cardOpen!: EventEmitter<CardOpenDetail>;

  private handleFavorite = () => {
    this.favoriteToggle.emit({
      recipeId: this.recipeId,
      isFavorite: !this.isFavorite,
    });
  };

  private handleOpen = () => {
    this.cardOpen.emit({ recipeId: this.recipeId });
  };

  render() {
    return (
      <Host>
        <article class="card">
          <button
            type="button"
            class="open"
            onClick={this.handleOpen}
            aria-label={`View recipe: ${this.name}`}
          >
            <span class="media">
              {this.image ? (
                <img src={this.image} alt="" loading="lazy" decoding="async" />
              ) : (
                <span class="media__empty" aria-hidden="true">
                  No image
                </span>
              )}
            </span>

            <span class="body">
              <span class="title">{this.name}</span>

              <span class="meta">
                {this.category ? (
                  <span class="chip chip--category">{this.category}</span>
                ) : null}
                {this.area ? (
                  <span class="chip chip--area">{this.area}</span>
                ) : null}
                {this.isOwned ? (
                  <span class="chip chip--owned">Yours</span>
                ) : null}
              </span>
            </span>
          </button>

          <button
            type="button"
            class={{ fav: true, "fav--active": this.isFavorite }}
            onClick={this.handleFavorite}
            aria-pressed={this.isFavorite ? "true" : "false"}
            aria-label={
              this.isFavorite
                ? `Remove ${this.name} from favorites`
                : `Add ${this.name} to favorites`
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 20.5 4.6 13.3a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.6.6.6-.6a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z" />
            </svg>
          </button>

          <span class="actions">
            <slot name="actions" />
          </span>
        </article>
      </Host>
    );
  }
}
