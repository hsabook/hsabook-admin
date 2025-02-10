curl 'https://api.hsabook.vn/menu-book/?book_id=a3a4f63d-afb4-443c-9660-e6bfcb36d4ab&page=1&take=10&sort_type=ASC&sort_field=created_at' \
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

  // respone
  {
  "messages": "Success",
  "data": {
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "take": 10,
      "total": 1
    },
    "data": [
      {
        "id": "4e043f85-c526-4d83-93f4-bff4f8c08876",
        "created_at": "2024-12-15T13:50:00.246Z",
        "updated_at": "2024-12-15T13:50:00.246Z",
        "book_id": "a3a4f63d-afb4-443c-9660-e6bfcb36d4ab",
        "type": "DE",
        "parent_id": null,
        "title": "Đề 1",
        "cover": "https://api.hsabook.vn/uploads/2024-12-15/1734270579523.png",
        "code_id": "00681",
        "active": true,
        "order": 194,
        "exam_id": "9089c556-197c-41c8-8981-7c6e91ef762a",
        "exam": {
          "id": "9089c556-197c-41c8-8981-7c6e91ef762a",
          "file_download": "http://localhost:8346/uploads/2024-12-01/E00077[CODE].docx",
          "_constructor-name_": "ExamsEntity"
        },
        "children": []
      }
    ]
  },
  "status_code": 200
}