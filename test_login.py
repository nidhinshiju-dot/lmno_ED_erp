import urllib.request
import json

url = "http://localhost:8090/api/v1/auth/login"
data = json.dumps({"email": "superadmin1@schoolerp.app", "password": "SuperAdmin@2026"}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

try:
    req = urllib.request.Request(url, data=data, headers=headers)
    response = urllib.request.urlopen(req)
    print("STATUS:", response.status)
    print("BODY:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("BODY:", e.read().decode('utf-8'))
