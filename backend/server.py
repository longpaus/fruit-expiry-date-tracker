from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, desc
from flask_praetorian import Praetorian, auth_required, current_user_id
from flask_cors import CORS
from datetime import datetime, timedelta, date
import uuid
from weather import get_temperature, get_humidity
import atexit
from flask_apscheduler import APScheduler
from flask_mailman import Mail, EmailMessage
import requests
from dotenv import load_dotenv
import os
import math
import sys

# Image Constants
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
DEFAULT_PICTURE_PATH = 'Asset/Default.png'

# Temperature Formula Constants

R = 8.314 # Universal Gas Constant
EA = 50000  # Activation Energy of the degradation reaction
T0 = 298.15 # Base Temperature in Kelvin
H0 = 50 # Inital Relative Humidity
B = 0.5 # Humidity Sensitivity Coefficient

load_dotenv()
# Initalise the flask app
app = Flask(__name__)

# Flask Configs
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///core.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 5}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
app.config['PRAETORIAN_ROLES_DISABLED'] = True
app.config['DEFAULT_ROLES_DISABLED'] = True
app.config['SCHEDULER_API_ENABLED'] = True
# Mail config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'digitalhaven42@gmail.com'
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_API_KEY')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

# Initalise the database, JWT token libray, CORS and Scheduler
db = SQLAlchemy()
guard = Praetorian()
cors = CORS()
scheduler = APScheduler()
mail = Mail()

# Create database model
# Stores User Information
class users(db.Model):
    id = db.Column(db.String(100), primary_key = True)
    username = db.Column(db.String(50), nullable = False)
    email = db.Column(db.String(120), nullable = False, unique = True)
    password = db.Column(db.String(50), nullable = False)
    profile_picture = db.Column(db.LargeBinary, default = None)
    default_days = db.Column(db.Integer) # default value for notifications

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    @property # Praetorian library requires roles for tokens even when roles are disabled in config
    def rolenames(self):
        return []

# Stores images and their metadata
class images(db.Model):
    pid = db.Column(db.Integer, primary_key = True)
    id = db.Column("id", db.ForeignKey(users.id))
    prediction = db.Column(db.Integer)
    feedback = db.Column(db.Integer)
    upload_date = db.Column(db.DateTime, default=datetime.now(), nullable = False)
    purchase_date = db.Column(db.DateTime)
    consumed = db.Column(db.Boolean, default=False)
    consume_date = db.Column(db.DateTime, default=None)
    fruit = db.Column(db.String(20))
    temperature = db.Column(db.Integer)
    humidity =  db.Column(db.Integer)
    notification_days = db.Column(db.Integer, default=0)
    disposed = db.Column(db.Boolean, default=False)
    dispose_date = db.Column(db.DateTime, default=None)
    data = db.Column(db.LargeBinary)
    notified = db.Column(db.Boolean, default = False)

    def __repr__(self):
        return '<PID %r>' % self.pid

# List of Tokens which have been logged out but have no expired
class token_blacklist(db.Model):
    token = db.Column(db.String(400), primary_key = True)
    expiry_date = db.Column(db.DateTime, nullable = False)

    def __repr__(self):
        return '<Token %r>' % self.token




# create the database if it does not exist
app.app_context().push()
db.init_app(app)
with app.app_context():
    db.create_all()

# Initialize the flask-praetorian instance for the app
guard.init_app(app, users)

# Initializes CORS
cors.init_app(app)

# Initalizes Background scheduler
scheduler.init_app(app)
scheduler.start()

# Initalizer mailer
mail.init_app(app)

#HELPER FUNCTIONS --------------------------------------------------------------------------------------

# Checks if the token has been logged out
def isTokenInBlacklist(token):
    dbToken = token_blacklist.query.filter_by(token=token).one_or_none()
    if dbToken is None:
        return False
    return True

# Checks if the file is in correct format
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Adjusts the predicted shelf life based on storage conditions
def Temp_formula(temp, humidity, shelflife):
    # Convert Celsius to Kelvin
    t = temp + 273.15

    # Temperature adjustment factor (Arrhenius component)
    temp_factor = math.exp((EA / R) * ((1 / T0) - (1 / t)))

    # Humidity adjustment factor
    humidity_factor = (H0 / humidity) ** B

    # Calculate new shelf life
    sl = shelflife * temp_factor * humidity_factor
    result = math.floor(sl)

    return result


