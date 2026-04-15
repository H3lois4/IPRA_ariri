import urllib.request
import urllib.parse
import json

BASE = 'http://127.0.0.1:5000'

# Test POST /api/forms via real HTTP
boundary = '----FormBoundary123'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="volunteer_name"\r\n\r\nTeste HTTP\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="actions"\r\n\r\n["Evangelismo"]\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="people_served"\r\n\r\n2\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req = urllib.request.Request(
    f'{BASE}/api/forms',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
    method='POST'
)

try:
    resp = urllib.request.urlopen(req)
    print(f'Form POST: {resp.status} {resp.read().decode()}')
except urllib.error.HTTPError as e:
    print(f'Form POST ERROR: {e.code} {e.read().decode()}')

# Test POST /api/posts
body2 = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="volunteer_name"\r\n\r\nTeste\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="title"\r\n\r\nMeu Post\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req2 = urllib.request.Request(
    f'{BASE}/api/posts',
    data=body2,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
    method='POST'
)

try:
    resp2 = urllib.request.urlopen(req2)
    print(f'Post POST: {resp2.status} {resp2.read().decode()}')
except urllib.error.HTTPError as e:
    print(f'Post POST ERROR: {e.code} {e.read().decode()}')
