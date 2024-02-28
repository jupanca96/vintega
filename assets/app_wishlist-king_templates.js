const imagesHideLoader = () => {
  setTimeout(() => {
    const wkImage =
      document.querySelector(
        `.account-wishlist-grid .product-card[data-id] .product-card--head-images`
      );
    if(!wkImage) return;

    wkImage.dataset.load = "true";
  }, 500);
}

const templates = [
  {
    id: 'wishlist-link',
    data: 'wishlist',
    template: `
      <a href="{{ wishlist.url }}" class="wk-link wk-link--{{ wishlist.state }}" title="{{ locale.view_wishlist }}">
        <div class="wk-icon wk-link__icon">{% include "wishlist-icon" %}</div>
        <span class="wk-link__label">{{ locale.wishlist }}</span>
        <span class="wk-link__count">{{ wishlist.item_count }}</span>
      </a>
    `,
  },
  {
    id: 'wishlist-button',
    data: 'product',
    events: {
      'click button[data-wk-add-product]': (event) => {
        event.preventDefault();
        event.stopPropagation();

        const variantInput = document.querySelector("form *[name='id']");
        const variantId = variantInput ? variantInput.value : undefined;

        WishlistKing.toolkit.addProduct(
          event.currentTarget.getAttribute('data-wk-add-product'),
          variantId
        );

        imagesHideLoader();
      },
      'click button[data-wk-remove-product]': (event) => {
        event.preventDefault();
        event.stopPropagation();

        WishlistKing.toolkit.removeProduct(
          event.currentTarget.getAttribute('data-wk-remove-product')
        );

        imagesHideLoader();
      },
      'click button[data-wk-remove-item]': (event) => {
        event.preventDefault();
        event.stopPropagation();

        WishlistKing.toolkit.removeItem(
          event.currentTarget.getAttribute('data-wk-remove-item')
        );

        imagesHideLoader();
      },
    },
    template: `
      {% if product.in_wishlist %}
        {% assign btn_text = locale.in_wishlist %}
        {% assign btn_title = locale.remove_from_wishlist %}
        {% assign btn_action = 'remove' %}
      {% else %}
        {% assign btn_text = locale.add_to_wishlist %}
        {% assign btn_title = locale.add_to_wishlist %}
        {% assign btn_action = 'add' %}
      {% endif %}
      {% assign scope = "product" %}
      {% assign targetId = product.id %}
      {% assign icon_name = "wishlist-icon" %}
      {% if itemId %}
      {% assign scope = "item" %}
      {% assign targetId = itemId %}
      {% assign icon_name = "remove-icon" %}
      {% endif %}
      <button type="button" class="wk-button wk-button--{{ btn_action }} {{ addClass }}" title="{{ btn_title }}" data-wk-{{ btn_action }}-{{ scope }}="{{ targetId }}">
        <div class="wk-icon wk-button__icon">{% include icon_name %}</div>
        <span class="wk-button__label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: 'wishlist-button-floating',
    data: 'product',
    template: `
      {% include "wishlist-button" addClass: "wk-button--floating" %}
    `,
  },
  {
    id: 'wishlist-page',
    data: 'wishlist',
    events: {
      'click a[data-wk-share]': (event) => {
        event.preventDefault();
        event.stopPropagation();

        WishlistKing.toolkit.requestWishlistSharing({
          wkShareService: event.currentTarget.getAttribute(
            'data-wk-share-service'
          ),
          wkShare: event.currentTarget.getAttribute('data-wk-share'),
          wkShareImage: event.currentTarget.getAttribute('data-wk-share-image'),
        });
      },
    },
    template: `
      <div class='wk-page {% if wishlist.read_only %}wk-page--shared{% endif %} {% if wishlist.item_count == 0 %}wk-page--empty{% endif %}' data-count={{ wishlist.item_count }}>
      {% if wishlist.item_count == 0 %}
          <div class="wk-note wk-note__list-empty">
            <p>{{ locale.wishlist_empty_note }}</p>
          </div>
      {% else %}
        {% if customer == null and wishlist.read_only == false %}
          <div class="wk-note wk-note__login">
            <p>{{ locale.login_or_signup_note }}</p>
          </div>
        {% endif %}
        <div>
          <div class="account-wishlist-grid">
            {% assign item_count = 0 %}
            {% assign products = wishlist.products | reverse %}
            {% for product in products %}
              {% assign item_count = item_count | plus: 1 %}
              {% unless limit and item_count > limit %}

                {% assign variant = product.selected_or_first_available_variant %}
                {% assign current_variant = product.selected_or_first_available_variant %}

                {% if variant.price < variant.compare_at_price %}
                  {% assign onsale = true %}
                {% else %}
                  {% assign onsale = false %}
                {% endif %}
                  <div
                    class="product-card {% if onsale %}wk-product--sale{% endif %} {% unless current_variant.available %}out-of-stock{% endunless %}" data-id="{{ product.id }}" data-wk-item="{{ product.wishlist_item_id }}"
                  >
                    {% unless wishlist.read_only %}
                      {% include "wishlist-button-floating" itemId: product.wishlist_item_id %}
                    {% else %}
                      {% include "wishlist-button-floating" product: product %}
                    {% endunless %}

                    {% if variant != blank %}
                      {% assign current_variant = variant %}
                    {% endif %}
                    {% assign image_feature = product.featured_image | image_url: width: 400 %}
                    {% assign image_second = product.images[1] | image_url: width: 400 %}
                    {% if current_variant.compare_at_price == current_variant.price %}
                      {% assign hide_price = 'hidden' %}
                    {% endif %}
                    {% comment %}
                    <a href="{{ product | variant_url }}" class="wk-product-image" title="{{ locale.view_product }}" style="background-image: url({{ product | variant_img_url: '1000x' }})"></a>
                    {% endcomment %}

                    {% if item_count == 1 %}
                      {% assign data_load = 'false' %}
                    {% else %}
                      {% assign data_load = 'true' %}
                    {% endif %}

                    <a title="{{ product.title }}" class="product-card--head" href="{{ product | variant_url }}">
                      <div
                        class="product-card--head-images product-wishlist-image"
                        data-load="{{ data_load }}"
                      >
                        <img
                          class="product-card__image-2 blur-up lazyautosizes lazyloaded"
                          loading="lazy"
                          title="{{ alt | default: 'Image to render' }}"
                          data-sizes="auto"
                          src="{{ product.images[1].src }}"
                          alt="{{ product.alt | default: 'Image to render' }}"
                          width="100"
                          height="100"
                        />
                        <img
                          class="product-card__image-1 blur-up lazyautosizes lazyloaded"
                          loading="lazy"
                          title="{{ alt | default: 'Image to render' }}"
                          data-sizes="auto"
                          src="{{ product.featured_image.src }}"
                          data-srcset="{{ product.featured_image.src }}"
                          alt="{{ product.alt | default: 'Image to render' }}"
                          width="100"
                          height="100"
                        />
                      </div>

                      <div class="wk-product-info product-card--head-info">
                        {% if product.vendor != blank %}
                          <span class="product-card__brand">
                            {{ product.vendor }}
                          </span>
                        {% endif %}
                        <span class="product-card__title">
                          {{ product.title }}
                        </span>

                        {% for tag in product.tags %}
                          {% if tag contains 'Etat_' %}
                            <span class="product-card__condition">
                              {{ locale.condition }}:
                              {{ tag | remove: "Etat_" | replace: "-", " " | capitalize }}
                            </span>
                          {% endif %}
                        {% endfor %}

                        <div class="product price price-product-js">
                          {% if current_variant.price < current_variant.compare_at_price %}
                            <span class="compare {{ hide_price }}">
                              {{ current_variant.compare_at_price | money -}}
                            </span>
                          {% endif %}
                          <span class="regular">
                            {{ current_variant.price | money -}}
                          </span>
                        </div>
                      </div>
                    </a>
                    {% include "wishlist-product-form" %}
                  </div>
              {% endunless %}
            {% endfor %}
          </div>
        </div>
        {% comment %}
        {% include "wishlist-button-bulk-add-to-cart" %}
        {% endcomment %}
        {% comment %}
        {% unless wishlist.read_only %}
          {% include "wishlist-button-clear" %}
        {% endunless %}
        {% endcomment %}

        {% comment %}
        {% unless wishlist.read_only %}
          <div class="wk-sharing">
            <h4 class="wk-title">{{ locale.share_wishlist }}</h4>
            <ul class="wk-sharing__list">
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-fb" %}</li>
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-twitter" %}</li>
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-email" %}</li>
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-link" %}</li>
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-whatsapp" %}</li>
              <li class="wk-sharing__list-item">{% include "wishlist-share-button-contact" %}</li>
            </ul>
            <div class="wk-sharing__link wk-sharing__link--hidden"><span class="wk-sharing__link-text"></span><button class="wk-sharing__link__copy-button" data-clipboard-target=".wk-sharing__link-text">{{ locale.copy_share_link }}</button></div>
          </div>
        {% endunless %}
        {% endcomment %}
      {% endif %}
      </div>
    `,
  },
  {
    id: 'wishlist-product-form',
    events: {
      'render .wk-product-form': (form) => {
        const container = form.closest('[data-wk-item]');
        const itemId = container.getAttribute('data-wk-item');
        WishlistKing.toolkit.getItem(itemId).then((product) => {
          WishlistKing.toolkit.initProductForm(form, product, {
            // NOTE: Uncomment to override default option change
            // onOptionChange: (event) => {
            //   console.log(event.dataset);
            // },
            // NOTE: Uncomment to override default form submit
            onFormSubmit: (event) => {
              event.preventDefault();
              event.stopPropagation();
              sessionStorage.setItem(
                'sidebar-clicked',
                JSON.stringify({
                  id: 'my-wishlist',
                  index: 2,
                })
              );
            },
          });
        });
      },
    },
    template: `
      <form class="wk-product-form" action="/cart/add" method="post">
        {% assign current_variant = product.selected_or_first_available_variant %}
        <div class="wk-product-form__options">
          <input name="id" value="{{ current_variant.id }}" type="hidden">
          {% comment %}
          {% unless product.has_only_default_variant %}
            {% for option in product.options_with_values %}
              <div class="wk-product-form__option">
                <label class="wk-product-form__option__label" for="Option{{ option.position }}">
                  {{ option.name }}
                </label>
                <select class="wk-product-form__option__select" name="options[{{ option.name | escape }}]">
                  {% for value in option.values %}
                    <option value="{{ value | escape }}" {% if option.selected_value == value %}selected="selected"{% endif %} {% if option.soldout_values contains value %}disabled{% endif %}>
                      {{ value }}
                    </option>
                  {% endfor %}
                </select>
              </div>
            {% endfor %}
          {% endunless %}
          {% endcomment %}
          {% comment %}
          <div class="wk-product-form__quantity">
            <label class="wk-product-form__quantity__label" for="Quantity">{{ locale.quantity }}</label>
            <input class="wk-product-form__quantity__input" type="number" name="quantity" value="1" min="1">
          </div>
          {% endcomment %}
        </div>
        <button type="submit" class="btn-1" data-wk-add-to-cart="{{ product.wishlist_item_id }}" {% unless current_variant.available %}disabled{% endunless %}>
          {% if current_variant.available %}{{ locale.add_to_cart }}{% else %}{{ locale.sold_out }}{% endif %}
        </button>
      </form>
    `,
  },
  {
    id: 'wishlist-page-shared',
    data: 'shared_wishlist',
    template: `
      {% assign wishlist = shared_wishlist %}
      {% include "wishlist-page" with wishlist %}
    `,
  },
  {
    id: 'wishlist-button-bulk-add-to-cart',
    data: 'wishlist',
    events: {
      'click button[data-wk-bulk-add-to-cart]': (event) => {
        WishlistKing.toolkit.requestAddAllToCart(
          event.currentTarget.getAttribute('data-wk-bulk-add-to-cart')
        );
      },
    },
    template: `
      {% assign btn_text = locale.add_all_to_cart %}
      {% assign btn_title = locale.add_all_to_cart %}
      <button type="button" class="wk-button-bulk-add-to-cart" title="{{ btn_title }}" data-wk-bulk-add-to-cart="{{ wishlist.permaId }}">
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: 'wishlist-button-clear',
    data: 'wishlist',
    events: {
      'click button[data-wk-clear-wishlist]': (event) => {
        WishlistKing.toolkit.clear(
          event.currentTarget.getAttribute('data-wk-clear-wishlist')
        );
      },
    },
    template: `
      {% assign btn_text = locale.clear_wishlist %}
      {% assign btn_title = locale.clear_wishlist %}
      <button type="button" class="wk-button-wishlist-clear" title="{{ btn_title }}" data-wk-clear-wishlist="{{ wishlist.permaId }}">
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: 'wishlist-icon',
    template: `
      <defs>
        <style>
          #wishlist_icon path:first-child {
          stroke: currentColor;
          stroke-width: 35px;
        }
        </style>
      </defs>
      <svg id="wishlist_icon" class="wk-icon__svg" width="100%" height="100%" viewBox="0 0 800 800" version="1.1">
        <path d="m576.03,41.18c-33.3,0-66.59,8.56-96.25,24.74-29.63,16.18-55.79,40.04-75.65,69l-4.13,6.02-4.12-6.02c-19.86-28.96-46.02-52.82-75.66-69-29.66-16.18-62.94-24.74-96.25-24.74-118.12,0-214.22,104.3-214.22,232.5,0,109.31,66.97,227.58,193.67,342.01,95.03,85.83,188.47,138.62,192.41,140.83l4.13,2.31,4.15-2.27c3.94-2.16,97.46-53.88,192.45-139.08,126.71-113.67,193.69-232.55,193.69-343.8,0-128.2-96.1-232.5-214.22-232.5Z"/>
        <path fill="currentColor" d="m707.26,302.11c0,4.71-3.83,8.54-8.54,8.54s-8.54-3.83-8.54-8.54c0-90.5-67.3-164.12-150.02-164.12-4.71,0-8.54-3.83-8.54-8.54s3.83-8.54,8.54-8.54c92.14,0,167.1,81.29,167.1,181.2Z"/>
        <path fill="currentColor" d="m411.89,651.28c-1.51,2.69-4.36,4.36-7.45,4.36-1.45,0-2.89-.38-4.17-1.09-4.15-2.33-102.64-58.05-186.07-145.03-3.26-3.39-3.15-8.81.25-12.07,1.6-1.53,3.7-2.38,5.91-2.38,2.35,0,4.54.94,6.16,2.63,81.44,84.89,181.11,141.39,182.11,141.95,4.1,2.31,5.57,7.52,3.26,11.63Z"/>
      </svg>
    `,
  },
  {
    id: 'remove-icon',
    template: `
      <svg class="wk-icon__svg" width="100%" height="100%" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <path vector-effect="non-scaling-stroke" d="M0.309,0.309a0.9,0.9,0,0,1,1.268,0L63.691,62.423a0.9,0.9,0,0,1-1.268,1.268L0.309,1.577A0.9,0.9,0,0,1,.309.309Z"/>
        <path vector-effect="non-scaling-stroke" d="M63.691,0.309a0.9,0.9,0,0,1,0,1.268L1.577,63.691A0.9,0.9,0,0,1,.309,62.423L62.423,0.309A0.9,0.9,0,0,1,63.691.309Z"/>
      </svg>
    `,
  },
  {
    id: 'wishlist-share-button-fb',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.share_on_facebook }}" data-wk-share-service="facebook" data-wk-share="{{ wishlist.permaId }}">
        <svg version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24">
          <path fill="currentColor" d="M18.768,7.465H14.5V5.56c0-0.896,0.594-1.105,1.012-1.105s2.988,0,2.988,0V0.513L14.171,0.5C10.244,0.5,9.5,3.438,9.5,5.32 v2.145h-3v4h3c0,5.212,0,12,0,12h5c0,0,0-6.85,0-12h3.851L18.768,7.465z"/>
        </svg>
      </a>
    `,
  },
  {
    id: 'wishlist-share-button-twitter',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.share_on_twitter }}" data-wk-share-service="twitter" data-wk-share="{{ wishlist.permaId }}">
        <svg version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24">
        <path fill="currentColor" d="M23.444,4.834c-0.814,0.363-1.5,0.375-2.228,0.016c0.938-0.562,0.981-0.957,1.32-2.019c-0.878,0.521-1.851,0.9-2.886,1.104 C18.823,3.053,17.642,2.5,16.335,2.5c-2.51,0-4.544,2.036-4.544,4.544c0,0.356,0.04,0.703,0.117,1.036 C8.132,7.891,4.783,6.082,2.542,3.332C2.151,4.003,1.927,4.784,1.927,5.617c0,1.577,0.803,2.967,2.021,3.782 C3.203,9.375,2.503,9.171,1.891,8.831C1.89,8.85,1.89,8.868,1.89,8.888c0,2.202,1.566,4.038,3.646,4.456 c-0.666,0.181-1.368,0.209-2.053,0.079c0.579,1.804,2.257,3.118,4.245,3.155C5.783,18.102,3.372,18.737,1,18.459 C3.012,19.748,5.399,20.5,7.966,20.5c8.358,0,12.928-6.924,12.928-12.929c0-0.198-0.003-0.393-0.012-0.588 C21.769,6.343,22.835,5.746,23.444,4.834z"/>
        </svg>
      </a>
    `,
  },
  {
    id: 'wishlist-share-button-whatsapp',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.share_with_whatsapp }}" data-wk-share-service="whatsapp" data-wk-share="{{ wishlist.permaId }}">
        <svg xmlns="https://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
          <path fill="currentColor" stroke="none" d="M20.1,3.9C17.9,1.7,15,0.5,12,0.5C5.8,0.5,0.7,5.6,0.7,11.9c0,2,0.5,3.9,1.5,5.6l-1.6,5.9l6-1.6c1.6,0.9,3.5,1.3,5.4,1.3l0,0l0,0c6.3,0,11.4-5.1,11.4-11.4C23.3,8.9,22.2,6,20.1,3.9z M12,21.4L12,21.4c-1.7,0-3.3-0.5-4.8-1.3l-0.4-0.2l-3.5,1l1-3.4L4,17c-1-1.5-1.4-3.2-1.4-5.1c0-5.2,4.2-9.4,9.4-9.4c2.5,0,4.9,1,6.7,2.8c1.8,1.8,2.8,4.2,2.8,6.7C21.4,17.2,17.2,21.4,12,21.4z M17.1,14.3c-0.3-0.1-1.7-0.9-1.9-1c-0.3-0.1-0.5-0.1-0.7,0.1c-0.2,0.3-0.8,1-0.9,1.1c-0.2,0.2-0.3,0.2-0.6,0.1c-0.3-0.1-1.2-0.5-2.3-1.4c-0.9-0.8-1.4-1.7-1.6-2c-0.2-0.3,0-0.5,0.1-0.6s0.3-0.3,0.4-0.5c0.2-0.1,0.3-0.3,0.4-0.5c0.1-0.2,0-0.4,0-0.5c0-0.1-0.7-1.5-1-2.1C8.9,6.6,8.6,6.7,8.5,6.7c-0.2,0-0.4,0-0.6,0S7.5,6.8,7.2,7c-0.3,0.3-1,1-1,2.4s1,2.8,1.1,3c0.1,0.2,2,3.1,4.9,4.3c0.7,0.3,1.2,0.5,1.6,0.6c0.7,0.2,1.3,0.2,1.8,0.1c0.6-0.1,1.7-0.7,1.9-1.3c0.2-0.7,0.2-1.2,0.2-1.3C17.6,14.5,17.4,14.4,17.1,14.3z"/>
        </svg>
      </a>
    `,
  },
  {
    id: 'wishlist-share-button-email',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.share_by_email }}" data-wk-share-service="email" data-wk-share="{{ wishlist.permaId }}">
        <svg version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24"">
          <path fill="currentColor" d="M22,4H2C0.897,4,0,4.897,0,6v12c0,1.103,0.897,2,2,2h20c1.103,0,2-0.897,2-2V6C24,4.897,23.103,4,22,4z M7.248,14.434 l-3.5,2C3.67,16.479,3.584,16.5,3.5,16.5c-0.174,0-0.342-0.09-0.435-0.252c-0.137-0.239-0.054-0.545,0.186-0.682l3.5-2 c0.24-0.137,0.545-0.054,0.682,0.186C7.571,13.992,7.488,14.297,7.248,14.434z M12,14.5c-0.094,0-0.189-0.026-0.271-0.08l-8.5-5.5 C2.997,8.77,2.93,8.46,3.081,8.229c0.15-0.23,0.459-0.298,0.691-0.147L12,13.405l8.229-5.324c0.232-0.15,0.542-0.084,0.691,0.147 c0.15,0.232,0.083,0.542-0.148,0.691l-8.5,5.5C12.189,14.474,12.095,14.5,12,14.5z M20.934,16.248 C20.842,16.41,20.673,16.5,20.5,16.5c-0.084,0-0.169-0.021-0.248-0.065l-3.5-2c-0.24-0.137-0.323-0.442-0.186-0.682 s0.443-0.322,0.682-0.186l3.5,2C20.988,15.703,21.071,16.009,20.934,16.248z"/>
        </svg>
      </a>
    `,
  },
  {
    id: 'wishlist-share-button-link',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.get_link }}" data-wk-share-service="link" data-wk-share="{{ wishlist.permaId }}">
        <svg xmlns='https://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 512 512'>
          <path fill="currentColor" d='M459.654,233.373l-90.531,90.5c-49.969,50-131.031,50-181,0c-7.875-7.844-14.031-16.688-19.438-25.813
            l42.063-42.063c2-2.016,4.469-3.172,6.828-4.531c2.906,9.938,7.984,19.344,15.797,27.156c24.953,24.969,65.563,24.938,90.5,0
            l90.5-90.5c24.969-24.969,24.969-65.563,0-90.516c-24.938-24.953-65.531-24.953-90.5,0l-32.188,32.219
            c-26.109-10.172-54.25-12.906-81.641-8.891l68.578-68.578c50-49.984,131.031-49.984,181.031,0
            C509.623,102.342,509.623,183.389,459.654,233.373z M220.326,382.186l-32.203,32.219c-24.953,24.938-65.563,24.938-90.516,0
            c-24.953-24.969-24.953-65.563,0-90.531l90.516-90.5c24.969-24.969,65.547-24.969,90.5,0c7.797,7.797,12.875,17.203,15.813,27.125
            c2.375-1.375,4.813-2.5,6.813-4.5l42.063-42.047c-5.375-9.156-11.563-17.969-19.438-25.828c-49.969-49.984-131.031-49.984-181.016,0
            l-90.5,90.5c-49.984,50-49.984,131.031,0,181.031c49.984,49.969,131.031,49.969,181.016,0l68.594-68.594
            C274.561,395.092,246.42,392.342,220.326,382.186z'/>
        </svg>
      </a>
    `,
  },
  {
    id: 'wishlist-share-button-contact',
    data: 'wishlist',
    template: `
      <a href="#" class="wk-share-button" title="{{ locale.send_to_customer_service }}" data-wk-share-service="contact" data-wk-share="{{ wishlist.permaId }}">
        <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </a>
    `,
  },
];

window.addEventListener('load', () => {
  imagesHideLoader();
})

export default templates;
