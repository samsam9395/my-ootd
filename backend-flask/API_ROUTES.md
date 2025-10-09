# Closet API Routes

## Auth

- `POST /api/auth/signup` → Create new user
- `POST /api/auth/login` → Fetch user info
- `POST /api/auth/refresh` → Fetch new access token with refresh key
- `POST /api/auth/logout` → Revoke access token, delete cookie

## Clothes

- `GET /api/clothes?type=${category}&limit=${limit}&offset=${offset}` → Fetch cloth items by category and pagination
- `POST /api/clothes` → Create new cloth item (without image)
- `PUT /api/clothes/<id>` → Update cloth item (without image)
- `PUT /api/clothes/<id>/image` → Update cloth item's image
- `DELETE /api/clothes/<id>` → Delete cloth item (TODO)
- `GET /api/clothes/random` → Fetch random cloth items

## Styles

- `GET /api/style-tags` → Fetch style tags
- `POST /api/style-tags` → Add new style tags
- `POST /api/clothes/cloth_styles` → Associate styles to cloth item

## Recommendations (service endpoints)

- `POST /api/recommendations/ai` → AI outfit recommendations