# SCHEDULED FUNCTIONS ----------------------------------------------------------------------------------

# Every 2 hours clears tokens which have expired for the blacklist
@scheduler.task('interval', id='blacklist', hours = 2)
def ClearBlacklist():
    with scheduler.app.app_context():
        query = token_blacklist.query.all()
        counter = 0
        for token in query:
            if token.expiry_date < datetime.now():
                db.session.delete(token)
                db.session.commit()
                counter += 1
        print(f"{counter} Tokens cleared from the blacklist")


# Every 3 hours sends and email alert to users about approaching expiry dates
@scheduler.task('interval', id='Alert', hours = 3)
def EmailAlert():
    with scheduler.app.app_context():
        print(f"Scheduled Mailing Cycle Started")
        counter = 0
        query = images.query.all()
        for image in query:
            if image.prediction:
                if image.upload_date + timedelta(days=image.prediction) <= datetime.now() + timedelta(days=image.notification_days):
                    if image.notified is False:
                        image.notified = True
                        counter += 1
                        db.session.commit()
                        email = users.query.filter_by(id = image.id).first().email
                        msg = EmailMessage(
                            "Expiry Alert",
                            f"{image.fruit.title()}({image.id}) which was purchased on {image.purchase_date.date()} is about to expire in {((image.upload_date + timedelta(days=image.prediction)) - datetime.now()).days} days",
                            "digitalhaven42@gmail.com",
                            [f"{email}"]
                        )
                        msg.send()
                        print(f"mailsent to {email}")
        print(f"Scheduled Mailing Cycle Finished")




# USER FUNCTIONS ----------------------------------------------------------------------------------

@app.route('/register', methods=['POST'])
def user_register():
    """
    Route to create and login new user
    Args:
        email(string): Email of the user
        name(string): Username of the user
        password(string): Password of the user
        passwordconfirmation(string): Repeat of user's password for confirmation

    return: JWT token for authentication
    """
    user_data = request.json
    user_email = user_data.get("email")
    user_name = user_data.get("name")
    user_password = user_data.get("password")
    user_password_confirmation = user_data.get("passwordconfirmation")
    user_id = str(uuid.uuid4())


    if user_email is None or user_email == "" :
        return jsonify("Empty Email"), 400

    if user_name is None or user_name == "" :
        return jsonify("Empty Name"), 400

    if user_password is None or user_password == "" :
        return jsonify("Empty Password"), 400
    # Check if inputted passwords match

    if user_password != user_password_confirmation:
        return jsonify("Passwords do not match"), 400

    # Check if the email is already in the database
    email_query = users.query.filter_by(email=user_email).first()
    if email_query is not None:
        return jsonify("Email is already registered"), 409

    # Check if the id is already in the database
    id_query = users.query.filter_by(id=user_id).first()
    while id_query is not None:
        user_id = str(uuid.uuid4())
        id_query = users.query.filter_by(id=user_id).first()

    with open(DEFAULT_PICTURE_PATH, 'rb' ) as file:
        blobdata = file.read()

    user = users(id=user_id, username=user_name, email=user_email, password=user_password, profile_picture=blobdata, default_days = 3)
    db.session.add(user)
    db.session.commit()

    # Test
    all_users = users.query.all()
    for user in all_users:
        print(f"User ID: {user.id}, Username: {user.username}, Email: {user.email}")
    ret = {'access_token': guard.encode_jwt_token(user)}
    return jsonify(ret), 201


@app.route('/login', methods=['POST'])
def user_login():
    """
    Route for user login
    Args:
        email(string): Email of the user
        password(string): password of the user

    return: JWT token for authentication
    """

    # Retrieving request data
    user_data = request.json
    user_email = user_data.get("email")
    user_password = user_data.get("password")

    # Query database for matching email and password pair
    user = users.query.filter_by(email=user_email,password=user_password).first()
    # all_users = users.query.all()
    # for user in all_users:
    #     print(f"User ID: {user.id}, Username: {user.username}, Email: {user.email}")
    print(user)
    if user is not None:
        ret = {'access_token': guard.encode_jwt_token(user)}
        return jsonify(ret), 200

    return "Email or Password Incorrect", 401


