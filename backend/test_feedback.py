import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_feedback():
    # 1. Login
    login_data = {
        "username": "student.anna@example.com",
        "password": "student123"
    }
    print(f"Logging in as {login_data['username']}...")
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # Get User ID
    resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
    user = resp.json()
    user_id = user["id"]
    print(f"User ID: {user_id}, Role: {user['role']}")

    # 2. Get Courses
    resp = requests.get(f"{BASE_URL}/courses/", headers=headers)
    if resp.status_code != 200:
        print(f"List courses failed: {resp.status_code} {resp.text}")
        return
    courses = resp.json()
    if not courses:
        print("No courses found.")
        return
    course = courses[0]
    print(f"Selected Course: {course['id']} - {course['name']}")

    # 3. Get Lessons
    resp = requests.get(f"{BASE_URL}/lessons/?course_id={course['id']}", headers=headers)
    if resp.status_code != 200:
        print(f"List lessons failed: {resp.status_code} {resp.text}")
        return
    lessons = resp.json()
    if not lessons:
        print("No lessons found.")
        return
    
    # Try to find a lesson without feedback? Can't easily check that, but will try existing ones.
    # Anna has feedback for Lesson 0 (actually lesson with index 0 in seed).
    # Let's try the first lesson found.
    lesson = lessons[0]
    print(f"Selected Lesson: {lesson['id']} - {lesson['topic']}")

    # 4. Create Feedback
    # Check if feedback exists first to avoid unique constraint if possible?
    # No endpoint to check "my feedback for this lesson" easily without filtering list.
    
    feedback_data = {
        "lesson_id": lesson['id'],
        "student_id": user_id,
        "rating": 5,
        "comment": "Test feedback from script",
        "is_hidden": False
    }

    print("Attempting to create feedback...")
    resp = requests.post(f"{BASE_URL}/feedback/", json=feedback_data, headers=headers)
    
    if resp.status_code == 201:
        print("Feedback created successfully!")
        print(resp.json())
    else:
        print(f"Feedback creation failed: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    test_feedback()
