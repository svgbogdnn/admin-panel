import sqlite3
import os

db_path = 'app.db'

if not os.path.exists(db_path):
    print("DB not found")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("--- USERS ---")
for row in c.execute('SELECT id, email, is_superuser FROM users'):
    print(row)

print("\n--- COURSES ---")
for row in c.execute('SELECT id, name, teacher_id FROM courses'):
    print(row)

conn.close()