# Under the assumption that email can not be changed
@app.route('/profile', methods=['GET', 'POST'])
@auth_required
def view_profile():
    """
    Route for getting and editing the user profile

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

     POST Args:
        password(string): Password of the user
        newpassword(string): New password of the user
        newpasswordconfirmation(string): Repeat of user's new password for confirmation

    return:
        GET: Returns current user email
        POST: Returns new password(FOR TESTING)
    """
    print(guard.read_token_from_header())
    # Checks if the user's token is blacklisted via logout
    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401


    id = current_user_id()


    if request.method == 'GET':
        # Queries and returns profile data that should be autofilled
        user = users.query.filter_by(id=id).first()
        if user is None:
                return "User not found", 404
        return {"email":user.email, "default_days": user.default_days}, 200
    else:
        # Retrieving request data
        profile_input = request.json
        user_password = profile_input.get("password")
        new_password = profile_input.get("newpassword")
        new_password_confirmation = profile_input.get("newpasswordconfirmation")
        notification_days = profile_input.get("defaultdays")

        return_string = ""
        user = users.query.filter_by(id=id).first()
        if user is None:
                return "User not found", 404


        if new_password != "" and new_password_confirmation != "":
            if user.password != user_password:
                return "Passwords do not match", 401
            if new_password != new_password_confirmation:
                return "new password does not match", 400
            user.password = new_password
            return_string = "Password changed"

        if user.default_days != notification_days:
            user.default_days = notification_days
            if return_string == "":
                return_string = "Default notification day changed"
            else:
                return_string += " and default notification day changed"

        db.session.commit()
        if return_string == "":
            return_string = "Nothing new"

        return jsonify(return_string),200


@app.route('/logout', methods=['POST'])
def user_logout():
    """
    Route for user logout

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    return: Logout message and status code
    """

    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is already logged out", 401
    # Stores the token and its expiry date in the DB to prevent use unauthorized use of old tokens
    BlackToken = token_blacklist(token=guard.read_token_from_header(),expiry_date=datetime.fromtimestamp(guard.extract_jwt_token(guard.read_token_from_header())['exp']))
    db.session.add(BlackToken)
    db.session.commit()

    return "You have been logged out", 200


# IMAGE/VIDEO FUNCTIONS ---------------------------------------------------------------------------
@app.route('/profile/picture/view', methods=['GET'])
@auth_required
def get_picture():

    """
    Route to view profile picture

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    return: image
    """

    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401

    id = current_user_id()

    # Queries and returns profile data that should be autofilled
    user = users.query.get_or_404(id)
    return user.profile_picture


@app.route('/profile/picture', methods=['POST'])
@auth_required
def add_picture():
    """
    Route to add a new profile picture

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    Args:
        file(file): Password of the user


    return: image
    """
    # Checks if the user's token is blacklisted via logout
    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401


    id = current_user_id()

    file = request.files["file"]
    user = users.query.filter_by(id=id).first()
    user.profile_picture = None
    user.profile_picture = file.read()
    db.session.commit()

    return user.profile_picture

@app.route('/prediction', methods=['POST'])
@auth_required
def add_content():
    """
    Route to add a new photo/video

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    Args:
        file(file): Password of the user
        newpassword(string): New password of the user
        newpasswordconfirmation(string): Repeat of user's new password for confirmation


    return: Status code
    """
    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401

    # Retrieve data from request
    file = request.files["file"]
    fruit_type = request.form.get("fruittype")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    purchase_date = request.form.get("purchaseDate")
    refrigerated = False
    if request.form.get("refrigerated") == 'true':
        refrigerated = True

    # Check if location data exists
    if latitude == "" or longitude == "":
        return "Please allow access to location", 400

    # Checks if the file exists
    if file.filename == "":
        return "Upload a file", 400

    # Checks if image is in wrong format
    if not allowed_file(file.filename):
        return "Upload png or jpeg image only", 400

    # Generate new image id
    image_id = uuid.uuid4().int & (1<<32) -1
    # Check if the uid is already in the database
    pid_query = images.query.filter_by(pid=image_id).first()
    while pid_query is not None:
        image_id = uuid.uuid4().int & (1<<32) -1
        pid_query = images.query.filter_by(pid=image_id).first()


    # Get temperature and humidity from weather api from city
    if refrigerated:
        temperature = 3
        humidity = 40
    else:
        temperature = get_temperature(latitude, longitude)
        humidity = get_humidity(latitude, longitude)

    user = users.query.filter_by(id= current_user_id()).first()
    file = file.read() # Save binary to a variable so it can be used twice.

    # Access AI server to get prediction

    if "PYTEST_CURRENT_TEST" in os.environ:
        url = "http://localhost:8000/predict"
    else:
        url = "http://ml:8000/predict"

    response = requests.post(url=url, files={'file': file})
    try:
        predicted_expiry = response.json()["results"][0]["prediction"]
        if predicted_expiry == "expired":
            return "Product is already expired!", 406

        predicted_expiry = predicted_expiry.split(" ")[0]
    except:
        return "No fruit detected in image!", 406
    # Process prediction result (convert to integer and get average)
    day_range = list(map(int, predicted_expiry.split("-")))
    avg = round(sum(day_range) / len(day_range))
    shelflife = Temp_formula(temperature,humidity,avg)
    prediction = (date.today() + timedelta(days=shelflife)).strftime("%d/%m/%Y") # Expiry Date

    print(purchase_date)
    # Add image metadata to database
    image = images(pid = image_id,
    id = current_user_id(),
    prediction = shelflife,
    feedback = None,
    upload_date = datetime.now(),
    purchase_date = datetime.strptime(purchase_date, '%Y-%m-%d').date(),
    consume_date = None,
    fruit = fruit_type.lower(),
    temperature = temperature,
    humidity =  humidity,
    notification_days = user.default_days,
    consumed = False,
    data = file)

    db.session.add(image)
    db.session.commit()

    return f"Expiry is {shelflife} days from now, which is {prediction}", 200



