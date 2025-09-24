# Closet API Routes

## Clothes

- `POST /api/clothes` → Create new cloth item
- `PUT /api/clothes/<id>` → Update cloth item
- `DELETE /api/clothes/<id>` → Delete cloth item (TODO)
- `GET /api/clothes/random` → Fetch random cloth items

## Styles

- `GET /api/style-tags` → Fetch style tags
- `POST /api/style-tags` → Add new style tags
- `POST /api/clothes/<id>/styles` → Associate styles to cloth item

## Recommendations (service endpoints)

- `POST /api/recommendations/cosine` → Cosine similarity recommendations
- `POST /api/recommendations/ai` → AI outfit recommendations
