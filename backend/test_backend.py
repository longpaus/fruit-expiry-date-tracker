import pytest
import json
from server import app, db
from pathlib import Path
from datetime import datetime

content = Path(__file__).parent / "content"

@pytest.fixture
def client():
    app.config.update({'TESTING': True})
    with app.test_client() as client:
        db.drop_all()
        db.create_all()
        yield client

def test_register(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None

def test_register_password_mismatch(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "d"})
    assert resp.status_code == 400
    assert resp.data == b'"Passwords do not match"\n'

def test_register_empty_email(client):

    resp = client.post('/register', json = {"email":"", "name":"b", "password":"c", "passwordconfirmation": "d"})
    assert resp.status_code == 400
    assert resp.data == b'"Empty Email"\n'

def test_register_empty_name(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"", "password":"c", "passwordconfirmation": "d"})
    assert resp.status_code == 400
    assert resp.data == b'"Empty Name"\n'

def test_register_empty_password(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"", "passwordconfirmation": "d"})
    assert resp.status_code == 400
    assert resp.data == b'"Empty Password"\n'

def test_login(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None

    resp = client.post('/login', json = {"email":"a@gmail.com", "password":"c"})
    assert resp.status_code == 200
    assert resp.data is not None

def test_login_incorrect(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None

    resp = client.post('/login', json = {"email":"b@gmail.com", "password":"c"})
    assert resp.status_code == 401
    assert resp.data == b'Email or Password Incorrect'

def test_get_profile(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.get('/profile', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 200
    assert resp2.data is not None
    data = json.loads(resp2.data.decode('utf8').strip())
    assert data['email'] == "a@gmail.com"
    assert data['default_days'] == 3

def test_get_missing_profile(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    db.drop_all()
    db.create_all()
    
    resp2 = client.get('/profile', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 404
    assert resp2.data == b'User not found'

def test_post_profile(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"", "newpassword":"", "newpasswordconfirmation":"", "defaultdays":3},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'"Nothing new"\n'
    assert resp2.status_code == 200

def test_post_profile_change_password(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"c", "newpassword":"d", "newpasswordconfirmation":"d", "defaultdays":3},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'"Password changed"\n'
    assert resp2.status_code == 200

    resp = client.post('/login', json = {"email":"a@gmail.com", "password":"d"})
    assert resp.status_code == 200
    assert resp.data is not None

def test_post_profile_change_password_orignal_password_incorrect(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"e", "newpassword":"d", "newpasswordconfirmation":"d", "defaultdays":3},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'Passwords do not match'
    assert resp2.status_code == 401

    
def test_post_profile_change_password_new_password_mismatch(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"c", "newpassword":"d", "newpasswordconfirmation":"e", "defaultdays":3},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'new password does not match'
    assert resp2.status_code == 400

def test_post_profile_change_notification_day(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"c", "newpassword":"", "newpasswordconfirmation":"", "defaultdays":4},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'"Default notification day changed"\n'
    assert resp2.status_code == 200

    resp2 = client.get('/profile', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 200
    assert resp2.data is not None
    data = json.loads(resp2.data.decode('utf8').strip())
    assert data['email'] == "a@gmail.com"
    assert data['default_days'] == 4

def test_post_profile_change_notification_day_change_password(client):

    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/profile', json = {"password":"c", "newpassword":"d", "newpasswordconfirmation":"d", "defaultdays":4},headers = {"Authorization": "Bearer " + token})
    assert resp2.data == b'"Password changed and default notification day changed"\n'
    assert resp2.status_code == 200

    resp2 = client.get('/profile', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 200
    assert resp2.data is not None
    data = json.loads(resp2.data.decode('utf8').strip())
    assert data['email'] == "a@gmail.com"
    assert data['default_days'] == 4

    resp = client.post('/login', json = {"email":"a@gmail.com", "password":"d"})
    assert resp.status_code == 200
    assert resp.data is not None

def test_logout(client):
    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp2 = client.post('/logout', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 200
    assert resp2.data == b'You have been logged out'

    resp2 = client.get('/profile', headers = {"Authorization": "Bearer " + token})
    assert resp2.status_code == 401
    assert resp2.data == b'This user is logged out'


def test_prediction(client):
    resp = client.post('/register', json = {"email":"a@gmail.com", "name":"b", "password":"c", "passwordconfirmation": "c"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    resp = client.post('/prediction',data={"fruittype":"Apple", "latitude":"33.8688", "longitude":"151.2093","purchaseDate":"2024-11-6", "file": (content / "apple-day.jpg").open("rb")} ,headers = {"Authorization": "Bearer " + token})
    assert resp.status_code == 200
    assert b'days from now, which is' in resp.data 

def test_history(client):

    resp = client.post('/register', json = {"email":"joe@gmail.com", "name":"joe", "password":"joejoe123", "passwordconfirmation": "joejoe123"})
    assert resp.status_code == 201
    assert resp.data is not None
    token = json.loads(resp.data.decode('utf8').strip())["access_token"]

    # Test empty history page. 
    resp1 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=5&sort=temperature&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp1.status_code == 200
    assert resp1.data == str.encode("[[],0]\n")

    # Add multiple images to database using prediction page
    resp2 = client.post('/prediction', headers = {"Authorization": "Bearer " + token}, 
                        data = {"file": open('content/apple.JPG', 'rb'), "fruittype": "apple", "latitude": "0", "longitude": "0", "purchaseDate": "2024-05-10", "refrigerated": "true"})
    assert resp2.status_code == 200
    assert resp2.data is not None

    resp3 = client.post('/prediction', headers = {"Authorization": "Bearer " + token}, 
                        data = {"file": open('content/bananna.JPG', 'rb'), "fruittype": "bananna", "latitude": "0", "longitude": "0", "purchaseDate": "2024-05-10", "refrigerated": "true"})
    assert resp3.status_code == 200
    assert resp3.data is not None

    resp4 = client.post('/prediction', headers = {"Authorization": "Bearer " + token}, 
                        data = {"file": open('content/mango.JPG', 'rb'), "fruittype": "mango", "latitude": "0", "longitude": "0", "purchaseDate": "2024-05-10", "refrigerated": "true"})
    assert resp4.status_code == 200
    assert resp4.data is not None

    resp5 = client.post('/prediction', headers = {"Authorization": "Bearer " + token}, 
                        data = {"file": open('content/orange.JPG', 'rb'), "fruittype": "orange", "latitude": "0", "longitude": "0", "purchaseDate": "2024-05-10", "refrigerated": "true"})
    assert resp5.status_code == 200
    assert resp5.data is not None

    resp6 = client.post('/prediction', headers = {"Authorization": "Bearer " + token}, 
                        data = {"file": open('content/strawberry.JPG', 'rb'), "fruittype": "strawberry", "latitude": "0", "longitude": "0", "purchaseDate": "2024-05-10", "refrigerated": "true"})
    assert resp6.status_code == 200
    assert resp6.data is not None

    # Get history with 5 fruits
    resp7 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp7.status_code == 200
    result = json.loads(resp7.data.decode())
    assert result[0][0]["fruitType"] == "apple"
    assert result[0][1]["fruitType"] == "bananna"
    assert result[0][2]["fruitType"] == "mango"
    assert result[0][3]["fruitType"] == "orange"
    assert result[0][4]["fruitType"] == "strawberry"
    assert result[1] == 5

    # Get the image id for each of the images
    appleid = result[0][0]["imageId"]
    banannaid = result[0][1]["imageId"]
    mangoid = result[0][2]["imageId"]
    orangeid = result[0][3]["imageId"]
    strawberryid = result[0][4]["imageId"]

    # Test sorting by fruits, descending
    resp8 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=10&sort=fruitType&order=desc', headers = {"Authorization": "Bearer " + token})
    assert resp8.status_code == 200
    result = json.loads(resp8.data.decode())
    assert result[0][0]["fruitType"] == "strawberry"
    assert result[0][1]["fruitType"] == "orange"
    assert result[0][2]["fruitType"] == "mango"
    assert result[0][3]["fruitType"] == "bananna"
    assert result[0][4]["fruitType"] == "apple"
    assert result[1] == 5

    # Test using smaller page size
    resp9 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=3&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp9.status_code == 200
    result = json.loads(resp9.data.decode())
    assert result[0][0]["fruitType"] == "apple"
    assert result[0][1]["fruitType"] == "bananna"
    assert result[0][2]["fruitType"] == "mango"
    assert result[1] == 5
    assert len(result[0]) == 3

    # Test changing page numbers
    resp10 = client.get('/history?consumed=unhide&disposed=unhide&page=2&size=3&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp10.status_code == 200
    result = json.loads(resp10.data.decode())
    assert result[0][0]["fruitType"] == "orange"
    assert result[0][1]["fruitType"] == "strawberry"
    assert result[1] == 5
    assert len(result[0]) == 2

    # Test viewing image
    resp11 = client.get(f'/image?imageid={appleid}')
    assert resp11.status_code == 200
    appleimage = open('content/apple.JPG', 'rb')
    assert resp11.data == appleimage.read()

    # Test consuming
    resp12 = client.post(f'/history/consume?imageid={appleid}&days=4')
    assert resp12.status_code == 200
    resp13 = client.get('/history?consumed=hide&disposed=unhide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp13.status_code == 200
    result = json.loads(resp13.data.decode())
    assert result[1] == 4
    assert len(result[0]) == 4

    # Test unconsuming
    resp14 = client.post(f'/history/unconsume?imageid={appleid}')
    assert resp14.status_code == 200
    resp15 = client.get('/history?consumed=hide&disposed=unhide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp15.status_code == 200
    result = json.loads(resp15.data.decode())
    assert result[1] == 5
    assert len(result[0]) == 5

    # Test disposing
    resp16 = client.post(f'/history/dispose?imageid={appleid}&days=4')
    assert resp16.status_code == 200
    resp17 = client.get('/history?consumed=unhide&disposed=hide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp17.status_code == 200
    result = json.loads(resp17.data.decode())
    assert result[1] == 4
    assert len(result[0]) == 4

    # Test undisposing
    resp18 = client.post(f'/history/undispose?imageid={appleid}')
    assert resp18.status_code == 200
    resp19 = client.get('/history?consumed=unhide&disposed=hide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp19.status_code == 200
    result = json.loads(resp19.data.decode())
    assert result[1] == 5
    assert len(result[0]) == 5

    # Test changing notification days
    resp20 = client.post(f'/history/notification?imageid={appleid}&days=10')
    assert resp20.status_code == 200
    resp21 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp21.status_code == 200
    result = json.loads(resp21.data.decode())
    assert result[1] == 5
    assert result[0][0]["daysNotify"] == 10

    # Test alert
    resp22 = client.post(f'/history/notification?imageid={appleid}&days=100')
    assert resp22.status_code == 200
    resp23 = client.post(f'/history/notification?imageid={banannaid}&days=100')
    assert resp23.status_code == 200
    resp24 = client.post(f'/history/notification?imageid={orangeid}&days=100')
    assert resp24.status_code == 200
    resp25 = client.post(f'/history/notification?imageid={mangoid}&days=100')
    assert resp25.status_code == 200
    resp26 = client.post(f'/history/notification?imageid={strawberryid}&days=100')
    assert resp26.status_code == 200

    resp27 = client.get('/history/alert', headers = {"Authorization": "Bearer " + token})
    assert resp27.status_code == 200
    result = json.loads(resp27.data.decode())
    assert len(result) == 2

    # Test delete
    resp28 = client.delete(f'/history/delete?imageid={appleid}')
    assert resp28.status_code == 200
    resp29 = client.get('/history?consumed=unhide&disposed=unhide&page=1&size=10&sort=fruitType&order=asc', headers = {"Authorization": "Bearer " + token})
    assert resp29.status_code == 200
    result = json.loads(resp29.data.decode())
    assert result[1] == 4