@app.route('/history', methods=['GET'])
@auth_required
def get_user_records():

    """
    Route to Retrieve History of Predictions

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    Example: /history?consumed=unhide&disposed=unhide&page=1&size=5&sort=temperature&order=asc


    return: Return List of Dictionaries and Count of rows
    """

    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401

    query = request.args.to_dict(flat=False)

    uid = current_user_id() # Get User ID
    if query["consumed"][0] == "hide":
        filters = images.query.filter_by(id=uid, consumed=False)
    else:
        filters = images.query.filter_by(id=uid)

    if query["disposed"][0] == "hide":
        filters = filters.filter_by(id=uid, disposed=False)

    count = filters.count()

    order_with = None
    match query["sort"][0]:
        case "imageId": order_with = "pid"
        case "fruitType": order_with = "fruit"
        case "uploadTime": order_with = "upload_date"
        case "humidity": order_with = "humidity"
        case "temperature": order_with = "temperature"
        case "purchaseDate": order_with = "purchase_date"
        case "expiryDate": order_with = "prediction"
        case "daysNotify": order_with = "notification_days"
        case "consumeDate": order_with = "consume_date"
        case "disposeDate": order_with = "dispose_date"

    if query["order"][0] == "desc":
        filters = filters.order_by(desc(text(order_with)))
    else:
        filters = filters.order_by(text(order_with))


    offset = (int(query["page"][0])-1)*int(query["size"][0])
    filters = filters.offset(offset).limit(int(query["size"][0]))

    result = []
    for image in filters.all():
        # Convert prediction(integer days) to a date
        if image.prediction:
            prediction = image.upload_date + timedelta(days=image.prediction)
        else:
            prediction = None

        result.append({
            "imageId": image.pid,
            "fruitType": image.fruit,
            "uploadTime": image.upload_date,
            "humidity": image.humidity,
            "temperature": image.temperature,
            "purchaseDate": image.purchase_date,
            "expiryDate": prediction,
            "daysNotify": image.notification_days,
            "consumed": image.consumed,
            "consumedDate": image.consume_date,
            "disposed": image.disposed,
            "disposedDate": image.dispose_date
            })

    return jsonify(result, count)

@app.route('/history/unconsume', methods=['POST'])
def unconsume():
    """
    Route to change the consumed status of an image

    Example usage: /history/unconsume?imageid=1

    return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    consume_image = images.query.filter_by(pid=image_id).first()
    if not consume_image:
        return "Image id not found", 404

    # Check if image is already disposed
    if consume_image.disposed:
        return "Image already disposed. Cannot unconsume", 409

    consume_image.consume_date = None
    consume_image.consumed = not consume_image.consumed
    db.session.commit()

    return "Image consumption status changed", 200

@app.route('/history/consume', methods=['POST'])
def consume():
    """
    Route to directly change the consumed date of the image

    Example usage: /history/consume?imageid=4&days=4

    Return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    consume_image = images.query.filter_by(pid=image_id).first()
    if not consume_image:
        return "Image id not found", 404

    # Check if image is already disposed
    if consume_image.disposed:
        return "Image already disposed. Cannot consume", 409

    # Change the consumed date to todays date minus days
    days_ago = int(request.args.get('days'))
    consume_image.consume_date = datetime.now() - timedelta(days_ago)

    consume_image.consumed = True
    db.session.commit()

    return "Image consumption date changed", 200

