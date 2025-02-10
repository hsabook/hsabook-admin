curl 'https://api.hsabook.vn/menu-book/4e043f85-c526-4d83-93f4-bff4f8c08876' \
  -X 'DELETE' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-US,en;q=0.9,vi;q=0.8' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGNhYjgzMy03ZTQyLTQ5OGUtYmViYi1iZDlkYTRhMmU1YjIiLCJpYXQiOjE3MzYwMTgxNzAsImV4cCI6MTczNjYyMjk3MH0.65KooXGT8sN5y-0t3KHKfM6zaRhe1i-08P14SBvDEWc' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Origin: http://localhost:3001' \
  -H 'Pragma: no-cache' \
  -H 'Referer: http://localhost:3001/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: cross-site' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"'

  // response error
  {
  "timestamp": "2025-01-05T12:16:02.572Z",
  "error": "Bad Request",
  "message": "Sách đã xuất bản không thể xóa",
  "statusCode": 400
}