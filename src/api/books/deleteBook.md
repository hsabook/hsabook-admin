curl -X 'DELETE' \
  'https://api.hsabook.vn/books/c9cb2f60-9aa3-49f5-94f4-770b0fc0776f' \
  -H 'accept: */*'

// respone 
{
  "messages": "Success",
  "data": true,
  "status_code": 200
}

// respone error 
{
  "timestamp": "2024-12-29T12:22:41.751Z",
  "error": "Bad Request",
  "message": "Không thể xóa sách đã xuất bản",
  "statusCode": 400
}