curl -X 'POST' \
  'https://hsa-education-backend-dev.up.railway.app/books/d70c97de-26d6-4668-9455-dbbfd4cd0266/publish' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDcyY2FhYi1mYWQ5LTQwMzgtYTA3Ni02ZGUwNDUyZTgyNjMiLCJpYXQiOjE3Mzg4NzA1OTIsImV4cCI6MTczOTQ3NTM5Mn0.A8bigMs43wBTp-IEeHe0lBMYZQsS4I9MjIIXHFSsjw0' \
  -H 'Content-Type: application/json' \
  -d '{
  "quantity": 1,
  "version": 0
}'

// respone 

{
  "messages": "Success",
  "data": {
    "name": "Sách - Tôi là Mong - Xuất lần 7 ngày 2025-02-07.xls",
    "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 7 ngày 2025-02-07.xls",
    "time": "2025-02-07",
    "amount": 1,
    "timestamp": 1738899276863
  },
  "status_code": 200
}


curl -X 'GET' \
  'https://hsa-education-backend-dev.up.railway.app/books/d70c97de-26d6-4668-9455-dbbfd4cd0266/history-publish' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDcyY2FhYi1mYWQ5LTQwMzgtYTA3Ni02ZGUwNDUyZTgyNjMiLCJpYXQiOjE3Mzg4NzA1OTIsImV4cCI6MTczOTQ3NTM5Mn0.A8bigMs43wBTp-IEeHe0lBMYZQsS4I9MjIIXHFSsjw0'

// respone 
{
  "messages": "Success",
  "data": [
    {
      "name": "Sách - Tôi là Mong - Xuất lần 0 ngày 2025-02-07.xls",
      "url": "http://localhost:8350/uploads/book-921692/Sách - Tôi là Mong - Xuất lần 0 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738874250906
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 1 ngày 2025-02-07.xls",
      "url": "http://localhost:8350/uploads/book-921692/Sách - Tôi là Mong - Xuất lần 1 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875231196
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 2 ngày 2025-02-07.xls",
      "url": "http://localhost:8350/uploads/book-921692/Sách - Tôi là Mong - Xuất lần 2 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875336141
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 3 ngày 2025-02-07.xls",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 3 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875389382
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 4 ngày 2025-02-07.xls",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 4 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875497558
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 5 ngày 2025-02-07.xls",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 5 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875659654
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 6 ngày 2025-02-07.xls",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 6 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 10,
      "timestamp": 1738875689054
    },
    {
      "name": "Sách - Tôi là Mong - Xuất lần 7 ngày 2025-02-07.xls",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/Sách - Tôi là Mong - Xuất lần 7 ngày 2025-02-07.xls",
      "time": "2025-02-07",
      "amount": 1,
      "timestamp": 1738899276863
    }
  ],
  "status_code": 200
}

