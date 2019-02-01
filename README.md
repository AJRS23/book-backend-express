- There is a new version of the API under /v2

- Add JWT authentication to the books app

- A register endpoint was added to register a new user
URI: /v2/user/
Request:
{
    username: “”,
    password: “”,
    customer: “”
}

- A login endpoint was added
URI: /v2/user/login
Request:
{
    username: “”,
    password: “”
}
Response:
{
    token: “”,
    customer: ""
}

- All the existing endpoints are also under /v2 but now requires a header named "auth-token" which is going to contain the token returned by the API on the login request

- A renew endpoint was added
URI: /v2/user/renew
Response:
{
    token: “”,
	customer: ""
}

*** Falta

Extra:
-(React Project)Add SASS support and change the styles to use SASS 
(you can use another tool for generating the project outline if you want and after just move your code)
- Add a feature to the user where all the opened sessions can be checked
(Including extra info like when the login was done, device/browser)
- Allow the user to revoke the access on one specific session, so if the 
access is revoked any action should be rejected on that specific session
