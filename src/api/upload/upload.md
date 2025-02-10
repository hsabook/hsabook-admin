curl -X 'POST' \
  'https://api.hsabook.vn/media/upload' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@h5xgq2ddld4mfb3amlxjwkx645985qth.jpg;type=image/jpeg'

// response

{
  "messages": "Success",
  "data": {
    "url": "https://api.hsabook.vn/uploads/2024-12-29/1735459563256.jpg"
  },
  "status_code": 200
}