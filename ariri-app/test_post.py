import sys
sys.path.insert(0, 'ariri-app')
from backend.app import create_app, db

app = create_app()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ariri-app/backend/ariri.db'

with app.app_context():
    db.create_all()

client = app.test_client()

# Test form POST
import json
r = client.post('/api/forms', data={
    'volunteer_name': 'Teste',
    'actions': json.dumps(['Evangelismo', 'Oração']),
    'people_served': '5',
    'description': 'teste desc'
}, content_type='multipart/form-data')
print('Form POST:', r.status_code, r.get_json())

# Test post POST
r2 = client.post('/api/posts', data={
    'volunteer_name': 'Teste',
    'title': 'Meu post',
    'description': 'desc post'
}, content_type='multipart/form-data')
print('Post POST:', r2.status_code, r2.get_json())

# Test receipt POST
r3 = client.post('/api/receipts', data={
    'title': 'Compra',
    'description': 'materiais'
}, content_type='multipart/form-data')
print('Receipt POST:', r3.status_code, r3.get_json())

# Test GET
r4 = client.get('/api/forms')
print('Forms GET:', r4.status_code, len(r4.get_json()), 'forms')

r5 = client.get('/api/posts')
print('Posts GET:', r5.status_code, len(r5.get_json()), 'posts')

r6 = client.get('/api/receipts')
print('Receipts GET:', r6.status_code, len(r6.get_json()), 'receipts')

# Test ping
r7 = client.get('/api/ping')
print('Ping:', r7.status_code, r7.get_json())

# Test verify-pin
r8 = client.post('/api/verify-pin', json={'pin': '1234'})
print('PIN correct:', r8.status_code, r8.get_json())

r9 = client.post('/api/verify-pin', json={'pin': '0000'})
print('PIN wrong:', r9.status_code, r9.get_json())
