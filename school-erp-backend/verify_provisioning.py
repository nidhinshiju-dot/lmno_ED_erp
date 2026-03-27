import requests
import time
import json
import uuid

BASE_URL = "http://localhost:8080/api/v1"
AUTH_URL = "http://localhost:8081/api/v1/auth"
CORE_URL = "http://localhost:8083/api/v1"

def print_result(name, passed, msg=""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name} {msg}")

def test_student_create_auth_up():
    print("\n--- Testing Student Create with Auth UP ---")
    payload = {
        "name": "Test Student AuthUp",
        "dob": "2010-01-01",
        "parentContact": f"987654{int(time.time())%10000}"
    }
    r = requests.post(f"{CORE_URL}/students", json=payload)
    if r.status_code == 200 or r.status_code == 201:
        student = r.json()
        print_result("Student Creation API", True)
        
        # Wait a bit for async provisioning
        time.sleep(2)
        
        # Verify status
        r2 = requests.get(f"{CORE_URL}/students/{student['id']}")
        if r2.status_code == 200:
            s_data = r2.json()
            if s_data.get("provisioningStatus") == "PROVISIONED":
                print_result("Async Provisioning (Auth UP) persisted status", True)
                return True
            else:
                print_result("Async Provisioning (Auth UP) persisted status", False, f"Status={s_data.get('provisioningStatus')}")
    else:
        print_result("Student Creation API", False, f"HTTP {r.status_code}: {r.text}")
    return False

def test_staff_create_auth_down():
    print("\n--- Testing Staff Create with Auth DOWN ---")
    # Tell user to stop auth-service externally, then run this.
    payload = {
        "name": "Test Staff AuthDown",
        "department": "Science",
        "designation": "Teacher",
        "phone": f"887654{int(time.time())%10000}"
    }
    r = requests.post(f"{CORE_URL}/staff", json=payload)
    if r.status_code == 200 or r.status_code == 201:
        staff = r.json()
        print_result("Staff Creation API (Auth Down) didn't fail synchronously", True)
        time.sleep(2)
        r2 = requests.get(f"{CORE_URL}/staff/{staff['id']}")
        if r2.status_code == 200:
            s_data = r2.json()
            if s_data.get("provisioningStatus") == "FAILED":
                print_result("Async Provisioning caught failure and updated status", True)
                return staff['id']
            else:
                print_result("Async Provisioning caught failure", False, f"Status={s_data.get('provisioningStatus')}")
    else:
        print_result("Staff Creation API (Auth Down)", False, f"HTTP {r.status_code}")
    return None

def test_idempotency():
    print("\n--- Testing /auth/provision Idempotency ---")
    payload = {
        "email": "idemp@test.com",
        "role": "TEACHER",
        "referenceId": "ref-123"
    }
    # First call
    r1 = requests.post(f"{AUTH_URL}/provision", json=payload)
    if r1.status_code == 200:
        id1 = r1.json().get("id")
        
        # Second call
        r2 = requests.post(f"{AUTH_URL}/provision", json=payload)
        if r2.status_code == 200:
            id2 = r2.json().get("id")
            if id1 == id2:
                print_result("Auth Idempotency (Same ID returned)", True)
            else:
                print_result("Auth Idempotency", False, "Different IDs returned")
        else:
            print_result("Auth Idempotency (Second Request)", False, f"HTTP {r2.status_code}")
    else:
        print_result("Auth Idempotency (First Request)", False, f"HTTP {r1.status_code}")

def test_admin_retry(staff_id):
    print("\n--- Testing Admin API Retry ---")
    r = requests.post(f"{CORE_URL}/provisioning/retry/staff/{staff_id}")
    if r.status_code == 200:
        print_result("Admin Retry API Accepted", True)
        time.sleep(2)
        r2 = requests.get(f"{CORE_URL}/staff/{staff_id}")
        if r2.status_code == 200 and r2.json().get("provisioningStatus") == "PROVISIONED":
            print_result("Retry successfully provisioned staff", True)
        else:
            print_result("Retry provision status check", False)
    else:
        print_result("Admin Retry API Accepted", False, f"HTTP {r.status_code}")

if __name__ == "__main__":
    print("Running Verification script. Make sure services are UP.")
    test_student_create_auth_up()
    test_idempotency()
