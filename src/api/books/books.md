curl -X 'POST' \
  'https://decf-2001-ee0-4001-801e-fd9b-3b81-f311-707.ngrok-free.app/books' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "avatar": "Test 1",
  "name": "Tesst 2",
  "tags": "",
  "authors": "",
  "expiration_date": 0,
  "description": "string",
  "publishing_house": "string",
  "subject": "Toán",
  "is_public": true,
}'

// response
{
  "messages": "Success",
  "data": {
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "take": 10,
      "total": 8
    },
    "data": [
      {
        "id": "dc3a3485-29a5-4692-a415-87c9d2452160",
        "created_at": "2024-12-29T13:05:10.187Z",
        "updated_at": "2024-12-29T13:05:10.187Z",
        "deleted_at": null,
        "code_id": 859883,
        "description": "1111",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "Test ",
        "name_search": "Test ",
        "avatar": "",
        "quantity": 0,
        "expiration_date": 12,
        "active": false,
        "publishing_house": null,
        "subject": null,
        "is_file": false,
        "file_download": null,
        "xlsx_files": [],
        "is_public": false,
        "book_tags": [
          {
            "id": "78d213b4-a1d5-4aff-b879-de76847f118a",
            "created_at": "2024-12-29T13:05:10.204Z",
            "updated_at": "2024-12-29T13:05:10.204Z",
            "deleted_at": null,
            "book_id": "dc3a3485-29a5-4692-a415-87c9d2452160",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "4e8d29b5-96cb-4930-8b8b-6d94beaf4aea",
            "created_at": "2024-12-29T13:05:10.204Z",
            "updated_at": "2024-12-29T13:05:10.204Z",
            "deleted_at": null,
            "book_id": "dc3a3485-29a5-4692-a415-87c9d2452160",
            "user_id": "37940275-1853-4d04-affa-e9415d360a81",
            "user": {
              "id": "37940275-1853-4d04-affa-e9415d360a81",
              "created_at": "2024-11-23T16:40:56.307Z",
              "updated_at": "2024-11-24T03:38:01.552Z",
              "deleted_at": null,
              "hash_password": "c20ad4d76fe97759aa27a0c99bff6710",
              "username": "2atccnode",
              "email": "atccnode21@gmail.com",
              "phone_number": "0234242233",
              "full_name": "Testb213",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732381904855.png",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "a3a4f63d-afb4-443c-9660-e6bfcb36d4ab",
        "created_at": "2024-12-15T13:47:09.400Z",
        "updated_at": "2024-12-15T13:51:10.884Z",
        "deleted_at": null,
        "code_id": 115554,
        "description": "abcdderc",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "Tung Test",
        "name_search": "Tung Test",
        "avatar": "https://api.hsabook.vn/uploads/2024-12-15/1734270407738.png",
        "quantity": 10,
        "expiration_date": 1,
        "active": true,
        "publishing_house": null,
        "subject": null,
        "is_file": false,
        "file_download": null,
        "xlsx_files": [
          {
            "name": "Sách - Tung Test - Xuất lần 0 ngày 2024-12-15.xls",
            "url": "http://localhost:8346/uploads/book-115554/Sách - Tung Test - Xuất lần 0 ngày 2024-12-15.xls",
            "time": "2024-12-15",
            "amount": 10,
            "timestamp": 1734270670878
          }
        ],
        "is_public": false,
        "book_tags": [
          {
            "id": "86ab20c4-9bc9-45f9-a4e6-a6d4022e3299",
            "created_at": "2024-12-15T13:47:09.464Z",
            "updated_at": "2024-12-15T13:47:09.464Z",
            "deleted_at": null,
            "book_id": "a3a4f63d-afb4-443c-9660-e6bfcb36d4ab",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "83125dea-bb7d-4852-8d59-0d00d0795373",
            "created_at": "2024-12-15T13:47:09.490Z",
            "updated_at": "2024-12-15T13:47:09.490Z",
            "deleted_at": null,
            "book_id": "a3a4f63d-afb4-443c-9660-e6bfcb36d4ab",
            "user_id": "44940508-4c38-48cd-82cc-188fa4fb871f",
            "user": {
              "id": "44940508-4c38-48cd-82cc-188fa4fb871f",
              "created_at": "2024-11-22T14:06:22.737Z",
              "updated_at": "2024-11-22T14:06:22.737Z",
              "deleted_at": null,
              "hash_password": "0c8abdb962f042d1857c66dd26b0c87b",
              "username": "tungpv03",
              "email": "tungpv03.work@gmail.com",
              "phone_number": "0345498163",
              "full_name": "Pham Viet Tung",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-22/1732284378888.jpg",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "204b5ba3-32a6-4d6d-a9f2-1be52a7231d4",
        "created_at": "2024-12-04T00:12:32.482Z",
        "updated_at": "2024-12-08T13:10:24.133Z",
        "deleted_at": null,
        "code_id": 603246,
        "description": "",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "whales",
        "name_search": "whales",
        "avatar": "https://api.hsabook.vn/uploads/2024-12-08/1733658445455.png",
        "quantity": 1185,
        "expiration_date": 1,
        "active": true,
        "publishing_house": null,
        "subject": null,
        "is_file": true,
        "file_download": "http://localhost:8346/uploads/2024-12-08/1733646896980.docx",
        "xlsx_files": [
          {
            "name": "Sách - whales - Xuất lần 1 ngày 2024-12-05.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 1 ngày 2024-12-05.xls",
            "time": "2024-12-05"
          },
          {
            "name": "Sách - whales - Xuất lần 1 ngày 2024-12-05.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 1 ngày 2024-12-05.xls",
            "time": "2024-12-05"
          },
          {
            "name": "Sách - whales - Xuất lần 2 ngày 2024-12-05.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 2 ngày 2024-12-05.xls",
            "time": "2024-12-05"
          },
          {
            "name": "Sách - whales - Xuất lần 3 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 3 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "timestamp": 1733594058718
          },
          {
            "name": "Sách - whales - Xuất lần 4 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 4 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733594144463
          },
          {
            "name": "Sách - whales - Xuất lần 5 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 5 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 111,
            "timestamp": 1733598079893
          },
          {
            "name": "Sách - whales - Xuất lần 6 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 6 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 10,
            "timestamp": 1733598169221
          },
          {
            "name": "Sách - whales - Xuất lần 7 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 7 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 10,
            "timestamp": 1733598318961
          },
          {
            "name": "Sách - whales - Xuất lần 8 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 8 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598350335
          },
          {
            "name": "Sách - whales - Xuất lần 9 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 9 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598382762
          },
          {
            "name": "Sách - whales - Xuất lần 10 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 10 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598423248
          },
          {
            "name": "Sách - whales - Xuất lần 11 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 11 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598465329
          },
          {
            "name": "Sách - whales - Xuất lần 12 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 12 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598530366
          },
          {
            "name": "Sách - whales - Xuất lần 13 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 13 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598553096
          },
          {
            "name": "Sách - whales - Xuất lần 14 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 14 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598620531
          },
          {
            "name": "Sách - whales - Xuất lần 15 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 15 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598674182
          },
          {
            "name": "Sách - whales - Xuất lần 16 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 16 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598893221
          },
          {
            "name": "Sách - whales - Xuất lần 17 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 17 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733598956153
          },
          {
            "name": "Sách - whales - Xuất lần 18 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 18 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733599063479
          },
          {
            "name": "Sách - whales - Xuất lần 19 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 19 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733599247639
          },
          {
            "name": "Sách - whales - Xuất lần 20 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 20 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 1,
            "timestamp": 1733599309778
          },
          {
            "name": "Sách - whales - Xuất lần 21 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 21 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 10,
            "timestamp": 1733632576564
          },
          {
            "name": "Sách - whales - Xuất lần 22 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-603246/Sách - whales - Xuất lần 22 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 10,
            "timestamp": 1733663424131
          }
        ],
        "is_public": false,
        "book_tags": [
          {
            "id": "e0217d19-ba67-4843-863a-ba9c140d8356",
            "created_at": "2024-12-08T11:47:34.112Z",
            "updated_at": "2024-12-08T11:47:34.112Z",
            "deleted_at": null,
            "book_id": "204b5ba3-32a6-4d6d-a9f2-1be52a7231d4",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "227360e2-d0e0-4896-a5a0-9b97994f3661",
            "created_at": "2024-12-08T11:47:34.156Z",
            "updated_at": "2024-12-08T11:47:34.156Z",
            "deleted_at": null,
            "book_id": "204b5ba3-32a6-4d6d-a9f2-1be52a7231d4",
            "user_id": "3ead6a72-8afa-4d36-9155-efb0470db5ba",
            "user": {
              "id": "3ead6a72-8afa-4d36-9155-efb0470db5ba",
              "created_at": "2024-11-24T15:48:26.720Z",
              "updated_at": "2024-11-24T15:49:02.643Z",
              "deleted_at": null,
              "hash_password": "6939b06f19351ae65b534108577cffdf",
              "username": "Test1",
              "email": "thuy210499@gmail.com",
              "phone_number": "0374357435",
              "full_name": "Lê Thị Thủy",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732463340578.png",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "61f2316c-0ab1-4552-8d66-3de4b002efb1",
        "created_at": "2024-11-25T15:12:45.658Z",
        "updated_at": "2024-12-07T20:22:49.095Z",
        "deleted_at": null,
        "code_id": 723916,
        "description": "##",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "mmon",
        "name_search": "mmon",
        "avatar": "https://api.hsabook.vn/uploads/2024-11-25/1732547552880.png",
        "quantity": 420,
        "expiration_date": 1,
        "active": true,
        "publishing_house": "Báo Kim Đồng ",
        "subject": "Toan",
        "is_file": true,
        "file_download": "https://api.hsabook.vn/uploads/2024-12-02/1733143040832.docx",
        "xlsx_files": [
          {
            "name": "Sách - mmon - Xuất lần 0 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-723916/Sách - mmon - Xuất lần 0 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 100,
            "timestamp": 1733602965655
          },
          {
            "name": "Sách - mmon - Xuất lần 1 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-723916/Sách - mmon - Xuất lần 1 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 100,
            "timestamp": 1733602967623
          },
          {
            "name": "Sách - mmon - Xuất lần 2 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-723916/Sách - mmon - Xuất lần 2 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 100,
            "timestamp": 1733602968037
          },
          {
            "name": "Sách - mmon - Xuất lần 3 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-723916/Sách - mmon - Xuất lần 3 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 100,
            "timestamp": 1733602969041
          }
        ],
        "is_public": false,
        "book_tags": [
          {
            "id": "5d34d7fc-eaef-4cf6-bd2b-24db9f1b5523",
            "created_at": "2024-12-01T09:02:33.718Z",
            "updated_at": "2024-12-01T09:02:33.718Z",
            "deleted_at": null,
            "book_id": "61f2316c-0ab1-4552-8d66-3de4b002efb1",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "5424f7a3-5f6c-414f-8ae4-e748fdeab132",
            "created_at": "2024-12-01T09:02:33.723Z",
            "updated_at": "2024-12-01T09:02:33.723Z",
            "deleted_at": null,
            "book_id": "61f2316c-0ab1-4552-8d66-3de4b002efb1",
            "user_id": "37940275-1853-4d04-affa-e9415d360a81",
            "user": {
              "id": "37940275-1853-4d04-affa-e9415d360a81",
              "created_at": "2024-11-23T16:40:56.307Z",
              "updated_at": "2024-11-24T03:38:01.552Z",
              "deleted_at": null,
              "hash_password": "c20ad4d76fe97759aa27a0c99bff6710",
              "username": "2atccnode",
              "email": "atccnode21@gmail.com",
              "phone_number": "0234242233",
              "full_name": "Testb213",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732381904855.png",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "e16938ba-f059-4ac4-8928-89eed724ff3a",
        "created_at": "2024-11-24T15:58:35.468Z",
        "updated_at": "2024-12-07T20:23:03.629Z",
        "deleted_at": null,
        "code_id": 219414,
        "description": "",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "[Thuy test] Sách Toán",
        "name_search": "[Thuy test] Sach Toan",
        "avatar": "",
        "quantity": 112,
        "expiration_date": 1,
        "active": true,
        "publishing_house": null,
        "subject": null,
        "is_file": false,
        "file_download": null,
        "xlsx_files": [
          {
            "name": "Sách - [Thuy test] Sách Toán - Xuất lần 0 ngày 2024-12-08.xls",
            "url": "http://localhost:8346/uploads/book-219414/Sách - [Thuy test] Sách Toán - Xuất lần 0 ngày 2024-12-08.xls",
            "time": "2024-12-08",
            "amount": 10,
            "timestamp": 1733602983575
          }
        ],
        "is_public": false,
        "book_tags": [
          {
            "id": "48dbc281-689c-4cb8-ab26-98a632066c72",
            "created_at": "2024-11-24T16:09:41.437Z",
            "updated_at": "2024-11-24T16:09:41.437Z",
            "deleted_at": null,
            "book_id": "e16938ba-f059-4ac4-8928-89eed724ff3a",
            "tag_id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
            "user_id": null,
            "tag": {
              "id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
              "created_at": "2024-11-23T18:09:36.510Z",
              "updated_at": "2024-11-23T18:09:36.510Z",
              "deleted_at": null,
              "description": "xzxxxx",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "[Mong test nghiệm thu]",
              "name_search": "category [Mong test nghiem thu]",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          },
          {
            "id": "bf6dbb15-6a5d-43bf-8a49-5e1722f15b6d",
            "created_at": "2024-11-24T16:09:41.437Z",
            "updated_at": "2024-11-24T16:09:41.437Z",
            "deleted_at": null,
            "book_id": "e16938ba-f059-4ac4-8928-89eed724ff3a",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "94c0742f-00ab-42a9-91bb-5934d3338d9f",
            "created_at": "2024-11-24T16:09:41.453Z",
            "updated_at": "2024-11-24T16:09:41.453Z",
            "deleted_at": null,
            "book_id": "e16938ba-f059-4ac4-8928-89eed724ff3a",
            "user_id": "19dd3d86-6db4-4288-b513-09c7be9a9379",
            "user": {
              "id": "19dd3d86-6db4-4288-b513-09c7be9a9379",
              "created_at": "2024-11-03T14:30:23.859Z",
              "updated_at": "2024-11-03T14:30:23.859Z",
              "deleted_at": null,
              "hash_password": "e10adc3949ba59abbe56e057f20f883e",
              "username": "teacher3",
              "email": "teacher3@example.com",
              "phone_number": "09904195113",
              "full_name": "teacher3",
              "avatar": null,
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "2de8021c-1292-4c3c-8149-acfb3eb1fc16",
        "created_at": "2024-11-24T11:04:14.175Z",
        "updated_at": "2024-12-15T08:28:07.824Z",
        "deleted_at": null,
        "code_id": 975224,
        "description": "No content",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "Cấu trúc dữ liệu và Giải thuật",
        "name_search": "Cau truc du lieu va Giai thuat",
        "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732446222652.jpg",
        "quantity": 116,
        "expiration_date": 1,
        "active": true,
        "publishing_house": null,
        "subject": null,
        "is_file": true,
        "file_download": "https://api.hsabook.vn/uploads/2024-11-24/1732460054467.docx",
        "xlsx_files": [
          {
            "name": "Sách - Cấu trúc dữ liệu và Giải thuật - Xuất lần 0 ngày 2024-12-15.xls",
            "url": "http://localhost:8346/uploads/book-975224/Sách - Cấu trúc dữ liệu và Giải thuật - Xuất lần 0 ngày 2024-12-15.xls",
            "time": "2024-12-15",
            "amount": 10,
            "timestamp": 1734251287810
          }
        ],
        "is_public": false,
        "book_tags": [
          {
            "id": "1dda0b50-fba1-43a2-a87e-cd7939b9c212",
            "created_at": "2024-11-24T16:13:00.369Z",
            "updated_at": "2024-11-24T16:13:00.369Z",
            "deleted_at": null,
            "book_id": "2de8021c-1292-4c3c-8149-acfb3eb1fc16",
            "tag_id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
            "user_id": null,
            "tag": {
              "id": "1fb337a2-fec8-49fd-a3dc-c3e7f7722123",
              "created_at": "2024-11-24T11:03:35.200Z",
              "updated_at": "2024-11-24T11:03:35.200Z",
              "deleted_at": null,
              "description": "IT Books",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "IT",
              "name_search": "IT",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "2889df1b-4f2a-4edc-8dae-1f8af950e70d",
            "created_at": "2024-11-24T16:13:00.384Z",
            "updated_at": "2024-11-24T16:13:00.384Z",
            "deleted_at": null,
            "book_id": "2de8021c-1292-4c3c-8149-acfb3eb1fc16",
            "user_id": "44940508-4c38-48cd-82cc-188fa4fb871f",
            "user": {
              "id": "44940508-4c38-48cd-82cc-188fa4fb871f",
              "created_at": "2024-11-22T14:06:22.737Z",
              "updated_at": "2024-11-22T14:06:22.737Z",
              "deleted_at": null,
              "hash_password": "0c8abdb962f042d1857c66dd26b0c87b",
              "username": "tungpv03",
              "email": "tungpv03.work@gmail.com",
              "phone_number": "0345498163",
              "full_name": "Pham Viet Tung",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-22/1732284378888.jpg",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "ad7e4302-a24b-4ac9-944b-ee568ce92e76",
        "created_at": "2024-11-23T18:23:48.526Z",
        "updated_at": "2024-11-24T15:55:47.695Z",
        "deleted_at": null,
        "code_id": 272681,
        "description": "Test ",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "Sách Văn",
        "name_search": "Sach toan",
        "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732386204981.svg",
        "quantity": 400,
        "expiration_date": 1,
        "active": true,
        "publishing_house": "Báo Kim Đồng ",
        "subject": "Toan",
        "is_file": true,
        "file_download": "https://api.hsabook.vn/uploads/2024-11-24/1732463239591.docx",
        "xlsx_files": null,
        "is_public": false,
        "book_tags": [
          {
            "id": "1775bce9-2554-4c3a-889a-bcc72e0b1cbe",
            "created_at": "2024-11-24T09:55:56.643Z",
            "updated_at": "2024-11-24T09:55:56.643Z",
            "deleted_at": null,
            "book_id": "ad7e4302-a24b-4ac9-944b-ee568ce92e76",
            "tag_id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
            "user_id": null,
            "tag": {
              "id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
              "created_at": "2024-11-23T18:09:36.510Z",
              "updated_at": "2024-11-23T18:09:36.510Z",
              "deleted_at": null,
              "description": "xzxxxx",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "[Mong test nghiệm thu]",
              "name_search": "category [Mong test nghiem thu]",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "c9449695-1d89-402a-ad31-6928642b70b3",
            "created_at": "2024-11-24T09:55:56.649Z",
            "updated_at": "2024-11-24T09:55:56.649Z",
            "deleted_at": null,
            "book_id": "ad7e4302-a24b-4ac9-944b-ee568ce92e76",
            "user_id": "18e5eba9-e6f2-4580-9658-212a441a8d73",
            "user": {
              "id": "18e5eba9-e6f2-4580-9658-212a441a8d73",
              "created_at": "2024-11-17T14:09:27.093Z",
              "updated_at": "2024-11-17T14:09:27.093Z",
              "deleted_at": null,
              "hash_password": "81dc9bdb52d04dc20036dbd8313ed055",
              "username": "toantran0512",
              "email": "atccnode@gmail.com",
              "phone_number": "093424223",
              "full_name": "at",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-17/1731852523068.svg",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      },
      {
        "id": "c708f02e-3d62-4e33-9a59-4ed26101135b",
        "created_at": "2024-11-23T18:10:12.406Z",
        "updated_at": "2024-11-24T13:08:06.849Z",
        "deleted_at": null,
        "code_id": 777106,
        "description": "###",
        "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
        "name": "Sách [Mong Test nghiệm thu ]",
        "name_search": "Sach [Mong Test nghiem thu ]",
        "avatar": "https://api.hsabook.vn/uploads/2024-11-24/1732385397603.png",
        "quantity": 197,
        "expiration_date": 1,
        "active": true,
        "publishing_house": "Báo Kim Đồng ",
        "subject": "Toan",
        "is_file": true,
        "file_download": "https://api.hsabook.vn/uploads/2024-11-24/1732453686846.docx",
        "xlsx_files": null,
        "is_public": false,
        "book_tags": [
          {
            "id": "59de030b-e652-411d-b96e-1ed20a321858",
            "created_at": "2024-11-23T18:39:01.186Z",
            "updated_at": "2024-11-23T18:39:01.186Z",
            "deleted_at": null,
            "book_id": "c708f02e-3d62-4e33-9a59-4ed26101135b",
            "tag_id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
            "user_id": null,
            "tag": {
              "id": "7f90a313-d4a5-4f30-9bb5-105bb38cf759",
              "created_at": "2024-11-23T18:09:36.510Z",
              "updated_at": "2024-11-23T18:09:36.510Z",
              "deleted_at": null,
              "description": "xzxxxx",
              "user_id": "2dcab833-7e42-498e-bebb-bd9da4a2e5b2",
              "updated_by": null,
              "deleted_by": null,
              "name": "[Mong test nghiệm thu]",
              "name_search": "category [Mong test nghiem thu]",
              "avatar": null,
              "parent_id": null,
              "_constructor-name_": "CategoryEntity"
            },
            "_constructor-name_": "BookTagsEntity"
          }
        ],
        "authors": [
          {
            "id": "260f5113-03f9-432b-a683-476765c01ff7",
            "created_at": "2024-11-23T18:39:01.207Z",
            "updated_at": "2024-11-23T18:39:01.207Z",
            "deleted_at": null,
            "book_id": "c708f02e-3d62-4e33-9a59-4ed26101135b",
            "user_id": "18e5eba9-e6f2-4580-9658-212a441a8d73",
            "user": {
              "id": "18e5eba9-e6f2-4580-9658-212a441a8d73",
              "created_at": "2024-11-17T14:09:27.093Z",
              "updated_at": "2024-11-17T14:09:27.093Z",
              "deleted_at": null,
              "hash_password": "81dc9bdb52d04dc20036dbd8313ed055",
              "username": "toantran0512",
              "email": "atccnode@gmail.com",
              "phone_number": "093424223",
              "full_name": "at",
              "avatar": "https://api.hsabook.vn/uploads/2024-11-17/1731852523068.svg",
              "description": null,
              "role": "teacher",
              "rank": null,
              "status": "active",
              "book_visits": [],
              "_constructor-name_": "UserEntity"
            },
            "_constructor-name_": "AuthorEntity"
          }
        ]
      }
    ]
  },
  "status_code": 200
}