@app.route('/history/undispose', methods=['POST'])
def undispose():
    """
    Route to change the disposed status of an image

    Example usage: /history/undispose?imageid=1

    Return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    dispose_image = images.query.filter_by(pid=image_id).first()
    if not dispose_image:
        return "Image id not found", 404

    # Check if image is already consumed
    if dispose_image.consumed:
        return "Image already consumed. Cannot undispose", 409

    dispose_image.dispose_date = None
    dispose_image.disposed = not dispose_image.disposed
    db.session.commit()

    return "Image disposed status changed", 200

@app.route('/history/dispose', methods=['POST'])
def dispose():
    """
    Route to directly change the disposed date of the image

    Example usage: /history/dispose?imageid=4&days=4

    Return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    dispose_image = images.query.filter_by(pid=image_id).first()
    if not dispose_image:
        return "Image id not found", 404

    # Check if image is already consumed
    if dispose_image.consumed:
        return "Image already consumed. Cannot dispose", 409

    # Change the consumed date to todays date minus days
    days_ago = int(request.args.get('days'))
    dispose_image.dispose_date = datetime.now() - timedelta(days_ago)

    dispose_image.disposed = True
    db.session.commit()

    return "Image disposed date changed", 200

@app.route('/history/notification', methods=['POST'])
def notification_days():
    """
    Route to change expiry notification days for an image

    Example usage: /history/notification?imageid=1&days=1

    Return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    selected_image = images.query.filter_by(pid=image_id).first()
    if not selected_image:
        return "Image id not found", 404

    selected_image.notification_days = int(request.args.get('days'))
    db.session.commit()

    return "Notification days changed", 200

@app.route('/history/delete', methods=['DELETE'])
def delete():
    """
    Route to delete a selected image

    Example usage: /history/delete?imageid=1

    Return: 200 for success, 404 if imageid not found
    """

    image_id = int(request.args.get('imageid'))
    delete_image = images.query.filter_by(pid=image_id).first()
    if not delete_image:
        return "Image id not found", 404

    db.session.delete(delete_image)
    db.session.commit()

    return "Image Deleted", 200

@app.route('/history/alert', methods=['GET'])
@auth_required
def alert():
    """

    Route to get nearly expired products from database for history page popup

    Example usage: /history/alert

    Return: 200 for success, 404 if imageid not found
    """

    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401

    uid = current_user_id() # Get User ID

    # Get all not consumed images
    non_consumed = images.query.filter_by(id=uid, consumed=False, disposed=False)

    counter = 1
    result = []
    for image in non_consumed.all():
        if not image.prediction: continue

        # Convert prediction(integer days) to a date
        prediction = image.upload_date + timedelta(days=image.prediction)

        # If [today's date] is within [[expiry date] minus [notification days]] and [expiry date]
        if (prediction - timedelta(days=image.notification_days)) <= datetime.now() <= prediction:
            result.append({
                "seq": counter,
                "imageId": image.pid,
                "fruitType": image.fruit,
                "uploadTime": image.upload_date,
                "humidity": image.humidity,
                "temperature": image.temperature,
                "purchaseDate": image.purchase_date,
                "expiryDate": prediction,
                "daysNotify": image.notification_days,
                })

        counter += 1

    return result


@app.route('/image', methods=['GET'])
def get_image():
    """
    Route to retreive an image

    Example usage: /image?imageid=1

    Return: image
    """
    image_id = int(request.args.get('imageid'))
    image = images.query.filter_by(pid=image_id).first()
    return image.data


# Not Currently In Use
@app.route('/history', methods=['POST'])
@auth_required
def add_feedback():
    """
    Route to add feedback expiry date

    Header:
        Requires token in header in format:
        Authorization : Bearer <INSERT JWT TOKEN>

    return:
    """
    if isTokenInBlacklist(guard.read_token_from_header()):
        return "This user is logged out", 401

    return

# On App Close shutdown scheduler process
atexit.register(lambda: scheduler.shutdown(wait=False))

if __name__ == '__main__':
    app.run(port=5005)
