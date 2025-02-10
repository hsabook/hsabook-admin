curl -X 'GET' \
  'https://api.hsabook.vn/categories?take=100&page=1' \
  -H 'accept: */*'
  
// response

{
  "messages": "Success",
  "data": {
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "take": 100,
      "total": 2
    },
    "data": [
      {
        "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
        "name": "IT",
        "description": "IT Books",
        "created_at": "2024-11-24T11:03:35.200Z",
        "quantity_book": 0,
        "parent_id": null,
        "children": []
      },
      {
        "id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
        "name": "category [Mong test nghiệm thu]",
        "description": "xzxxxx",
        "created_at": "2024-11-23T18:09:36.510Z",
        "quantity_book": 0,
        "parent_id": null,
        "children": []
      }
    ]
  },
  "status_code": 200
}