chmod +x quick-test.sh                                                             
joshi@Sumits-MacBook-Air node-api % chmod +x quick-test.sh
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}' 
{"success":true,"message":"User registered successfully","data":{"user":{"id":1,"email":"test@example.com","fullName":"Test User","createdAt":"2025-11-16T09:59:10.894Z"}}}%                                                                             
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}' 
{"success":false,"error":{"code":"EMAIL_EXISTS","message":"Email is already registered"}}%                                                                            
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
{"success":true,"message":"Login successful","data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzI4NzI2MCwiZXhwIjoxNzYzMjg4MTYwfQ.tja6Nz2QU7FF5ewTectfB7_lPtJYz_tJugJ1vRy1P-U","refreshToken":"ba7bcdaa-fc84-4307-8272-5741b6d8eeda","user":{"id":1,"email":"test@example.com","fullName":"Test User"}}}%                                            
joshi@Sumits-MacBook-Air node-api %   curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"Test@123456","fullName":"Test User1"}'
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Validation failed","details":{"fullName":["Full name can only contain letters and spaces"]}}}%         
joshi@Sumits-MacBook-Air node-api %   curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456","fullName":"Test User1"}'
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Validation failed","details":{"fullName":["Full name can only contain letters and spaces"]}}}%         
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456"}'
{"success":false,"error":{"code":"INVALID_CREDENTIALS","message":"Invalid email or password"}}%                                                                       
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456","fullName":"Test Do"}'
{"success":true,"message":"User registered successfully","data":{"user":{"id":2,"email":"testtoday@example.com","fullName":"Test Do","createdAt":"2025-11-16T10:05:03.573Z"}}}%                                                                          
joshi@Sumits-MacBook-Air node-api %   curl -X POST 
  http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456"}'
curl: (2) no URL specified
curl: try 'curl --help' or 'curl --manual' for more information
zsh: no such file or directory: http://localhost:3000/api/auth/login
joshi@Sumits-MacBook-Air node-api %   curl -X POST http://localhost:3000/api/auth/login \                                 
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456"}'
{"success":true,"message":"Login successful","data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGVzdHRvZGF5QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYzMjg3Njc4LCJleHAiOjE3NjMyODg1Nzh9.08tLC8Aq721nq6Aylkuj3X5e3ZM08FcTxONTyO_RYbY","refreshToken":"27ab955a-28a0-40d1-87a8-a52b3715f882","user":{"id":2,"email":"testtoday@example.com","fullName":"Test Do"}}}%                                   
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
{"success":true,"data":{"user":{"id":1,"email":"test@example.com","fullName":"Test User","createdAt":"2025-11-16T09:59:10.000Z","lastLogin":"2025-11-16T10:01:00.000Z"}}}%                                                                               
joshi@Sumits-MacBook-Air node-api % chmod +x test-all.sh
joshi@Sumits-MacBook-Air node-api % chmod +x test-all.sh
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com","password":"Test@123456","fullName":"Bhupesh User"}'
{"success":true,"message":"User registered successfully","data":{"user":{"id":3,"email":"bhupesh@example.com","fullName":"Bhupesh User","createdAt":"2025-11-16T10:20:37.685Z"}}}%                                                                       
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com","password":"Test@123456"}'
{"success":true,"message":"Login successful","data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYmh1cGVzaEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzI4ODQ0NywiZXhwIjoxNzYzMjg5MzQ3fQ.5mnoLGJLLLnMSmx-GECXXoDlORpvrpAjMkcdZFe-Y88","refreshToken":"337179bf-0277-476b-bfe1-efd303c32b1a","user":{"id":3,"email":"bhupesh@example.com","fullName":"Bhupesh User"}}}%                                  
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com"}'
{"success":true,"data":{"user":{"id":3,"email":"bhupesh@example.com","fullName":"Bhupesh User","createdAt":"2025-11-16T10:20:37.000Z","lastLogin":"2025-11-16T10:20:47.000Z"}}}%                                                                         
joshi@Sumits-MacBook-Air node-api % curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com"}'
{"success":true,"message":"Logout successful - all sessions cleared"}%             
joshi@Sumits-MacBook-Air node-api % 