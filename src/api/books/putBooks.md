curl -X 'PUT' \
  'https://decf-2001-ee0-4001-801e-fd9b-3b81-f311-707.ngrok-free.app/books/031fe9f8-04d2-4fb7-b537-1e66f60a0d57' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "expiration_date": 1000,
  "is_public": false,
  "avatar": "xxxxx",
  "name": "xxxxxx",
  "tags": "b3621f9a-1852-49dc-90cf-29db6a6171a2",
  "authors": "9416b249-3a53-452a-a8e5-2b266cdcf305",
  "description": "string",
  "publishing_house": "string",
  "subject": "Toán"
}'

// respone
{
  "messages": "Success",
  "data": true,
  "status_code": 200
}