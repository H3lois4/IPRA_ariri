"""Smoke test — verifica que todos os endpoints do backend respondem corretamente."""

import json
import sys
import os

# Ensure the ariri-app directory is on the path so 'backend' package resolves
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app, db


def run_tests():
    app = create_app()
    # Use a separate in-memory DB for tests
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True

    with app.app_context():
        db.drop_all()
        db.create_all()

    client = app.test_client()
    passed = 0
    failed = 0
    results = []

    def check(name, response, expected_status, check_fn=None):
        nonlocal passed, failed
        ok = response.status_code == expected_status
        detail = ""
        if ok and check_fn:
            try:
                ok = check_fn(response)
                if not ok:
                    detail = " (body check failed)"
            except Exception as e:
                ok = False
                detail = f" (exception: {e})"
        status = "PASS" if ok else "FAIL"
        if ok:
            passed += 1
        else:
            failed += 1
            detail = detail or f" (got {response.status_code})"
        results.append(f"  [{status}] {name}{detail}")

    # 1. GET /api/ping
    resp = client.get('/api/ping')
    check("GET /api/ping → 200 {status: ok}", resp, 200,
          lambda r: r.get_json().get("status") == "ok")

    # 2. GET /api/schedule
    resp = client.get('/api/schedule')
    check("GET /api/schedule → 200 with days", resp, 200,
          lambda r: "days" in r.get_json())

    # 3. POST /api/forms (valid)
    resp = client.post('/api/forms', data={
        'volunteer_name': 'Maria',
        'actions': json.dumps(['Evangelismo', 'Oração']),
        'full_name': 'João da Silva',
        'age': '45',
        'locality': 'Ariri',
        'description': 'Visita domiciliar',
    }, content_type='multipart/form-data')
    check("POST /api/forms → 201", resp, 201,
          lambda r: r.get_json().get("volunteer_name") == "Maria")

    # 4. GET /api/forms
    resp = client.get('/api/forms')
    check("GET /api/forms → 200 (list)", resp, 200,
          lambda r: isinstance(r.get_json(), list) and len(r.get_json()) >= 1)

    # 5. POST /api/posts (valid)
    resp = client.post('/api/posts', data={
        'volunteer_name': 'Pedro',
        'title': 'Primeiro dia',
        'description': 'Dia abençoado',
    }, content_type='multipart/form-data')
    check("POST /api/posts → 201", resp, 201,
          lambda r: r.get_json().get("title") == "Primeiro dia")

    # 6. GET /api/posts
    resp = client.get('/api/posts')
    check("GET /api/posts → 200 (list)", resp, 200,
          lambda r: isinstance(r.get_json(), list) and len(r.get_json()) >= 1)

    # 7. POST /api/receipts (valid)
    resp = client.post('/api/receipts', data={
        'title': 'Compra de materiais',
        'description': 'Materiais infantis',
    }, content_type='multipart/form-data')
    check("POST /api/receipts → 201", resp, 201,
          lambda r: r.get_json().get("title") == "Compra de materiais")

    # 8. GET /api/receipts
    resp = client.get('/api/receipts')
    check("GET /api/receipts → 200 (list)", resp, 200,
          lambda r: isinstance(r.get_json(), list) and len(r.get_json()) >= 1)

    # 9. GET /api/volunteers
    resp = client.get('/api/volunteers')
    check("GET /api/volunteers → 200", resp, 200,
          lambda r: isinstance(r.get_json(), list))

    # 10. POST /api/sync (valid batch)
    resp = client.post('/api/sync', json={
        'items': [
            {
                'id': 'sync-form-001',
                'type': 'form',
                'data': {
                    'volunteer_name': 'Ana',
                    'actions': ['Infantil'],
                },
                'created_at': '2025-07-15T10:00:00Z',
            },
            {
                'id': 'sync-post-001',
                'type': 'post',
                'data': {
                    'volunteer_name': 'Lucas',
                    'title': 'Sync test',
                },
                'created_at': '2025-07-15T11:00:00Z',
            },
        ]
    })
    check("POST /api/sync → 200 (batch)", resp, 200,
          lambda r: len(r.get_json().get("synced", [])) == 2)

    # Print results
    print("\n=== Backend Smoke Test Results ===")
    for line in results:
        print(line)
    print(f"\n  Total: {passed + failed} | Passed: {passed} | Failed: {failed}")

    if failed > 0:
        print("\n  ❌ Some tests FAILED!")
        sys.exit(1)
    else:
        print("\n  ✅ All tests PASSED!")
        sys.exit(0)


if __name__ == '__main__':
    run_tests()
