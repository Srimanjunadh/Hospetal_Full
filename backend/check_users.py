import sqlite3
conn = sqlite3.connect('medichain.db')
c = conn.cursor()
res = c.execute('SELECT username, role FROM users').fetchall()
for r in res:
    print(r)
conn.close()
